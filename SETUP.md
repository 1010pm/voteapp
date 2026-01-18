# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set Up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Create Firestore database
   - Copy your config to `.env` file

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration

4. **Set Up Firestore Security Rules**
   - Copy rules from `public/firestore.rules`
   - Paste in Firebase Console > Firestore > Rules

5. **Run the App**
   ```bash
   npm start
   ```

## Detailed Setup

### Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name and follow the setup wizard
4. Enable Google Analytics (optional)

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method:
   - Click on Google
   - Enable it
   - Add support email
   - Save

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a location (closest to your users)
5. Click **Enable**

### Step 4: Set Up Security Rules

1. Go to **Firestore Database** > **Rules**
2. Copy the content from `public/firestore.rules`
3. Paste in the rules editor
4. Click **Publish**

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click the **Web** icon (`</>`)
4. Register app (if not already registered)
5. Copy the configuration object

### Step 6: Configure Environment Variables

1. Create `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIza...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Step 7: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 8: Run Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Making Your First Admin User

After creating your account, you need to manually set yourself as admin:

1. Go to Firebase Console > Firestore Database
2. Find your user document in the `users` collection
3. Edit the document
4. Change the `role` field from `user` to `admin`
5. Save

Now you can access the admin dashboard!

## Troubleshooting

### "Missing Firebase environment variables" error
- Make sure `.env` file exists in the root directory
- Check all variables are filled in
- Restart the development server after creating `.env`

### Authentication not working
- Verify Authentication is enabled in Firebase Console
- Check sign-in methods are enabled
- Verify environment variables are correct

### Firestore permission denied
- Check security rules are published
- Verify rules allow your operations
- Check user is authenticated

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
- Clear build cache: `npm run build -- --no-cache`

## Next Steps

- Customize the app for your needs
- Add more features
- Deploy to Firebase Hosting (see README.md)
- Set up custom domain
- Configure analytics
