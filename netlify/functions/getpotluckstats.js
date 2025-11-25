const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
    // Handle CORS
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

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('secretsanta');
        const collection = database.collection('participants');

        // Get all participants
        const participants = await collection.find({}).toArray();
        
        // Count food choices
        const stats = {
            'Main Course': 0,
            'Appetizer': 0,
            'Dessert': 0,
            'Snacks': 0,
            'Drinks': 0,
            'Not Bringing Food': 0,
            'Not Selected': 0
        };

        let total = 0;

        participants.forEach(p => {
            if (p.potluckChoice) {
                stats[p.potluckChoice]++;
                total++;
            } else {
                stats['Not Selected']++;
            }
        });

        // Calculate percentages
        const percentages = {};
        Object.keys(stats).forEach(key => {
            percentages[key] = total > 0 ? Math.round((stats[key] / total) * 100) : 0;
        });

        await client.close();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                stats: stats,
                percentages: percentages,
                total: total
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
            body: JSON.stringify({ error: 'Failed to get potluck stats' })
        };
    }
};
