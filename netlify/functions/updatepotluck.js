const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const client = new MongoClient(uri);

    try {
        // Parse body safely and accept both potluckChoice and foodType
        const body = JSON.parse(event.body || '{}');
        const email = body.email;
        const potluckChoice = body.potluckChoice || body.foodType;

        console.log('updatepotluck body:', body);
        console.log('email:', email, 'potluckChoice:', potluckChoice);

        if (!email || !potluckChoice) {
            console.log('Missing email or potluckChoice');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email and potluck choice are required' })
            };
        }

        if (!uri) {
            console.error('MONGODB_URI is not set');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Server configuration error (MONGODB_URI missing)' })
            };
        }

        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        const result = await collection.updateOne(
            { email },
            { $set: { potluckChoice } }
        );

        console.log('Mongo update result:', result);

        await client.close();

        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Participant not found' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Potluck choice saved successfully',
                potluckChoice
            })
        };

    } catch (error) {
        console.error('updatepotluck ERROR:', error);

        try {
            await client.close();
        } catch (e) {
            console.error('Error closing Mongo client:', e);
        }

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to save potluck choice',
                details: error.message || String(error)
            })
        };
    }
};
