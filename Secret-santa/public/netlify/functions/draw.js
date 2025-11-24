const https = require('https');
const nodemailer = require('nodemailer');

// CONFIG
const BIN_ID = process.env.JSONBIN_ID;
const API_KEY = process.env.JSONBIN_KEY;
const ADMIN_PASS = process.env.ADMIN_PASS;

const getList = () => new Promise((resolve, reject) => {
    https.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, { headers: { 'X-Master-Key': API_KEY } }, 
    res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(JSON.parse(data).record));
    }).on('error', reject);
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { password } = JSON.parse(event.body);

    // Security Check
    if (password !== ADMIN_PASS) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect Admin Password' }) };
    }

    try {
        const participants = await getList();
        
        if (!participants || participants.length < 2) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Not enough people!' }) };
        }

        // Shuffle Algorithm (Fisher-Yates)
        const shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Configure Emailer (Gmail)
        // Note: You must use an App Password for Gmail, not your normal password.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send Emails
        for (let i = 0; i < shuffled.length; i++) {
            const giver = shuffled[i];
            const receiver = shuffled[(i + 1) % shuffled.length]; // The next person in the circle

            await transporter.sendMail({
                from: `"Secret Santa" <${process.env.EMAIL_USER}>`,
                to: giver.email,
                subject: '🎅 Your Secret Santa Assignment!',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 2px dashed red;">
                        <h2>Ho Ho Ho, ${giver.name}!</h2>
                        <p>You have been assigned to be the Secret Santa for:</p>
                        <h1 style="color: #d42426;">${receiver.name}</h1>
                        <p>The budget is $20. Good luck and shhh! 🤫</p>
                    </div>
                `
            });
        }

        return { statusCode: 200, body: JSON.stringify({ count: participants.length }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};