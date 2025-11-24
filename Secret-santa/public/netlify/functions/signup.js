const https = require('https');

// STORAGE CONFIGURATION
const BIN_ID = process.env.JSONBIN_ID;
const API_KEY = process.env.JSONBIN_KEY;

// Helper to get current list
const getList = () => {
    return new Promise((resolve, reject) => {
        const req = https.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).record));
        });
        req.on('error', reject);
    });
};

// Helper to save new list
const saveList = (data) => {
    return new Promise((resolve, reject) => {
        const req = https.request(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY 
            }
        }, (res) => resolve(res));
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { name, email } = JSON.parse(event.body);
        
        // 1. Get current participants
        let participants = await getList();
        if (!Array.isArray(participants)) participants = [];

        // 2. Check if email already exists
        if (participants.find(p => p.email === email)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'You have already signed up!' }) };
        }

        // 3. Add new participant
        participants.push({ name, email, joined: new Date().toISOString() });

        // 4. Save back to storage
        await saveList(participants);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Thanks ${name}, you are on the list!` })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};