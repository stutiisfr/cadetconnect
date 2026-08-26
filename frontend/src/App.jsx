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
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
