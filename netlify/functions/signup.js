const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        const { name, email, preferences } = JSON.parse(event.body);

        // Connect to MongoDB
        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        // Check if email already exists
        const existingParticipant = await collection.findOne({ email });
        if (existingParticipant) {
            await client.close();
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email already registered' })
            };
        }

        // Add new participant
        const participant = {
            name,
            email,
            preferences,
            signupDate: new Date().toISOString()
        };

        await collection.insertOne(participant);

        // Format preferences for email
        const preferencesText = `
            Gift Ideas: ${preferences.collectOrReceive}
            Favorite Store/Brand: ${preferences.favoriteStore}
            Hobbies/Interests: ${preferences.hobby}
            Shirt Size: ${preferences.shirtSize}
            Shoe Size: ${preferences.shoeSize}
            Wishlist: ${preferences.wishlist}
        `;

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🎄 I90 Deep Creek Secret Santa 2025 - You\'re In!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #c41e3a 0%, #165b33 100%); border-radius: 15px;">
                    <div style="background: white; padding: 30px; border-radius: 10px; border: 5px solid #FFD700;">
                        <h2 style="color: #ff0000; text-align: center;">🎅 Welcome to Secret Santa 2025! 🎅</h2>
                        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="font-size: 16px;">You've successfully joined the <strong>I90 Deep Creek Secret Santa</strong>!</p>
                        
                        <div style="background: #fff8dc; padding: 20px; border-radius: 10px; border: 3px solid #FFD700; margin: 20px 0;">
                            <h3 style="color: #165b33; margin-top: 0;">Your Gift Preferences:</h3>
                            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px;">${preferencesText}</pre>
                        </div>
                        
                        <p style="font-size: 16px;"><strong>What happens next?</strong></p>
                        <ul style="font-size: 15px; line-height: 1.8;">
                            <li>Once everyone signs up, we'll draw names</li>
                            <li>You'll receive an email with your Secret Santa match</li>
                            <li>Budget is around $25</li>
                            <li>Get ready to spread some holiday cheer! 🎁</li>
                        </ul>
                        
                        <p style="text-align: center; font-size: 18px; margin-top: 30px;">
                            <strong style="color: #ff0000;">Happy Holidays! 🎄</strong>
                        </p>
                    </div>
                </div>
            `
        });

        await client.close();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Successfully registered!' })
        };

    } catch (error) {
        console.error('Signup error:', error);
        
        try {
            await client.close();
        } catch (closeError) {
            console.error('Error closing connection:', closeError);
        }
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
