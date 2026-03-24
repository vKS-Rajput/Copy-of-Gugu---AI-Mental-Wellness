import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import Dashboard from './pages/Dashboard';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistPatients from './pages/TherapistPatients';
import TherapistSchedule from './pages/TherapistSchedule';
import TherapistNotes from './pages/TherapistNotes';
import TherapistSettings from './pages/TherapistSettings';
import MeetingRoom from './pages/MeetingRoom';
import SignIn from './pages/SignIn';
import Videos from './pages/Videos';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />

          {/* Full-screen Meeting Room - outside Layout for immersive experience */}
          <Route path="/session/:id" element={<MeetingRoom />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="resources" element={<Videos />} />

            {/* Protected Routes for Patients */}
            <Route element={<ProtectedRoute allowedRole="patient" />}>
              <Route path="chat" element={<Chat />} />
              <Route path="therapists" element={<Therapists />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Protected Routes for Therapists */}
            <Route element={<ProtectedRoute allowedRole="therapist" />}>
              <Route path="therapist-dashboard" element={<TherapistDashboard />} />
              <Route path="patients" element={<TherapistPatients />} />
              <Route path="schedule" element={<TherapistSchedule />} />
              <Route path="notes" element={<TherapistNotes />} />
              <Route path="therapist-settings" element={<TherapistSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;