// app.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

// 1. MongoDB Connection String
const uri = 'mongodb+srv://lakshita_sre:lakshita@whatsapp.qcds5aa.mongodb.net/whatsapp?retryWrites=true&w=majority&tls=true&appName=whatsapp';
const client = new MongoClient(uri);

// 2. Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}
connectDB();

// 3. Collections
const db = client.db('whatsapp');
const usersCol = db.collection('users');
const chatsCol = db.collection('chats');
const messagesCol = db.collection('messages');

// ---------------------- USER APIs ----------------------

// Create a user
app.post('/users', async (req, res) => {
  const { username, displayName, profilePhotoUrl } = req.body;
  if (!username || !displayName) {
    return res.status(400).send({ error: 'username and displayName are required' });
  }
  try {
    const exists = await usersCol.findOne({ username });
    if (exists) return res.status(400).send({ error: 'User already exists' });

    const newUser = {
      username,
      displayName,
      profilePhotoUrl: profilePhotoUrl || null,
      createdAt: new Date(),
      lastSeen: new Date()
    };
    const result = await usersCol.insertOne(newUser);
    res.status(201).send({ userId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  const users = await usersCol.find().toArray();
  res.send(users);
});

// ---------------------- CHAT APIs ----------------------

// Create a chat (private or group)
app.post('/chats', async (req, res) => {
  const { type, participants, chatName } = req.body;
  if (!type || !participants || participants.length < 2) {
    return res.status(400).send({ error: 'type and at least 2 participants are required' });
  }
  try {
    const newChat = {
      type, // 'private' or 'group'
      participants: participants.map(id => new ObjectId(id)),
      chatName: chatName || null,
      createdAt: new Date(),
      lastMessage: null
    };
    const result = await chatsCol.insertOne(newChat);
    res.status(201).send({ chatId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get chats for a user
app.get('/users/:userId/chats', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    const chats = await chatsCol.find({ participants: userId }).toArray();
    res.send(chats);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ---------------------- MESSAGE APIs ----------------------

// Send a message
app.post('/messages', async (req, res) => {
  const { chatId, senderId, content, type } = req.body;
  if (!chatId || !senderId || !content || !type) {
    return res.status(400).send({ error: 'chatId, senderId, content, and type are required' });
  }
  try {
    const newMessage = {
      chatId: new ObjectId(chatId),
      senderId: new ObjectId(senderId),
      content,
      type, // 'text', 'image', 'video'
      status: 'sent',
      timestamp: new Date()
    };
    const result = await messagesCol.insertOne(newMessage);

    // update chat's last message
    await chatsCol.updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { lastMessage: { messageId: result.insertedId, timestamp: new Date() } } }
    );

    res.status(201).send({ messageId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get messages for a chat
app.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const chatId = new ObjectId(req.params.chatId);
    const messages = await messagesCol.find({ chatId }).sort({ timestamp: 1 }).toArray();
    res.send(messages);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ---------------------- START SERVER ----------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
