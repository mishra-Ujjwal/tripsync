import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmptyState = ({
  title = 'No trips saved yet',
  description = 'Create a trip plan and save it to build your travel dashboard.',
  ctaLabel = 'Create a trip',
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      <Link
        to={isAuthenticated ? '/planner' : '/login'}
        state={
          isAuthenticated
            ? undefined
            : {
                from: { pathname: '/planner' },
                authMessage: 'Log in to create and store your itinerary history.',
              }
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
      >
        {ctaLabel}
      </Link>
    </div>
  );
};

export default EmptyState;