# Firebase Rules Deployment Instructions

## Manual Deployment via Firebase Console

Since the Firebase CLI is having authentication issues in the dev container, please follow these steps to deploy the Firestore security rules:

### Step 1: Access Firebase Console
1. Open your web browser and go to: https://console.firebase.google.com/
2. Select your project: **cognicare-6b2a9**

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click on **Firestore Database**
2. Click on the **Rules** tab at the top

### Step 3: Copy and Paste the Rules
1. Copy the entire contents of the `firestore.rules` file in your project
2. Paste it into the rules editor in the Firebase console
3. Click **Publish** to deploy the rules

### Step 4: Verify Deployment
The rules should now be active. You can test by:
1. Running your application: `npm run dev`
2. Logging in and trying to access patient data
3. Checking the browser console for any permission errors

## Alternative: CLI Deployment (if authentication works)

If you want to try the CLI again later:

```bash
# Login to Firebase
firebase login

# Deploy only the Firestore rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

## Current Rules Summary

The deployed rules will:
- ✅ Allow all authenticated users to read/write data
- ✅ Require authentication for all operations
- ✅ Allow anonymous authentication (which your app uses)
- ✅ Support all collections: patients, sessions, kpis, reports, eeg_readings, users

## Troubleshooting

If you still see permission errors after deployment:
1. Check that the rules are published in the Firebase console
2. Wait 1-2 minutes for the rules to propagate
3. Clear your browser cache and reload the application
4. Check the browser console for specific error messages

## Security Note

These rules are permissive for development. For production, consider implementing:
- Role-based access control
- User-specific data access
- Resource-level permissions
- Data validation rules
