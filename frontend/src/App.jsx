import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { AiAssistantWidget } from './components/AiAssistantWidget';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { NetworkPage } from './pages/NetworkPage';
import { ProfilePage } from './pages/ProfilePage';
import { KnowledgeHubPage } from './pages/KnowledgeHubPage';
import { EventsPage } from './pages/EventsPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { ExamEligibilityPage } from './pages/ExamEligibilityPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CADETCONNECT ERROR BOUNDARY]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white text-navy-900 border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-olive-100 rounded-xl flex items-center justify-center mx-auto text-olive-700 font-bold text-xl">
              🛡️
            </div>
            <h2 className="text-lg font-bold">CadetConnect Platform Notice</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Something went wrong while loading this page. Click below to reload the app.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-all"
            >
              Reload CadetConnect
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pb-20 lg:pb-0 relative overflow-x-hidden max-w-full">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Protected Main Pages */}
          <Route path="/home" element={<ProtectedRoute><HomeFeedPage /></ProtectedRoute>} />
          <Route path="/eligibility" element={<ProtectedRoute><ExamEligibilityPage /></ProtectedRoute>} />
          <Route path="/exam-eligibility" element={<ProtectedRoute><ExamEligibilityPage /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/cadet/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/aspirant/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><KnowledgeHubPage /></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/mentorship" element={<ProtectedRoute><MentorshipPage /></ProtectedRoute>} />
          <Route path="/mentor/:id" element={<ProtectedRoute><MentorshipPage /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
          <Route path="/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
        </Routes>
      </div>
      <AiAssistantWidget />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
