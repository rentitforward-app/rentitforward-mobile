#!/usr/bin/env node

/**
 * OneSignal Integration Test Script
 * 
 * This script helps test OneSignal push notification functionality
 * Run with: node scripts/test-onesignal.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Environment variables check
const requiredEnvVars = {
  'ONESIGNAL_API_KEY': process.env.ONESIGNAL_API_KEY,
  'NEXT_PUBLIC_ONESIGNAL_APP_ID': process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
};

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');
  
  let allValid = true;
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.log(`❌ ${key}: Missing`);
      allValid = false;
    } else {
      console.log(`✅ ${key}: Set (${value.substring(0, 8)}...)`);
    }
  }
  
  if (!allValid) {
    console.log('\n⚠️  Please set missing environment variables in your .env file');
    return false;
  }
  
  console.log('\n✅ All environment variables are set!\n');
  return true;
}

async function sendTestNotification(externalUserId, message = "Test notification from Rent It Forward!") {
  const appId = requiredEnvVars['NEXT_PUBLIC_ONESIGNAL_APP_ID'];
  const apiKey = requiredEnvVars['ONESIGNAL_API_KEY'];
  
  const notificationData = {
    app_id: appId,
    headings: { en: "Test Notification" },
    contents: { en: message },
    include_external_user_ids: [externalUserId],
    web_url: "https://your-app-domain.com",
    big_picture: "https://your-app-domain.com/images/notification-icon.png",
    chrome_web_icon: "https://your-app-domain.com/images/notification-icon.png",
    firefox_icon: "https://your-app-domain.com/images/notification-icon.png",
  };

  try {
    console.log('📤 Sending test notification...');
    console.log('Target User ID:', externalUserId);
    console.log('Message:', message);
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Test notification sent successfully!');
      console.log('Notification ID:', result.id);
      console.log('Recipients:', result.recipients);
      
      if (result.recipients === 0) {
        console.log('\n⚠️  No recipients found. This could mean:');
        console.log('   - User is not subscribed to push notifications');
        console.log('   - External User ID not set correctly');
        console.log('   - User has notifications disabled');
      }
    } else {
      console.log('\n❌ Failed to send notification:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error sending notification:', error.message);
    return null;
  }
}

async function checkAppInfo() {
  const appId = requiredEnvVars['NEXT_PUBLIC_ONESIGNAL_APP_ID'];
  const apiKey = requiredEnvVars['ONESIGNAL_API_KEY'];
  
  try {
    console.log('📊 Fetching app information...');
    
    const response = await fetch(`https://onesignal.com/api/v1/apps/${appId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${apiKey}`,
      },
    });

    const appInfo = await response.json();

    if (response.ok) {
      console.log('\n✅ App information retrieved:');
      console.log('App Name:', appInfo.name);
      console.log('Players:', appInfo.players);
      console.log('Messageable Players:', appInfo.messageable_players);
      console.log('Updated At:', appInfo.updated_at);
      
      if (appInfo.players === 0) {
        console.log('\n⚠️  No players found. Make sure:');
        console.log('   - Web app is running and OneSignal is initialized');
        console.log('   - Mobile app is installed and has granted permissions');
        console.log('   - Users have subscribed to notifications');
      }
    } else {
      console.log('\n❌ Failed to fetch app info:', appInfo);
    }
    
    return appInfo;
  } catch (error) {
    console.error('\n❌ Error fetching app info:', error.message);
    return null;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔔 OneSignal Integration Test\n');
  console.log('This script helps you test your OneSignal push notification setup.\n');
  
  // Check environment variables
  if (!checkEnvironmentVariables()) {
    rl.close();
    return;
  }
  
  // Get app info
  await checkAppInfo();
  
  // Interactive testing
  console.log('\n🧪 Interactive Testing\n');
  
  const testType = await askQuestion(
    'What would you like to test?\n' +
    '1. Send test notification to specific user\n' +
    '2. Send test notification to all users\n' +
    '3. Check subscription status\n' +
    '4. Exit\n' +
    'Enter choice (1-4): '
  );
  
  switch (testType.trim()) {
    case '1':
      const userId = await askQuestion('Enter the external user ID (UUID): ');
      const message = await askQuestion('Enter test message (or press Enter for default): ');
      await sendTestNotification(
        userId.trim(), 
        message.trim() || "Test notification from Rent It Forward!"
      );
      break;
      
    case '2':
      const broadcastMessage = await askQuestion('Enter broadcast message: ');
      console.log('📤 Sending to all users...');
      
      const appId = requiredEnvVars['NEXT_PUBLIC_ONESIGNAL_APP_ID'];
      const apiKey = requiredEnvVars['ONESIGNAL_API_KEY'];
      
      try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${apiKey}`,
          },
          body: JSON.stringify({
            app_id: appId,
            headings: { en: "Test Broadcast" },
            contents: { en: broadcastMessage.trim() },
            included_segments: ["All"],
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('\n✅ Broadcast sent!');
          console.log('Notification ID:', result.id);
          console.log('Recipients:', result.recipients);
        } else {
          console.log('\n❌ Broadcast failed:', result);
        }
      } catch (error) {
        console.error('\n❌ Error:', error.message);
      }
      break;
      
    case '3':
      await checkAppInfo();
      break;
      
    case '4':
      console.log('👋 Goodbye!');
      break;
      
    default:
      console.log('❌ Invalid choice');
  }
  
  rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Test script terminated');
  rl.close();
  process.exit(0);
});

// Run the script
main().catch(console.error); 