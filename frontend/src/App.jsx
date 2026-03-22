import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutTracker = lazy(() => import('./pages/WorkoutTracker'));
const DietTracker = lazy(() => import('./pages/DietTracker'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const PlanGenerator = lazy(() => import('./pages/PlanGenerator'));
const ProgressTracker = lazy(() => import('./pages/ProgressTracker'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const NotFoundPage = () => {
  const { user } = useAuth();
  const redirectPath = user ? '/dashboard' : '/';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404</h1>
      <p style={{ opacity: 0.8 }}>The page you requested was not found.</p>
      <Link to={redirectPath} style={{ color: 'var(--primary-light)' }}>
        Go back
      </Link>
    </div>
  );
};

const RouteLoader = () => (
  <div className="route-loader-wrap">
    <div className="route-loader-card">
      <div className="route-loader-line w-40" />
      <div className="route-loader-line w-72" />
      <div className="route-loader-line w-64" />
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workouts" element={<WorkoutTracker />} />
        <Route path="diet" element={<DietTracker />} />
        <Route path="ai-chat" element={<AIAssistant />} />
        <Route path="plans" element={<PlanGenerator />} />
        <Route path="progress" element={<ProgressTracker />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#020817' } },
          }}
        />
        <Suspense fallback={<RouteLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
