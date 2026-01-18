# VoteApp - Voting Platform

A modern, secure voting platform built with React.js and Firebase. Create polls, collect votes, and view results with beautiful visualizations.

## Features

- ✅ **Poll Creation**: Create single or multiple choice polls
- ✅ **Voting System**: Secure voting with guest support
- ✅ **Real-time Results**: Beautiful charts and analytics
- ✅ **QR Code Sharing**: Share polls via QR codes
- ✅ **Bilingual Support**: Arabic & English with RTL support
- ✅ **Dark Mode**: Light and dark themes
- ✅ **Mobile Responsive**: Perfect on all devices

## Tech Stack

- **Frontend**: React.js (latest)
- **Backend**: Firebase (Authentication, Firestore, Storage, Hosting)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **i18n**: i18next

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/1010pm/voteapp.git
cd voteapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google Sign-In)
3. Create Firestore database
4. Enable Storage
5. Copy your Firebase config values to `.env` file

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Configuration
REACT_APP_NAME=VoteApp
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

### 5. Firestore Rules & Indexes

Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Deploy Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

### 6. Run the application

```bash
npm start
```

The app will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Deployment

Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Project Structure

```
voteapp/
├── public/
│   ├── firestore.rules          # Firestore security rules
│   └── manifest.json
├── src/
│   ├── components/              # Reusable components
│   │   ├── common/             # Common UI components
│   │   └── layout/             # Layout components
│   ├── context/                # React Context providers
│   ├── firebase/               # Firebase configuration
│   ├── locales/                # i18n translations
│   ├── pages/                  # Page components
│   │   ├── auth/              # Authentication pages
│   │   ├── polls/             # Poll-related pages
│   │   └── dashboard/         # Dashboard pages
│   ├── services/               # API services
│   ├── store/                  # Redux store
│   └── utils/                  # Utility functions
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── firebase.json               # Firebase configuration
├── firestore.indexes.json      # Firestore indexes
└── package.json
```

## Security Notes

⚠️ **Important**: Never commit `.env` file to version control. It contains sensitive Firebase credentials.

The `.env` file is already included in `.gitignore` to prevent accidental commits.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
