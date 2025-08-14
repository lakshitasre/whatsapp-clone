# WhatsApp Web Clone

A full-stack WhatsApp Web clone built with Node.js, MongoDB, and Socket.IO. This application simulates WhatsApp Web interface with real-time messaging, webhook processing, and a responsive design.

## 🚀 Features

### Core Features
- **WhatsApp Web-like Interface**: Clean, modern UI that closely resembles WhatsApp Web
- **Real-time Messaging**: Instant message updates using Socket.IO
- **Webhook Processing**: Handles WhatsApp Business API webhook payloads
- **Message Status Tracking**: Shows sent, delivered, and read status
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Search Functionality**: Search through conversations and messages
- **New Chat Creation**: Start conversations with new users

### Technical Features
- **MongoDB Integration**: Stores messages, conversations, and user data
- **RESTful APIs**: Well-structured backend API endpoints
- **WebSocket Support**: Real-time bidirectional communication
- **Webhook Endpoint**: `/webhook` endpoint for processing incoming messages
- **Status Updates**: Automatic status tracking and updates

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Real-time**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with WhatsApp Web design
- **Icons**: Font Awesome

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd whatsapp_clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
```

### 4. MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Create a database named `whatsapp`
3. Create the following collections:
   - `processed_messages` - Stores webhook messages
   - `users` - User information
   - `chats` - Chat metadata
   - `messages` - Individual messages

### 5. Update Database Connection
Update the MongoDB connection string in `server.js` with your credentials:
```javascript
const uri = 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/whatsapp?retryWrites=true&w=majority';
```

## 🎯 Usage

### Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

### Process Webhook Payloads
```bash
npm run process-webhooks
```

This script will:
- Create sample payload files if they don't exist
- Process JSON files in the `sample_payloads` directory
- Insert messages into the `processed_messages` collection
- Update message statuses

### Webhook Endpoint
Send POST requests to `/webhook` with WhatsApp Business API payloads:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"id":"msg123","from":"1234567890","timestamp":1234567890,"type":"text","text":{"body":"Hello"}}]}}]}]}'
```

## 📱 API Endpoints

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/send-message` - Send a new message

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:wa_id/messages` - Get messages for a specific conversation

### Webhooks
- `POST /webhook` - Process incoming webhook payloads

## 🎨 Frontend Features

### User Interface
- **Sidebar**: Shows all conversations with last message preview
- **Chat Area**: Displays messages with proper WhatsApp styling
- **Message Input**: Type and send messages
- **Status Indicators**: Visual feedback for message delivery status
- **Search**: Filter conversations by name or message content

### Responsive Design
- **Desktop**: Full sidebar and chat layout
- **Mobile**: Collapsible sidebar with touch-friendly interface
- **Tablet**: Adaptive layout for medium screens

## 🔧 Configuration

### Customization Options
- **Colors**: Modify CSS variables in `public/styles.css`
- **Port**: Change server port in `.env` file
- **Database**: Update MongoDB connection string
- **Webhook Processing**: Customize payload processing logic in `server.js`

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment mode (development/production)

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables


### Environment Variables for Production
```env
PORT=3000
MONGODB_URI=your_production_mongodb_uri
NODE_ENV=production
```

## 📊 Database Schema

### processed_messages Collection
```javascript
{
  id: "message_id",
  wa_id: "whatsapp_id",
  from: "sender_number",
  timestamp: 1234567890,
  type: "text",
  content: "message_content",
  status: "sent|delivered|read",
  processed_at: Date,
  raw_payload: Object
}
```

### users Collection
```javascript
{
  username: "user_identifier",
  displayName: "User Display Name",
  profilePhotoUrl: "photo_url",
  createdAt: Date,
  lastSeen: Date
}
```

### chats Collection
```javascript
{
  type: "private|group",
  participants: [ObjectId],
  chatName: "chat_name",
  createdAt: Date,
  lastMessage: Object
}
```

## 🧪 Testing

### Manual Testing
1. Start the application
2. Open multiple browser tabs
3. Create new chats
4. Send messages between tabs
5. Test real-time updates

### Webhook Testing
1. Use tools like Postman or curl
2. Send POST requests to `/webhook`
3. Verify messages appear in the UI
4. Check database storage

## 🔍 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Verify connection string
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP

#### Socket.IO Connection Issues
- Check if server is running
- Verify CORS settings
- Check browser console for errors

#### Messages Not Appearing
- Check browser console for errors
- Verify API endpoints are working
- Check database connection

### Debug Mode
Enable debug logging by setting:
```javascript
process.env.DEBUG = 'socket.io:*';
```

## 📈 Performance Optimization

### Database
- Index frequently queried fields
- Use aggregation pipelines for complex queries
- Implement connection pooling

### Frontend
- Lazy load conversations
- Implement virtual scrolling for large message lists
- Optimize image loading

### Backend
- Implement rate limiting
- Add caching layer
- Use compression middleware

## 🔒 Security Considerations

- **Input Validation**: Sanitize all user inputs
- **CORS Configuration**: Restrict origins in production
- **Rate Limiting**: Prevent abuse
- **Environment Variables**: Never commit sensitive data
- **HTTPS**: Use SSL in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This is a demo application for evaluation purposes. No real WhatsApp messages are sent or received. 
