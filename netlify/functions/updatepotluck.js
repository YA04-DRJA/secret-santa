const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
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
        // Accept either foodType or potluckChoice
        const body = JSON.parse(event.body || '{}');
        const email = body.email;
        const potluckChoice = body.potluckChoice || body.foodType;

        if (!email || !potluckChoice) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Email and potluck choice are required' })
            };
        }

        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        const result = await collection.updateOne(
            { email },
            { $set: { potluckChoice } }
        );

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
        console.error('Error:', error);
        await client.close();
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Failed to save potluck choice' })
        };
    }
};
