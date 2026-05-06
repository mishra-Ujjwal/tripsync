import { Compass, LogOut, Sparkles } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/saved-trips', label: 'Saved Trips' },
];

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const plannerState = isAuthenticated
    ? undefined
    : {
        from: { pathname: '/planner' },
        authMessage: 'Log in to generate and save your personalized AI itinerary.',
      };

  const handleLogout = async () => {
    try {
      await logout();
      pushToast({
        type: 'success',
        title: 'Logged out',
        message: 'Your secure session has been closed.',
      });

      if (location.pathname !== '/') {
        navigate('/');
      }
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Logout failed',
        message: error.response?.data?.message || 'We could not log you out right now.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-[#f7f6f3]/95 backdrop-blur-2xl">
      <div className="section-shell flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-ink">
            Trip<span className="headline-gradient">Sync</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B6780] md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `transition ${isActive ? 'text-ink' : 'hover:text-ink'}`}>
              {item.label}
            </NavLink>
          ))}
          <a href="/#how-it-works" className="transition hover:text-ink">
            How it works
          </a>
          <a href="/#destinations" className="transition hover:text-ink">
            Destinations
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-ink sm:block">
                {user?.name}
              </div>
              <button type="button" onClick={handleLogout} className="secondary-button hidden px-4 py-2.5 sm:inline-flex">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="secondary-button hidden px-4 py-2.5 sm:inline-flex">
                Login
              </Link>
              <Link to="/register" className="secondary-button hidden px-4 py-2.5 md:inline-flex">
                Register
              </Link>
            </>
          )}

          

          <Link to={isAuthenticated ? '/planner' : '/login'} state={plannerState} className="premium-button px-4 py-2.5 sm:hidden">
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
