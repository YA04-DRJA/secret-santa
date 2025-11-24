const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const result = await client.query(
            q.Map(
                q.Paginate(q.Documents(q.Collection('participants'))),
                q.Lambda('ref', q.Get(q.Var('ref')))
            )
        );

        const participants = result.data.map(item => ({
            id: item.ref.id,
            ...item.data
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ participants })
        };

    } catch (error) {
        console.error('Get participants error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch participants' })
        };
    }
};