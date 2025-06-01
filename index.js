const express = require('express');
const app = express();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const serviceAccount = require('./servicesAccountKey.json'); // Path to Firebase Admin SDK service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Middleware setup
app.use(cors());  // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));  // Parse URL-encoded data
app.use(bodyParser.json());  // Parse JSON data

// Route to check if server is running
app.get('/', (req, res) => {
    res.send('Hai, ini adalah REST API untuk Fasum!');
});

// Endpoint to send a notification
app.post('/send-notification', async (req, res) => {
    const { token, title, body, roomId } = req.body;

    // Validate input
    if (!token || !title || !body) {
        return res.status(400).json({ error: 'Field token, title, dan body wajib diisi.' });
    }

    // Create message payload
    const message = {
        token,
        notification: {
            title,
            body,
        },
        data: {
            title: title || 'Notifikasi baru',
            body: body || 'Anda memiliki notifikasi baru',
            roomId: roomId,
            messageType: 'device-notification',
        },
        android: {
            priority: 'high',
        },
        apns: {
            headers: {
                'apns-priority': '10',
            },
        },
    };

    try {
        // Send the message using Firebase Admin SDK
        const response = await admin.messaging().send(message);
        res.status(200).json({
            success: true,
            message: `Notifikasi berhasil dikirim ke perangkat dengan token ${token}`,
            response,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
