# CogniCare - Cognitive Retraining Platform

<div align="center">

![CogniCare](https://img.shields.io/badge/CogniCare-Cognitive%20Retraining-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8)
![Firebase](https://img.shields.io/badge/Firebase-10.12.2-ffca28)

</div>

## 🧠 About CogniCare

CogniCare is an advanced cognitive retraining platform that combines EEG neurofeedback with home-based training for children with developmental disabilities. Our platform provides comprehensive tools for therapists, parents, and children to engage in effective cognitive therapy sessions with real-time data synchronization and secure cloud storage.

### 🎯 Key Features

- **Multi-User Dashboards**: Specialized interfaces for therapists, parents, and children
- **Real-time Authentication**: Secure Firebase Auth with role-based access control
- **Cloud Database**: Firebase Firestore for real-time data synchronization
- **EEG Monitoring**: Real-time neurofeedback integration for enhanced therapy sessions
- **Patient Management**: Comprehensive patient tracking and progress monitoring
- **Interactive Games**: Engaging cognitive training activities
- **Progress Analytics**: Detailed insights and reporting capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Production Ready**: Clean, optimized codebase with no unnecessary files

## 🔥 Firebase Integration

CogniCare is fully integrated with Firebase for production-ready cloud functionality:

### Firebase Services
- **Authentication**: Secure user authentication with role-based access
- **Firestore Database**: Real-time cloud database for all application data
- **Storage**: Secure file storage for reports and documents
- **Analytics**: User behavior and performance tracking

### Database Collections
- **`users`**: User profiles with roles (therapist, parent, child)
- **`patients`**: Patient demographics and medical information
- **`sessions`**: Therapy session records and progress data
- **`kpis`**: Key Performance Indicators and metrics
- **`eeg_readings`**: Real-time EEG data and brainwave measurements
- **`reports`**: Generated reports and analytics documents

### Key Performance Indicators
- **Attention Span**: Minutes of sustained focus during tasks
- **Task Accuracy**: Percentage of correctly completed exercises
- **Reaction Time**: Response speed in milliseconds
- **Memory Recall**: Percentage of information retained
- **Social Interaction Scores**: Communication and social skill ratings
- **EEG Metrics**: Alpha, beta, theta, and delta wave measurements

### Authentication System
- **Demo Users**: Pre-configured demo accounts for testing
  - `therapist@cognicare.com` - Healthcare Professional
  - `parent@cognicare.com` - Parent/Caregiver
  - `child@cognicare.com` - Young Learner
- **Role-based Navigation**: Automatic dashboard routing based on user role
- **Session Persistence**: Maintains login state across browser sessions

### User Roles
- **Therapists**: Access patient lists, monitor progress, configure treatment plans
- **Parents**: View child's progress, schedule sessions, communicate with therapists
- **Children**: Engage with interactive games and training modules

### Core Components
- **Dashboard System**: Role-based user interfaces
- **EEG Integration**: Real-time neurofeedback monitoring
- **Game Engine**: Interactive cognitive training modules
- **Analytics Engine**: Progress tracking and reporting

## 🚀 Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Fast build tool and development server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI component library

### Key Libraries
- **React Router DOM** - Client-side routing with BrowserRouter
- **Firebase SDK** - Authentication, Firestore, and Storage
- **React Hook Form** - Performant forms with easy validation
- **Recharts** - Responsive chart library for analytics
- **TanStack Query** - Powerful data synchronization
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Beautiful icons
- **Zod** - TypeScript-first schema validation
- **Sonner** - Toast notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Quick Start

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd build-your-dream-58

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# The app will be available at http://localhost:8080
```

### 🔐 Demo Access

The application includes pre-configured demo accounts for testing:

1. **Healthcare Professional**: Click "Enter as Healthcare Professional"
2. **Parent/Caregiver**: Click "Enter as Parent / Caregiver"  
3. **Young Learner**: Click "Enter as Young Learner"

Each role provides access to specialized dashboards with sample data and full functionality.

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Build for production
npm run build:dev    # Build for development environment

# Quality Assurance
npm run lint         # Run ESLint for code quality
npm run preview      # Preview production build locally
```

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard components for different user roles
│   │   ├── ChildDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── TherapistDashboard.tsx
│   │   ├── EEGMonitor.tsx
│   │   └── PatientList.tsx
│   ├── landing/           # Landing page components
│   ├── modals/            # Modal dialogs
│   └── ui/                # Reusable UI components (shadcn/ui)
├── contexts/              # React contexts (AuthContext)
├── hooks/                 # Custom React hooks
│   ├── use-firebase.ts    # Firebase-specific hooks
│   └── use-database.ts    # Database operation hooks
├── lib/                   # Utility functions and services
│   ├── firebase.ts        # Firebase configuration
│   ├── firebase-service.ts # Main Firebase service layer
│   └── mock-database.ts   # Mock database for development
└── pages/                 # Main page components
```

## 🎮 User Interfaces

### Therapist Dashboard
- Patient management and overview
- EEG monitoring capabilities
- Progress tracking and analytics
- Session scheduling and notes

### Parent Dashboard
- Child's progress visualization
- Communication with therapists
- Home training activities
- Appointment management

### Child Interface
- Interactive cognitive games
- Progress rewards and achievements
- Age-appropriate UI design
- Gamified learning experience

## 🔧 Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent component structure
- Proper error handling

### Component Development
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow accessibility best practices
- Maintain responsive design principles

## 🚀 Deployment

### Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init hosting`
4. Build the project: `npm run build`
5. Deploy: `firebase deploy`

### Vercel
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Similar setup with drag-and-drop or Git integration
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **AWS S3 + CloudFront**: For enterprise-level hosting

### Build Configuration
```bash
# Production build
npm run build

# Development build (with source maps)
npm run build:dev
```

### Environment Variables
Create a `.env.local` file for Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🔒 Security & Privacy

- **HIPAA-compliant data handling** with Firebase security rules
- **Secure patient information storage** in encrypted Firestore
- **Encrypted data transmission** via HTTPS
- **Role-based access control** with Firebase Authentication
- **Real-time security rules** for data validation
- **Secure user sessions** with automatic token refresh

## 📋 Recent Updates

### ✅ Completed Features
- **Firebase Integration**: Full cloud database and authentication system
- **Role-based Navigation**: Seamless user experience with automatic dashboard routing
- **Production Optimization**: Removed unnecessary files and cleaned up codebase
- **Authentication System**: Demo user accounts with secure login/logout
- **Real-time Data Sync**: Live updates across all user interfaces
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🔧 Technical Improvements
- **Clean Architecture**: Separated concerns with dedicated service layers
- **Type Safety**: Comprehensive TypeScript interfaces for all data models
- **Error Handling**: Robust error management throughout the application
- **Performance**: Optimized bundle size and loading times
- **Code Quality**: ESLint configuration and consistent coding standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions about CogniCare, please contact:
- **Email**: support@cognicare.com
- **Documentation**: [docs.cognicare.com](https://docs.cognicare.com)

---

<div align="center">
Built with ❤️ by the CogniCare Team
</div>
