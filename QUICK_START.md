# 🚀 Quick Start Guide - WhatsApp Web Clone

## ⚡ Get Running in 5 Minutes

### 1. Start the Application
```bash
npm start
```
Your app will be running at: http://localhost:3000

### 2. Test the Webhook System
```bash
npm run process-webhooks
```
This will process sample payloads and populate your database.

### 3. Open in Browser
- Open http://localhost:3000
- Click the edit button (✏️) to create a new chat
- Enter a WhatsApp ID (e.g., "1234567890")
- Start messaging!

## 🌐 Deploy to Production

### Render Deployment
1. Push code to GitHub
2. Connect repo to Render
3. Set build: `npm install`
4. Set start: `npm start`


## 🧪 Test Webhook Endpoint

Send a test webhook:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"id":"test123","from":"1234567890","timestamp":1234567890,"type":"text","text":{"body":"Hello!"}}]}}]}]}'
```

## 📱 Features to Test

- ✅ Real-time messaging
- ✅ Message status tracking
- ✅ Responsive design
- ✅ Search conversations
- ✅ Create new chats
- ✅ Webhook processing

## 🔧 Troubleshooting

**Server won't start?**
- Check MongoDB connection
- Ensure port 3000 is free
- Run `npm install` first

**Messages not appearing?**
- Check browser console
- Verify MongoDB connection
- Test webhook endpoint

---

**🎯 Your WhatsApp Clone is Ready!** 
