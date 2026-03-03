import { createBrowserRouter, Navigate } from 'react-router';
import AuthView from './views/AuthView';
import PatientView from './views/PatientView';
import CaregiverView from './views/CaregiverView';
import { useAuth } from './lib/auth-context';

function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole?: 'patient' | 'caregiver';
}) {
  const { user, userProfile, loading } = useAuth();

  // Check for demo mode flag in sessionStorage
  const isDemoMode = sessionStorage.getItem('demoMode') === 'true';
  const demoRole = sessionStorage.getItem('demoRole');

  if (loading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access in demo mode
  if (isDemoMode) {
    if (requiredRole && demoRole !== requiredRole) {
      return <Navigate to={demoRole === 'patient' ? '/patient' : '/caregiver'} replace />;
    }
    return <>{children}</>;
  }

  // Regular authentication check
  if (!user || !userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to={userProfile.role === 'patient' ? '/patient' : '/caregiver'} replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />
  },
  {
    path: '/auth',
    element: <AuthView />
  },
  {
    path: '/patient',
    element: (
      <ProtectedRoute requiredRole="patient">
        <PatientView />
      </ProtectedRoute>
    )
  },
  {
    path: '/caregiver',
    element: (
      <ProtectedRoute requiredRole="caregiver">
        <CaregiverView />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/auth" replace />
  }
]);