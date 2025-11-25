const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
    try {
        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        const participants = await collection.find({}).toArray();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                count: participants.length,
                participants: participants
            })
        };

    } catch (error) {
        console.error('Get participants error:', error);
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
