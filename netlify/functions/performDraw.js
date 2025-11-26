const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');
        const configCollection = database.collection('config');

        // Check if draw already performed
        const config = await configCollection.findOne({ key: 'drawCompleted' });
        if (config && config.value === true) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Draw has already been performed!' })
            };
        }

        // Get all participants
        const participants = await collection.find({}).toArray();

        if (participants.length < 2) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Need at least 2 participants!' })
            };
        }

        // Shuffle algorithm (Fisher-Yates)
        const shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Assign Secret Santa (each person gets the next person in shuffled array)
        const assignments = [];
        for (let i = 0; i < shuffled.length; i++) {
            const giver = shuffled[i];
            const receiver = shuffled[(i + 1) % shuffled.length]; // Wrap around to first person

            assignments.push({
                giver: giver.name,
                giverEmail: giver.email,
                receiver: receiver.name,
                receiverEmail: receiver.email,
                receiverPreferences: receiver.preferences
            });
        }

        // Send emails to all participants
        const emailPromises = assignments.map(async (assignment) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: assignment.giverEmail,
                subject: '🎅 Your Secret Santa Assignment - I90 Deep Creek',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                        <div style="background: linear-gradient(90deg, #ff0000, #c41e3a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; font-size: 2em;">🎅 Secret Santa 2025</h1>
                            <p style="margin: 10px 0 0 0;">I90 Deep Creek - Aecon</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #ff0000;">Ho Ho Ho, ${assignment.giver}! 🎄</h2>
                            
                            <p style="font-size: 1.1em; line-height: 1.6;">
                                The Secret Santa draw has been completed, and you've been matched with...
                            </p>
                            
                            <div style="background: #fff8dc; border: 5px solid #FFD700; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                                <h2 style="color: #165b33; font-size: 2em; margin: 0;">🎁 ${assignment.receiver} 🎁</h2>
                            </div>
                            
                            <h3 style="color: #165b33;">📝 Their Gift Preferences:</h3>
                            
                            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 15px 0;">
                                <p style="margin-bottom: 12px;">
                                    <strong>💝 What they'd love:</strong> ${assignment.receiverPreferences.collectOrReceive}
                                </p>
                                
                                <p style="margin-bottom: 12px;">
                                    <strong>🏪 Favorite store:</strong> ${assignment.receiverPreferences.favoriteStore}
                                </p>
                                
                                <p style="margin-bottom: 12px;">
                                    <strong>🎨 Hobbies:</strong> ${assignment.receiverPreferences.hobby}
                                </p>
                                
                                <p style="margin-bottom: 12px;">
                                    <strong>👕 Shirt Size:</strong> ${assignment.receiverPreferences.shirtSize || 'Not provided'}
                                </p>
                                
                                <p style="margin-bottom: 12px;">
                                    <strong>👟 Shoe Size:</strong> ${assignment.receiverPreferences.shoeSize || 'Not provided'}
                                </p>
                                
                                <p style="margin-bottom: 0;">
                                    <strong>🎁 Specific wishlist:</strong> ${assignment.receiverPreferences.wishlist}
                                </p>
                            </div>
                            
                            <h3 style="color: #ff0000;">🎄 Important Reminders:</h3>
                            <ul style="line-height: 1.8;">
                                <li>Budget: Around <strong>$25</strong></li>
                                <li>Keep it a SECRET! 🤫</li>
                                <li>Wrap your gift nicely 🎁</li>
                                <li>Bring it to the party on <strong>December 19th</strong></li>
                            </ul>
                            
                            <div style="background: linear-gradient(135deg, #165b33, #0d4d2a); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px;">
                                <p style="margin: 0; font-size: 1.2em;">🎉 See you at the party! 🎉</p>
                                <p style="margin: 10px 0 0 0;">December 19th, 2025</p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 0.9em;">
                            <p>Questions? Contact the organizer.</p>
                        </div>
                    </div>
                `
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);

        // Mark draw as completed
        await configCollection.updateOne(
            { key: 'drawCompleted' },
            { $set: { key: 'drawCompleted', value: true, timestamp: new Date() } },
            { upsert: true }
        );

        // Store assignments in database (optional - for admin reference)
        const assignmentsCollection = database.collection('assignments');
        await assignmentsCollection.insertMany(assignments.map(a => ({
            ...a,
            timestamp: new Date()
        })));

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: `Draw completed! ${assignments.length} emails sent.`,
                count: assignments.length
            })
        };

    } catch (error) {
        console.error('Draw error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    } finally {
        await client.close();
    }
};



