const faunadb = require('faunadb');
const q = faunadb.query;
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY
});

// Fisher-Yates shuffle algorithm
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get all participants
        const result = await client.query(
            q.Map(
                q.Paginate(q.Documents(q.Collection('participants'))),
                q.Lambda('ref', q.Get(q.Var('ref')))
            )
        );

        const participants = result.data.map(item => ({
            id: item.ref.id,
            ref: item.ref,
            ...item.data
        }));

        if (participants.length < 2) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Need at least 2 participants to draw names' })
            };
        }

        // Check if draw already happened
        if (participants.some(p => p.assigned)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Draw has already been completed!' })
            };
        }

        // Create assignments
        const givers = [...participants];
        const receivers = shuffle([...participants]);

        // Make sure no one gets themselves
        for (let i = 0; i < givers.length; i++) {
            if (givers[i].id === receivers[i].id) {
                // Swap with next person
                const nextIndex = (i + 1) % receivers.length;
                [receivers[i], receivers[nextIndex]] = [receivers[nextIndex], receivers[i]];
            }
        }

        // Send emails and update database
        const emailPromises = [];
        const updatePromises = [];

        for (let i = 0; i < givers.length; i++) {
            const giver = givers[i];
            const receiver = receivers[i];

            // Prepare email
            const msg = {
                to: giver.email,
                from: process.env.SENDGRID_FROM_EMAIL || 'secretsanta@Aecon.com',
                subject: '🎅 Your Secret Santa Assignment!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f9ff; border-radius: 10px;">
                        <h1 style="color: #c41e3a; text-align: center;">🎅 Your Secret Santa Assignment! 🎄</h1>
                        
                        <p style="font-size: 16px;">Hi ${giver.name}!</p>
                        
                        <p style="font-size: 16px;">The draw has happened, and you are the Secret Santa for:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #c41e3a;">
                            <h2 style="color: #c41e3a; margin-top: 0;">${receiver.name}</h2>
                            
                            <h3 style="color: #165b33;">Their Preferences:</h3>
                            <ul style="line-height: 1.8;">
                                <li><strong>Collects/Loves to Receive:</strong> ${receiver.preferences.collectOrReceive}</li>
                                <li><strong>Favorite Store/Brand:</strong> ${receiver.preferences.favoriteStore}</li>
                                <li><strong>Coffee/Tea Preference:</strong> ${receiver.preferences.coffeeTea}</li>
                                <li><strong>Favorite Hobby/Interest:</strong> ${receiver.preferences.hobby}</li>
                                <li><strong>Wishlist Items:</strong> ${receiver.preferences.wishlist}</li>
                            </ul>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #92400e; margin-top: 0;">📅 Event Details:</h3>
                            <p style="color: #92400e; margin: 5px 0;"><strong>Date:</strong> December 19th, 2025</p>
                            <p style="color: #92400e; margin: 5px 0;"><strong>Time:</strong> 1:00 PM</p>
                            <p style="color: #92400e; margin: 5px 0;"><strong>Budget:</strong> Around $25</p>
                            <p style="color: #92400e; margin: 5px 0;"><strong>Don't forget:</strong> Bring a dish to share for our potluck!</p>
                        </div>
                        
                        <p style="font-size: 16px; text-align: center; color: #165b33; font-weight: bold;">
                            🤫 Remember: Keep it secret! 🤫
                        </p>
                        
                        <p style="font-size: 14px; text-align: center; color: #64748b; margin-top: 30px;">
                            Happy shopping and see you on December 19th!<br>
                            🎄 Aecon Team 🎄
                        </p>
                    </div>
                `
            };

            emailPromises.push(sgMail.send(msg));

            // Update participant as assigned
            updatePromises.push(
                client.query(
                    q.Update(giver.ref, {
                        data: {
                            assigned: true,
                            assignedTo: receiver.id,
                            assignedAt: q.Now()
                        }
                    })
                )
            );
        }

        // Execute all emails and updates
        await Promise.all([...emailPromises, ...updatePromises]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully drew names and sent ${givers.length} emails!`
            })
        };

    } catch (error) {
        console.error('Draw error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to complete draw. Please try again.' })
        };
    }
};