const express = require('express');
const app = express();
const port = 3000;
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const serviceAccount = require('./servicesAccouns.json');
const cors = require('cors');
require('dotenv').config();

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route utama
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Endpoint untuk mengirim notifikasi ke perangkat
app.post('/send-to-device', async (req, res) => {
    const { token, title, body, senderName, senderPhotoUrl } = req.body;

    // Validasi input
    if (!token || !title || !body) {
        return res.status(400).json({ error: 'Field token, title, dan body wajib diisi.' });
    }

    // Payload untuk notifikasi
    const message = {
        token,
        notification: {
            title,
            body,
        },
        data: {
            title: title || 'Notifikasi baru',
            body: body || 'Anda memiliki notifikasi baru',
            senderName: senderName || 'Admin',
            senderPhotoUrl: senderPhotoUrl || '',
            sendAt: new Date().toISOString(),
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
        // Mengirim pesan ke perangkat menggunakan Firebase Cloud Messaging (FCM)
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

// Menjalankan server pada port yang telah ditentukan
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
