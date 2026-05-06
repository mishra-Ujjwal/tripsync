import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import LoadingScreen from '../components/LoadingScreen';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { isAuthenticated, loading, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const authMessage =
    location.state?.authMessage || 'Log in to generate itineraries, save your trips, and reopen them anytime.';
  const redirectTo = location.state?.from?.pathname || '/planner';
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, isAuthenticated, navigate, redirectTo]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form);
      pushToast({
        type: 'success',
        title: 'Welcome back',
        message: 'Your itinerary workspace is ready.',
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Login failed',
        message: error.response?.data?.message || 'We could not sign you in right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section-shell py-16">
        <LoadingScreen title="Opening your account" subtitle="Checking whether you already have an active secure session." />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-radial">
      <div className="ambient-orb left-8 top-16 h-48 w-48 bg-brand-500/12" />
      <div className="ambient-orb right-8 top-24 h-56 w-56 bg-teal-400/12" />
      <div className="section-shell flex min-h-screen items-center py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-500 shadow-[0_10px_30px_rgba(91,76,219,0.08)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Secure itinerary workspace
            </div>
            <h1 className="mt-6 font-heading text-5xl font-black tracking-tight text-ink sm:text-6xl">
              Welcome back to <span className="headline-gradient">TripSync</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">{authMessage}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Generate premium itineraries', 'Save trip history securely', 'Regenerate day plans anytime'].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/60 bg-white/75 px-4 py-4 text-sm font-semibold text-ink shadow-[0_18px_50px_rgba(30,27,46,0.06)] backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_32px_90px_rgba(30,27,46,0.10)] backdrop-blur sm:p-10"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-500">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-500">Login</p>
                <h2 className="mt-1 font-heading text-3xl font-bold text-ink">Access your premium trip planner</h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-surface/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
                {errors.email ? <p className="mt-2 text-sm text-rose-500">{errors.email}</p> : null}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-surface/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                  placeholder="Enter your password"
                />
                {errors.password ? <p className="mt-2 text-sm text-rose-500">{errors.password}</p> : null}
              </label>
            </div>

            <button type="submit" disabled={submitting} className="premium-button mt-8 w-full px-6 py-4 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Signing you in...' : 'Log In'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-6 text-sm text-slate-500">
              New here?{' '}
              <Link to="/register" state={{ from: location.state?.from }} className="font-semibold text-brand-500 hover:text-brand-600">
                Create your account
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
