const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// In-memory storage for notifications (in a real app, this would be a database)
const notifications = {};

// Configuration
const MAX_RETRIES = 3;

// Process notification directly (no queue)
async function processNotification(notification) {
  console.log(`Processing notification: ${notification.id}`);
  
  try {
    // Attempt to send the notification
    const success = await sendNotification(notification);
    
    if (success) {
      console.log(`Notification ${notification.id} sent successfully`);
      
      // Update notification status in our storage
      if (notifications[notification.userId]) {
        const notifIndex = notifications[notification.userId].findIndex(n => n.id === notification.id);
        if (notifIndex !== -1) {
          notifications[notification.userId][notifIndex].status = 'delivered';
        }
      }
      return true;
    } else {
      // Handle retries
      const retryCount = notification.retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        // Schedule a retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        notification.retryCount = retryCount + 1;
        
        console.log(`Scheduling retry ${notification.retryCount} for notification ${notification.id} in ${delay}ms`);
        
        // Update status in storage
        if (notifications[notification.userId]) {
          const notifIndex = notifications[notification.userId].findIndex(n => n.id === notification.id);
          if (notifIndex !== -1) {
            notifications[notification.userId][notifIndex].status = `pending (retry ${notification.retryCount})`;
          }
        }
        
        // Schedule retry after delay
        setTimeout(() => {
          processNotification(notification);
        }, delay);
        
        return false;
      } else {
        console.log(`Notification ${notification.id} failed after ${MAX_RETRIES} retries`);
        
        // Update status in storage
        if (notifications[notification.userId]) {
          const notifIndex = notifications[notification.userId].findIndex(n => n.id === notification.id);
          if (notifIndex !== -1) {
            notifications[notification.userId][notifIndex].status = 'failed';
          }
        }
        
        return false;
      }
    }
  } catch (error) {
    console.error('Error processing notification:', error);
    return false;
  }
}

// Mock notification sender
async function sendNotification(notification) {
  const { type, userId, content } = notification;
  
  // In a real implementation, this would call actual email/SMS services
  console.log(`Sending ${type} notification to user ${userId}: ${content}`);
  
  return new Promise((resolve) => {
    // Simulate some random failures for testing retry mechanism
    const success = Math.random() > 0.3; // 30% chance of failure
    
    // Add a small delay to simulate network call
    setTimeout(() => {
      if (success) {
        console.log(`Successfully sent ${type} notification to user ${userId}`);
        resolve(true);
      } else {
        console.log(`Failed to send ${type} notification to user ${userId}`);
        resolve(false);
      }
    }, 500);
  });
}

// API Endpoints

// Send notification
app.post('/notifications', async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    
    // Validate request
    if (!userId || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate notification type
    if (!['email', 'sms', 'in-app'].includes(type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid notification type. Must be email, sms, or in-app' });
    }
    
    // Create notification object
    const notification = {
      id: uuidv4(),
      userId,
      type: type.toLowerCase(),
      content,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Store notification (in a real app, this would be in a database)
    if (!notifications[userId]) {
      notifications[userId] = [];
    }
    notifications[userId].push(notification);
    
    // Process notification asynchronously
    processNotification(notification).catch(err => {
      console.error('Error in async processing:', err);
    });
    
    res.status(202).json({
      message: 'Notification accepted for delivery',
      notificationId: notification.id
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user notifications
app.get('/users/:id/notifications', (req, res) => {
  try {
    const userId = req.params.id;
    const userNotifications = notifications[userId] || [];
    
    res.status(200).json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Notification service listening on port ${PORT}`);
});

module.exports = app; // Export for testing