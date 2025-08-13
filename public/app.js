// WhatsApp Web Clone Frontend
class WhatsAppClone {
    constructor() {
        this.socket = io();
        this.currentChat = null;
        this.conversations = [];
        this.messages = {};
        
        this.initializeElements();
        this.bindEvents();
        this.initializeSocket();
        this.loadConversations();
    }

    initializeElements() {
        // Main elements
        this.conversationsList = document.getElementById('conversationsList');
        this.mainChat = document.getElementById('mainChat');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatInterface = document.getElementById('chatInterface');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.searchInput = document.getElementById('searchInput');
        
        // Modal elements
        this.newChatModal = document.getElementById('newChatModal');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.createChatBtn = document.getElementById('createChatBtn');
        this.waIdInput = document.getElementById('waIdInput');
        this.userNameInput = document.getElementById('userNameInput');
        
        // Chat elements
        this.chatUserName = document.getElementById('chatUserName');
        this.chatUserStatus = document.getElementById('chatUserStatus');
    }

    bindEvents() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // New chat modal
        this.newChatBtn.addEventListener('click', () => this.showModal());
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.createChatBtn.addEventListener('click', () => this.createNewChat());
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.filterConversations(e.target.value));
        
        // Close modal on outside click
        this.newChatModal.addEventListener('click', (e) => {
            if (e.target === this.newChatModal) {
                this.hideModal();
            }
        });
    }

    initializeSocket() {
        this.socket.on('connect', () => {
            console.log('🔌 Connected to server');
        });

        this.socket.on('new_message', (message) => {
            console.log('📨 New message received:', message);
            this.handleNewMessage(message);
        });

        this.socket.on('status_update', (update) => {
            console.log('📊 Status update:', update);
            this.handleStatusUpdate(update);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
        });
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/conversations');
            const conversations = await response.json();
            
            this.conversations = conversations;
            this.renderConversations();
            
            if (conversations.length === 0) {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
            this.showError('Failed to load conversations');
        }
    }

    renderConversations() {
        if (this.conversations.length === 0) {
            this.conversationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No conversations yet</h3>
                    <p>Start a new chat to begin messaging</p>
                </div>
            `;
            return;
        }

        this.conversationsList.innerHTML = this.conversations.map(conv => {
            const lastMessage = conv.lastMessage;
            const time = this.formatTime(lastMessage.timestamp);
            const isActive = this.currentChat && this.currentChat.wa_id === conv._id;
            
            return `
                <div class="conversation-item ${isActive ? 'active' : ''}" 
                     data-wa-id="${conv._id}" onclick="whatsappClone.selectConversation('${conv._id}')">
                    <div class="conversation-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="conversation-details">
                        <div class="conversation-name">${conv._id}</div>
                        <div class="conversation-last-message">
                            ${lastMessage.content || 'No messages yet'}
                        </div>
                    </div>
                    <div class="conversation-time">${time}</div>
                </div>
            `;
        }).join('');
    }

    async selectConversation(waId) {
        try {
            // Update active state
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-wa-id="${waId}"]`).classList.add('active');

            this.currentChat = { wa_id: waId };
            this.showChatInterface();
            this.loadChatMessages(waId);
            
            // Update chat header
            this.chatUserName.textContent = waId;
            this.chatUserStatus.textContent = 'Online';
            
        } catch (error) {
            console.error('❌ Error selecting conversation:', error);
            this.showError('Failed to load chat');
        }
    }

    async loadChatMessages(waId) {
        try {
            const response = await fetch(`/api/conversations/${waId}/messages`);
            const messages = await response.json();
            
            this.messages[waId] = messages;
            this.renderMessages(waId);
            
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            this.showError('Failed to load messages');
        }
    }

    renderMessages(waId) {
        const messages = this.messages[waId] || [];
        
        if (messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment"></i>
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message</p>
                </div>
            `;
            return;
        }

        this.messagesContainer.innerHTML = messages.map(message => {
            const isSent = message.from === 'demo_user';
            const time = this.formatTime(message.timestamp);
            const statusIcon = this.getStatusIcon(message.status);
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        <div class="message-content">${message.content}</div>
                        <div class="message-time">${time}</div>
                        ${isSent ? `
                            <div class="message-status">
                                <i class="status-icon ${message.status}">${statusIcon}</i>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        this.scrollToBottom();
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content || !this.currentChat) return;

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wa_id: this.currentChat.wa_id,
                    content: content,
                    from: 'demo_user'
                })
            });

            if (response.ok) {
                this.messageInput.value = '';
                // Message will be added via socket.io
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.showError('Failed to send message');
        }
    }

    handleNewMessage(message) {
        // Add to messages if it's for the current chat
        if (this.currentChat && message.wa_id === this.currentChat.wa_id) {
            if (!this.messages[message.wa_id]) {
                this.messages[message.wa_id] = [];
            }
            this.messages[message.wa_id].push(message);
            this.renderMessages(message.wa_id);
        }

        // Update conversations list
        this.updateConversationInList(message);
    }

    handleStatusUpdate(update) {
        // Update message status in current chat
        if (this.currentChat && this.messages[this.currentChat.wa_id]) {
            const messageIndex = this.messages[this.currentChat.wa_id].findIndex(m => m.id === update.messageId);
            if (messageIndex !== -1) {
                this.messages[this.currentChat.wa_id][messageIndex].status = update.status;
                this.renderMessages(this.currentChat.wa_id);
            }
        }
    }

    updateConversationInList(message) {
        const existingIndex = this.conversations.findIndex(c => c._id === message.wa_id);
        
        if (existingIndex !== -1) {
            // Update existing conversation
            this.conversations[existingIndex].lastMessage = message;
            this.conversations[existingIndex].messageCount = (this.conversations[existingIndex].messageCount || 0) + 1;
        } else {
            // Add new conversation
            this.conversations.unshift({
                _id: message.wa_id,
                lastMessage: message,
                messageCount: 1
            });
        }

        // Sort by last message time
        this.conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
        this.renderConversations();
    }

    showChatInterface() {
        this.welcomeScreen.style.display = 'none';
        this.chatInterface.style.display = 'flex';
    }

    showWelcomeScreen() {
        this.welcomeScreen.style.display = 'flex';
        this.chatInterface.style.display = 'none';
        this.currentChat = null;
    }

    showModal() {
        this.newChatModal.classList.add('show');
        this.waIdInput.focus();
    }

    hideModal() {
        this.newChatModal.classList.remove('show');
        this.waIdInput.value = '';
        this.userNameInput.value = '';
    }

    async createNewChat() {
        const waId = this.waIdInput.value.trim();
        const userName = this.userNameInput.value.trim();

        if (!waId) {
            this.showError('Please enter a WhatsApp ID');
            return;
        }

        try {
            // Create a demo message to start the conversation
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wa_id: waId,
                    content: `Hello! This is a demo message to ${userName || waId}`,
                    from: 'demo_user'
                })
            });

            if (response.ok) {
                this.hideModal();
                this.selectConversation(waId);
            } else {
                throw new Error('Failed to create chat');
            }
        } catch (error) {
            console.error('❌ Error creating chat:', error);
            this.showError('Failed to create chat');
        }
    }

    filterConversations(query) {
        const items = document.querySelectorAll('.conversation-item');
        const searchTerm = query.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.conversation-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.conversation-last-message').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓';
            default: return '✓';
        }
    }

    showEmptyState() {
        this.conversationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No conversations yet</h3>
                <p>Click the edit button to start a new chat</p>
            </div>
        `;
    }

    showError(message) {
        // Simple error display - you can enhance this with a proper toast notification
        console.error('❌ Error:', message);
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.whatsappClone = new WhatsAppClone();
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        // Mobile view adjustments
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}); 