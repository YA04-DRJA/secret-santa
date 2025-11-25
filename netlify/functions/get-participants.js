const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const client = new faunadb.Client({
        secret: process.env.FAUNA_SECRET_KEY
    });

    try {
        const result = await client.query(
            q.Map(
                q.Paginate(q.Documents(q.Collection('participants'))),
                q.Lambda('ref', q.Get(q.Var('ref')))
            )
        );

        const participants = result.data.map(doc => doc.data);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ participants })
        };
    } catch (error) {
        console.error('Error fetching participants:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch participants', participants: [] })
        };
    }
};
