# 🎯 Sentry Configuration - Rent It Forward

## ✅ **Configuration Complete**

Your Sentry monitoring is now set up for the entire Rent It Forward workspace!

### **📊 Project Details**

**Organization:** digital-linked  
**Region:** Germany (https://de.sentry.io)  
**Projects Created:** 2

### **🔑 DSN Configuration**

#### **Web App DSN:**
```
https://b2a1a136141a4da2ed51021eac73283e@o4509528461672448.ingest.de.sentry.io/4509528878678096
```

#### **Mobile App DSN:**
```
https://8b7738e1057239be04b1ef3f5eb7e421@o4509528461672448.ingest.de.sentry.io/4509528888311888
```

---

## 📝 **REQUIRED: Create Environment Files**

### **1. Web App Environment File**

**Create:** `rentitforward-web/.env.local`

```bash
# Sentry Configuration
SENTRY_DSN=https://b2a1a136141a4da2ed51021eac73283e@o4509528461672448.ingest.de.sentry.io/4509528878678096
NEXT_PUBLIC_SENTRY_DSN=https://b2a1a136141a4da2ed51021eac73283e@o4509528461672448.ingest.de.sentry.io/4509528878678096

# Copy your other environment variables from env.template
# (Supabase, Stripe, etc.)
```

### **2. Mobile App Environment File**

**Create:** `rentitforward-mobile/.env.local`

```bash
# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=https://8b7738e1057239be04b1ef3f5eb7e421@o4509528461672448.ingest.de.sentry.io/4509528888311888

# Add your other environment variables as needed
```

---

## 🧪 **Testing Your Setup**

### **Mobile App Test (Ready Now!)**

1. **Create the environment file** above
2. **Start your mobile app:** `npm start`
3. **Navigate to Browse tab**
4. **Look for red "Test" button** (development only)
5. **Tap the Test button** to send a test error
6. **Check your Sentry dashboard** for the error

### **Web App Test**

1. **Create the environment file** above
2. **Start your web app:** `npm run dev`
3. **Add test error to any page:**
   ```jsx
   throw new Error("Test Sentry error from web app");
   ```
4. **Check your Sentry dashboard**

---

## 🎯 **Dashboard Links**

- **Main Organization:** https://digital-linked.sentry.io/
- **Web Project:** https://digital-linked.sentry.io/projects/rentitforward-web/
- **Mobile Project:** https://digital-linked.sentry.io/projects/rentitforward-mobile/

---

## 🔧 **Features Enabled**

### **Web App (Next.js)**
- ✅ Client-side error tracking
- ✅ Server-side error tracking  
- ✅ Edge runtime monitoring
- ✅ Session replay (10% sample rate)
- ✅ Performance monitoring
- ✅ Source map upload
- ✅ Ad-blocker circumvention via `/monitoring`

### **Mobile App (React Native)**
- ✅ Crash reporting
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Session tracking
- ✅ Mobile replay with privacy masking
- ✅ Development vs production detection

---

## 🚀 **Next Steps**

1. **Create both `.env.local` files** with the DSN URLs above
2. **Test the mobile integration** using the test button
3. **Test the web integration** by adding a test error
4. **Remove test code** after verification
5. **Set up alerts** in your Sentry dashboard
6. **Configure user context** when users log in

---

## 🔒 **Security Notes**

- ✅ DSN URLs are safe to commit (they're public keys)
- ✅ Privacy masking enabled for session replays
- ✅ Development errors filtered in production
- ✅ Sensitive data automatically masked

**Your Rent It Forward platform is now fully monitored! 🎉** 