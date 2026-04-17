import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CaregiverDashboard from './pages/CaregiverDashboard';
import PatientDetail from './pages/PatientDetail';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReportsDashboard from './pages/ReportsDashboard';
import ReportsPage from './pages/ReportsPage';
import CareTeamPage from './pages/CareTeamPage';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

const PrivateRoute = ({ children, role }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(role) ? role : [role];
  if (role && !roles.includes(user.role)) {
    if (user.role === 'caregiver') return <Navigate to="/dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <PrivateRoute role="caregiver"><CaregiverDashboard /></PrivateRoute>
      } />
      <Route path="/doctor" element={
        <PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>
      } />
      <Route path="/patients/:id" element={
        <PrivateRoute role={['caregiver', 'doctor']}><PatientDetail /></PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute role={['caregiver', 'doctor']}><ReportsDashboard /></PrivateRoute>
      } />
      <Route path="/care-team" element={
        <PrivateRoute role={['caregiver', 'patient']}><CareTeamPage /></PrivateRoute>
      } />
      <Route path="/reports/:patientId" element={
        <PrivateRoute role={['caregiver', 'doctor']}><ReportsPage /></PrivateRoute>
      } />
      <Route path="/patient" element={
        <PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
