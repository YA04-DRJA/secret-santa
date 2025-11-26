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
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }

    const client = new MongoClient(uri);  // Create client INSIDE handler

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully');
        
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        console.log('Fetching participants...');
        const participants = await collection.find({}).toArray();
        console.log('Found participants:', participants.length);

        await client.close();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                count: participants.length,
                participants: participants,
                drawCompleted: false  // You'll update this when you implement the draw
            })
        };

    } catch (error) {
        console.error('Get participants error:', error);
        
        try {
            await client.close();
        } catch (e) {
            console.error('Error closing client:', e);
        }

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: error.message || 'Failed to get participants',
                details: String(error)
            })
        };
    }
};
