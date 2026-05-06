import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="section-shell py-16">
        <LoadingScreen title="Checking your session" subtitle="Verifying your secure login before opening premium trip tools." />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          authMessage: 'Log in to generate, save, and manage your personalized AI itinerary.',
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
