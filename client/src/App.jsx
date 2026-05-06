import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PlannerPage from './pages/PlannerPage';
import RegisterPage from './pages/RegisterPage';
import ResultPage from './pages/ResultPage';
import SavedTripsPage from './pages/SavedTripsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import { ToastProvider } from './hooks/useToast';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/saved-trips" element={<SavedTripsPage />} />
              <Route path="/trips/:id" element={<TripDetailsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
