const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const uri = 'mongodb+srv://lakshita_sre:lakshita@whatsapp.qcds5aa.mongodb.net/whatsapp?retryWrites=true&w=majority&tls=true&appName=whatsapp';
const client = new MongoClient(uri);

// Collections
let db, processedMessagesCol, usersCol, chatsCol, messagesCol;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('whatsapp');
    processedMessagesCol = db.collection('processed_messages');
    usersCol = db.collection('users');
    chatsCol = db.collection('chats');
    messagesCol = db.collection('messages');
    console.log('✅ Connected to MongoDB Atlas!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

// Webhook Payload Processor
app.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📥 Webhook received:', payload);

    // Process different types of webhook payloads
    if (payload.entry && payload.entry[0] && payload.entry[0].changes) {
      const change = payload.entry[0].changes[0];
      
      if (change.value && change.value.messages) {
        // New message received
        const message = change.value.messages[0];
        const wa_id = change.value.metadata.phone_number_id;
        const from = message.from;
        
        const processedMessage = {
          id: message.id,
          wa_id: wa_id,
          from: from,
          timestamp: message.timestamp,
          type: message.type,
          content: message.text ? message.text.body : null,
          status: 'received',
          processed_at: new Date(),
          raw_payload: message
        };

        await processedMessagesCol.insertOne(processedMessage);
        
        // Emit real-time update
        io.emit('new_message', processedMessage);
        
        console.log('✅ Message processed and stored');
      } else if (change.value && change.value.statuses) {
        // Status update (sent, delivered, read)
        const status = change.value.statuses[0];
        const messageId = status.id;
        
        await processedMessagesCol.updateOne(
          { id: messageId },
          { 
            $set: { 
              status: status.status,
              status_timestamp: status.timestamp,
              updated_at: new Date()
            }
          }
        );
        
        // Emit real-time status update
        io.emit('status_update', { messageId, status: status.status });
        
        console.log('✅ Status updated:', status.status);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// API Routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await processedMessagesCol.find().sort({ timestamp: -1 }).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    // Group messages by wa_id (phone number)
    const conversations = await processedMessagesCol.aggregate([
      {
        $group: {
          _id: '$wa_id',
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { 'lastMessage.timestamp': -1 } }
    ]).toArray();
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:wa_id/messages', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await processedMessagesCol
      .find({ wa_id })
      .sort({ timestamp: 1 })
      .toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Message (Demo)
app.post('/api/send-message', async (req, res) => {
  try {
    const { wa_id, content, from } = req.body;
    
    if (!wa_id || !content) {
      return res.status(400).json({ error: 'wa_id and content are required' });
    }

    const newMessage = {
      id: `demo_${Date.now()}`,
      wa_id: wa_id,
      from: from || 'demo_user',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'text',
      content: content,
      status: 'sent',
      processed_at: new Date(),
      is_demo: true
    };

    await processedMessagesCol.insertOne(newMessage);
    
    // Emit real-time update
    io.emit('new_message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to: http://localhost:${PORT}`);
  });
}); 