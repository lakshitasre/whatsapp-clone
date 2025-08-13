const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const uri = 'mongodb+srv://lakshita_sre:lakshita@whatsapp.qcds5aa.mongodb.net/whatsapp?retryWrites=true&w=majority&tls=true&appName=whatsapp';
const client = new MongoClient(uri);

async function processWebhookPayloads() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    const db = client.db('whatsapp');
    const processedMessagesCol = db.collection('processed_messages');
    
    // Sample payloads directory (you'll need to create this and add your JSON files)
    const payloadsDir = path.join(__dirname, '..', 'sample_payloads');
    
    if (!fs.existsSync(payloadsDir)) {
      console.log('📁 Creating sample_payloads directory...');
      fs.mkdirSync(payloadsDir, { recursive: true });
      
      // Create sample payload files
      const samplePayloads = [
        {
          filename: 'message_received.json',
          content: {
            entry: [{
              changes: [{
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    phone_number_id: "123456789",
                    display_phone_number: "+1234567890"
                  },
                  messages: [{
                    id: "wamid.123456789",
                    from: "1234567890",
                    timestamp: Math.floor(Date.now() / 1000),
                    type: "text",
                    text: {
                      body: "Hello! This is a sample message."
                    }
                  }]
                }
              }]
            }]
          }
        },
        {
          filename: 'status_update.json',
          content: {
            entry: [{
              changes: [{
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    phone_number_id: "123456789"
                  },
                  statuses: [{
                    id: "wamid.123456789",
                    status: "delivered",
                    timestamp: Math.floor(Date.now() / 1000)
                  }]
                }
              }]
            }]
          }
        }
      ];
      
      samplePayloads.forEach(payload => {
        fs.writeFileSync(
          path.join(payloadsDir, payload.filename),
          JSON.stringify(payload.content, null, 2)
        );
        console.log(`📄 Created ${payload.filename}`);
      });
    }
    
    // Process all JSON files in the payloads directory
    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('📁 No JSON files found in sample_payloads directory');
      console.log('📝 Please add your webhook payload JSON files to the sample_payloads directory');
      return;
    }
    
    console.log(`📁 Found ${files.length} payload files to process`);
    
    for (const file of files) {
      console.log(`\n📄 Processing ${file}...`);
      
      try {
        const filePath = path.join(payloadsDir, file);
        const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Process the payload similar to the webhook endpoint
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
              raw_payload: message,
              source_file: file
            };

            // Check if message already exists
            const existing = await processedMessagesCol.findOne({ id: message.id });
            if (!existing) {
              await processedMessagesCol.insertOne(processedMessage);
              console.log(`✅ Message processed and stored: ${message.id}`);
            } else {
              console.log(`⚠️ Message already exists: ${message.id}`);
            }
            
          } else if (change.value && change.value.statuses) {
            // Status update (sent, delivered, read)
            const status = change.value.statuses[0];
            const messageId = status.id;
            
            const result = await processedMessagesCol.updateOne(
              { id: messageId },
              { 
                $set: { 
                  status: status.status,
                  status_timestamp: status.timestamp,
                  updated_at: new Date()
                }
              }
            );
            
            if (result.matchedCount > 0) {
              console.log(`✅ Status updated for message ${messageId}: ${status.status}`);
            } else {
              console.log(`⚠️ Message not found for status update: ${messageId}`);
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    console.log('\n🎉 Webhook payload processing completed!');
    
    // Show summary
    const totalMessages = await processedMessagesCol.countDocuments();
    console.log(`📊 Total messages in database: ${totalMessages}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  processWebhookPayloads();
}

module.exports = { processWebhookPayloads }; 