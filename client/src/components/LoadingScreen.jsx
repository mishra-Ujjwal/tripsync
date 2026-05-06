import { motion } from 'framer-motion';

const LoadingScreen = ({ title = 'Generating your itinerary', subtitle = 'Scoring places, balancing routes, and refining the plan with AI.' }) => (
  <div className="premium-card overflow-hidden p-8">
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ scaleX: 0.3 }}
        animate={{ scaleX: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}
        className="h-2 origin-left rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-teal-400"
      />
      <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-slate-950">{title}</h3>
      <p className="max-w-xl text-sm leading-7 text-slate-500">{subtitle}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 p-5">
            <div className="animate-pulse">
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-200" />
              <div className="mt-6 h-24 rounded-[1.25rem] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingScreen;
