const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMessageNotification = functions.firestore
  .document('chat_rooms/{roomId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const roomId = context.params.roomId;
    const message = messageData.message;
    const senderId = messageData.senderId;

  
    const receiverToken = await getReceiverToken(roomId); 


    const payload = {
      notification: {
        title: 'New Message',
        body: message,
      },
      data: {
        roomId: roomId,
        senderId: senderId,
        message: message,
      },
      token: receiverToken,
    };

    // Send the notification
    return admin.messaging().send(payload)
      .then(response => {
        console.log('Notification sent:', response);
      })
      .catch(error => {
        console.log('Error sending notification:', error);
      });
  });

// Helper function to get the receiver token (based on your logic)
async function getReceiverToken(roomId) {
  // Replace with your logic to fetch the token for the receiver
  const userDoc = await admin.firestore().collection('chat_rooms').doc(roomId).get();
  const userToken = userDoc.data().receiverToken;
  return userToken;
}
