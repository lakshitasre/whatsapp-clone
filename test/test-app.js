// Simple test script for WhatsApp Clone
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testApp() {
    console.log('🧪 Testing WhatsApp Clone Application...\n');

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connection...');
        const response = await fetch(BASE_URL);
        if (response.ok) {
            console.log('✅ Server is running and responding');
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Test 2: Test conversations API
        console.log('\n2️⃣ Testing conversations API...');
        const conversationsResponse = await fetch(`${BASE_URL}/api/conversations`);
        if (conversationsResponse.ok) {
            const conversations = await conversationsResponse.json();
            console.log(`✅ Conversations API working. Found ${conversations.length} conversations`);
        } else {
            throw new Error('Conversations API failed');
        }

        // Test 3: Test webhook endpoint
        console.log('\n3️⃣ Testing webhook endpoint...');
        const webhookPayload = {
            entry: [{
                changes: [{
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            phone_number_id: "test_123"
                        },
                        messages: [{
                            id: `test_${Date.now()}`,
                            from: "1234567890",
                            timestamp: Math.floor(Date.now() / 1000),
                            type: "text",
                            text: {
                                body: "Test message from automated test"
                            }
                        }]
                    }
                }]
            }]
        };

        const webhookResponse = await fetch(`${BASE_URL}/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        });

        if (webhookResponse.ok) {
            console.log('✅ Webhook endpoint working');
        } else {
            throw new Error('Webhook endpoint failed');
        }

        // Test 4: Test send message API
        console.log('\n4️⃣ Testing send message API...');
        const messagePayload = {
            wa_id: "test_123",
            content: "Test message from automated test",
            from: "demo_user"
        };

        const sendMessageResponse = await fetch(`${BASE_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        });

        if (sendMessageResponse.ok) {
            console.log('✅ Send message API working');
        } else {
            throw new Error('Send message API failed');
        }

        console.log('\n🎉 All tests passed! Your WhatsApp Clone is working correctly.');
        console.log('\n📱 Next steps:');
        console.log('   - Open http://localhost:3000 in your browser');
        console.log('   - Create a new chat and start messaging');
        console.log('   - Test real-time updates by opening multiple tabs');
        console.log('   - Deploy to production using the deployment guide');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Make sure the server is running (npm start)');
        console.log('   - Check MongoDB connection');
        console.log('   - Verify all dependencies are installed');
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testApp();
}

module.exports = { testApp }; 