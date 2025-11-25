const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, email, preferences } = JSON.parse(event.body);

        // Connect to MongoDB
        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        // Check if email already exists
        const existingParticipant = await collection.findOne({ email });
        if (existingParticipant) {
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
            subject: '🎄 Secret Santa 2025 - Registration Confirmed!',
            html: `
                <h2>Welcome to Secret Santa 2025!</h2>
                <p>Hi ${name},</p>
                <p>You've successfully registered for our Secret Santa exchange!</p>
                <p><strong>Your preferences:</strong> ${preferences}</p>
                <p>We'll notify you once the draw is complete and reveal your Secret Santa match!</p>
                <p>Happy Holidays! 🎅</p>
            `
        });

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
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    } finally {
        await client.close();
    }
};
