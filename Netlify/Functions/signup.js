const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY
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
        const { name, email, preferences } = JSON.parse(event.body);

        // Validate input
        if (!name || !email || !preferences) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Check if email already exists
        try {
            const existing = await client.query(
                q.Get(q.Match(q.Index('participants_by_email'), email))
            );
            
            if (existing) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'This email is already registered!' })
                };
            }
        } catch (error) {
            // Email doesn't exist, continue
        }

        // Create participant
        const result = await client.query(
            q.Create(q.Collection('participants'), {
                data: {
                    name,
                    email,
                    preferences,
                    signedUpAt: q.Now(),
                    assigned: false
                }
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully signed up!',
                id: result.ref.id
            })
        };

    } catch (error) {
        console.error('Signup error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to sign up. Please try again.' })
        };
    }
};