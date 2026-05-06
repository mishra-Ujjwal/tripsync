import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, UserPlus2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { isAuthenticated, loading, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim() || !emailRegex.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      pushToast({
        type: 'success',
        title: 'Account created',
        message: 'You can now generate and save premium itineraries.',
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Sign-up failed',
        message: error.response?.data?.message || 'We could not create your account right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section-shell py-16">
        <LoadingScreen title="Preparing your account" subtitle="Checking whether you already have an active premium session." />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-radial">
      <div className="ambient-orb left-0 top-20 h-52 w-52 bg-brand-500/12" />
      <div className="ambient-orb right-10 top-24 h-60 w-60 bg-sunset/10" />
      <div className="section-shell flex min-h-screen items-center py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_32px_90px_rgba(30,27,46,0.10)] backdrop-blur sm:p-10 lg:order-1"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-50 p-3 text-teal-600">
                <UserPlus2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-500">Register</p>
                <h2 className="mt-1 font-heading text-3xl font-bold text-ink">Create your travel workspace</h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-surface/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                  placeholder="Your name"
                />
                {errors.name ? <p className="mt-2 text-sm text-rose-500">{errors.name}</p> : null}
              </label>

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
                  placeholder="At least 8 characters"
                />
                {errors.password ? <p className="mt-2 text-sm text-rose-500">{errors.password}</p> : null}
              </label>
            </div>

            <button type="submit" disabled={submitting} className="premium-button mt-8 w-full px-6 py-4 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? 'Creating your account...' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" state={{ from: location.state?.from }} className="font-semibold text-brand-500 hover:text-brand-600">
                Log in
              </Link>
            </p>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="order-1 flex flex-col justify-center lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-500 shadow-[0_10px_30px_rgba(91,76,219,0.08)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Premium trip membership
            </div>
            <h1 className="mt-6 font-heading text-5xl font-black tracking-tight text-ink sm:text-6xl">
              Save every trip in one <span className="headline-gradient">beautiful dashboard</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              Create your account to unlock itinerary generation, saved trip history, secure session-based access, and day regeneration across devices.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                'Generate AI itineraries with secure account access',
                'Save and reopen your trip history anytime',
                'Regenerate individual days without losing the rest of the plan',
              ].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/60 bg-white/75 px-5 py-4 text-sm font-semibold text-ink shadow-[0_18px_50px_rgba(30,27,46,0.06)] backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
