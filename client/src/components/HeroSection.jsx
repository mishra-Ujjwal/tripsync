import { motion } from 'framer-motion';
import { Eye, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const destinationCards = [
  { title: 'Tokyo', subtitle: '5 days · Culture', gradient: 'from-indigo-300 to-violet-400', emoji: '🇯🇵' },
  { title: 'Amalfi Coast', subtitle: '7 days · Romance', gradient: 'from-teal-300 to-cyan-400', emoji: '🇮🇹' },
  { title: 'Marrakech', subtitle: '4 days · Adventure', gradient: 'from-amber-300 to-orange-400', emoji: '🇲🇦' },
  { title: 'Reykjavik', subtitle: '6 days · Nature', gradient: 'from-rose-300 to-pink-400', emoji: '🇮🇸' },
];

const stats = [
  ['12K+', 'Trips Planned'],
  ['98%', 'Satisfaction'],
  ['180+', 'Destinations'],
  ['30s', 'Avg. Generation'],
];

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grad-hero relative overflow-hidden pb-16 pt-24 sm:pb-24">
      <div className="ambient-orb right-10 top-20 h-64 w-64 bg-brand-500/10" />
      <div className="ambient-orb bottom-10 left-10 h-48 w-48 bg-teal-400/12" />

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-brand-500"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            Powered by Advanced AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-7xl"
          >
            Plan unforgettable
            <br />
            trips with <span className="headline-gradient">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6B6780] sm:text-xl"
          >
            Your personal AI travel architect, crafting bespoke day-by-day itineraries tailored to your style, pace, and passions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to={isAuthenticated ? '/planner' : '/login'}
              state={
                isAuthenticated
                  ? undefined
                  : {
                      from: { pathname: '/planner' },
                      authMessage: 'Log in to generate and save your personalized AI itinerary.',
                    }
              }
              className="premium-button px-8 py-4 text-base"
            >
              <Wand2 className="h-5 w-5" />
              Start Planning
            </Link>
            <Link to="/result" className="secondary-button px-8 py-4 text-base">
              <Eye className="h-5 w-5" />
              See Example
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map(([value, label]) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <div className="font-heading text-2xl font-extrabold headline-gradient">{value}</div>
              <div className="mt-1 text-sm text-[#6B6780]">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {destinationCards.map((card, index) => (
            <div
              key={card.title}
              className={`card-hover relative flex h-48 items-end overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${card.gradient} p-4 text-white sm:h-56 ${index % 2 === 1 ? 'animate-float-soft' : ''}`}
              style={index % 2 === 1 ? { animationDelay: `${index * 0.5}s` } : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B2E]/70 to-transparent" />
              <div className="glass absolute right-3 top-3 z-10 rounded-lg px-2 py-1 text-xs font-semibold text-ink">
                {card.emoji}
              </div>
              <div className="relative z-10">
                <div className="font-heading text-lg font-bold">{card.title}</div>
                <div className="text-xs text-white/80">{card.subtitle}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-3 rounded-[1.65rem] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_18px_50px_rgba(91,76,219,0.08)] backdrop-blur"
        >
          <div className="rounded-xl bg-brand-500/10 p-2 text-brand-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm text-[#6B6780]">
            Generate day-wise plans, refine single days, save trips, and reopen them anytime from your dashboard.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
