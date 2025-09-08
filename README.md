# CogniCare - Cognitive Retraining Platform

<div align="center">

![CogniCare](https://img.shields.io/badge/CogniCare-Cognitive%20Retraining-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8)

</div>

## 🧠 About CogniCare

CogniCare is an advanced cognitive retraining platform that combines EEG neurofeedback with home-based training for children with developmental disabilities. Our platform provides comprehensive tools for therapists, parents, and children to engage in effective cognitive therapy sessions.

### 🎯 Key Features

- **Multi-User Dashboards**: Specialized interfaces for therapists, parents, and children
- **EEG Monitoring**: Real-time neurofeedback integration for enhanced therapy sessions
- **Patient Management**: Comprehensive patient tracking and progress monitoring
- **Interactive Games**: Engaging cognitive training activities
- **Progress Analytics**: Detailed insights and reporting capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 📊 Database & KPI System

CogniCare includes a comprehensive database system that tracks and manages all patient KPIs and session data:

### Database Features
- **Patient Management**: Complete patient profiles with demographics and conditions
- **Session Tracking**: Detailed therapy session records with progress scores
- **KPI Metrics**: Real-time tracking of cognitive performance indicators
- **EEG Integration**: Brainwave data storage and analysis
- **Progress Analytics**: Historical trends and improvement tracking

### Key Performance Indicators
- **Attention Span**: Minutes of sustained focus during tasks
- **Task Accuracy**: Percentage of correctly completed exercises
- **Reaction Time**: Response speed in milliseconds
- **Memory Recall**: Percentage of information retained
- **Social Interaction Scores**: Communication and social skill ratings
- **EEG Metrics**: Alpha, beta, theta, and delta wave measurements

### Database Structure
```
Users (therapists, parents, children)
├── Patients (demographics, conditions)
│   ├── Therapy Sessions (progress, notes)
│   ├── KPI Metrics (performance data)
│   └── EEG Readings (brainwave data)
```

The system uses a mock database service for development that simulates real SQLite functionality, providing sample data for all dashboard components and analytics.

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
- **React Router DOM** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **Recharts** - Responsive chart library for analytics
- **TanStack Query** - Powerful data synchronization
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Beautiful icons
- **Zod** - TypeScript-first schema validation

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
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
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

### Vercel (Recommended)
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

## 🔒 Security & Privacy

- HIPAA-compliant data handling
- Secure patient information storage
- Encrypted data transmission
- Role-based access control

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
