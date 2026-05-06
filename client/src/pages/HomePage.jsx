import { motion } from 'framer-motion';
import { Brain, Clock3, Globe, Heart, Layers, RefreshCcw, Share2, Sparkles, UtensilsCrossed, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    title: 'Tell us your dream',
    copy: 'Share your destination, dates, budget, interests, and travel style. We handle the rest.',
    icon: Globe,
    number: 1,
    tone: 'from-brand-500 to-brand-600',
  },
  {
    title: 'AI crafts your plan',
    copy: 'Our AI analyzes thousands of options to build a perfectly paced, personalized itinerary.',
    icon: Brain,
    number: 2,
    tone: 'from-teal-500 to-cyan-400',
  },
  {
    title: 'Pack and explore',
    copy: 'Refine, save, share, and hit the road with a plan designed just for you.',
    icon: Heart,
    number: 3,
    tone: 'from-[#F97066] to-amber-400',
  },
];

const reasons = [
  { title: 'Hyper-Personalized', copy: 'Every itinerary reflects your unique interests, pace, and style instead of template-heavy travel plans.', icon: Brain, tint: 'bg-brand-500/8 text-brand-500' },
  { title: 'Saves Hours', copy: 'What usually takes hours of research becomes a polished plan in seconds, with practical sequencing and cost clarity.', icon: Clock3, tint: 'bg-teal-500/8 text-teal-600' },
  { title: 'Budget-Aware', copy: 'Recommendations respect your spend level without flattening the trip into generic low-value suggestions.', icon: Wallet, tint: 'bg-[#F97066]/8 text-[#F97066]' },
  { title: 'Infinitely Flexible', copy: 'Regenerate any day, adjust pace, and keep refining until the trip fits how you actually travel.', icon: RefreshCcw, tint: 'bg-violet-100 text-violet-600' },
  { title: 'Local Flavors', copy: 'Food suggestions, hidden gems, and local tips help the itinerary feel grounded in the destination.', icon: UtensilsCrossed, tint: 'bg-emerald-50 text-emerald-600' },
  { title: 'Easy Sharing', copy: 'Save your plan, revisit later, and keep companions aligned with a cleaner trip-planning workflow.', icon: Share2, tint: 'bg-blue-50 text-blue-600' },
];

const destinations = [
  { title: 'Santorini', copy: 'Romance · Sunsets · Aegean Sea', emoji: '🇬🇷', gradient: 'from-violet-400 via-indigo-400 to-blue-500' },
  { title: 'Bangkok', copy: 'Street Food · Temples · Nightlife', emoji: '🇹🇭', gradient: 'from-emerald-400 via-teal-400 to-cyan-500' },
  { title: 'Cusco', copy: 'Inca Trails · Mountains · History', emoji: '🇵🇪', gradient: 'from-amber-400 via-orange-400 to-rose-500' },
];

const testimonials = [
  {
    initials: 'SK',
    name: 'Sarah K.',
    meta: 'Solo traveler · Tokyo',
    copy: 'This completely changed how I plan trips. My Japan itinerary felt thoughtful, polished, and realistic instead of overloaded.',
    tone: 'grad-cool',
  },
  {
    initials: 'M&J',
    name: 'Marco & Julia',
    meta: 'Couple · Amalfi Coast',
    copy: 'It understood “romantic but adventurous” better than most travel agents we tried. The pacing felt incredibly natural.',
    tone: 'grad-warm',
  },
  {
    initials: 'DL',
    name: 'David L.',
    meta: 'Backpacker · Southeast Asia',
    copy: 'As a budget traveler, I loved that it kept things affordable without making the trip feel stripped down.',
    tone: 'grad-accent',
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <HeroSection />

      <section className="py-20 sm:py-28 bg-white/95"  >
        <div className="section-shell">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full  px-3 py-1 text-sm font-semibold text-brand-500">
              <Layers className="h-4 w-4" />
              How It Works
            </div>
            <h2 className="section-heading mt-4">
              Three steps to your <span className="headline-gradient">perfect trip</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="card-hover relative overflow-hidden rounded-[1.85rem] border border-black/[0.04] bg-white p-8"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-500/5 blur-2xl" />
                  <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.tone} text-white`}>
                    <Icon className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-brand-500">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6B6780]">{step.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/95 py-10 sm:py-28">
        <div className="section-shell">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/8 px-3 py-1 text-sm font-semibold text-teal-600">
              <Heart className="h-4 w-4" />
              Why Travelers Love Us
            </div>
            <h2 className="section-heading mt-4">
              Built for <span className="headline-gradient">real travelers</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card-hover rounded-[1.6rem] border border-black/[0.04] bg-white p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tint}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-ink">{item.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#6B6780]">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="destinations" className="py-20 sm:py-28 bg-white/95">
        <div className="section-shell">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/8 px-3 py-1 text-sm font-semibold text-brand-500">
              <Globe className="h-4 w-4" />
              Trending Destinations
            </div>
            <h2 className="section-heading mt-4">
              Where will <span className="headline-gradient">you go</span> next?
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {destinations.map((item) => (
              <Link
                key={item.title}
                to={isAuthenticated ? '/planner' : '/login'}
                state={
                  isAuthenticated
                    ? undefined
                    : {
                        from: { pathname: '/planner' },
                        authMessage: 'Log in to turn inspiration into a personalized AI itinerary.',
                      }
                }
                className={`card-hover relative flex h-72 items-end overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${item.gradient} p-6 text-white`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B2E]/70 to-transparent" />
                <div className="relative z-10">
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="mt-3 font-heading text-2xl font-bold">{item.title}</div>
                  <div className="mt-1 text-sm text-white/80">{item.copy}</div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Plan this trip
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-20 sm:py-28 bg-white/95">
        <div className="section-shell">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F97066]/8 px-3 py-1 text-sm font-semibold text-[#F97066]">
              <Heart className="h-4 w-4" />
              Testimonials
            </div>
            <h2 className="section-heading mt-4">
              Loved by <span className="headline-gradient">adventurers</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="card-hover rounded-[1.6rem] border border-black/[0.04] bg-white p-6">
                <div className="text-sm text-amber-500">★★★★★</div>
                <p className="mt-4 text-sm leading-7 text-[#6B6780]">{item.copy}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${item.tone}`}>
                    {item.initials}
                  </div>
                  <div>
                    <div className="font-heading text-sm font-semibold text-ink">{item.name}</div>
                    <div className="text-xs text-[#6B6780]">{item.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-white/95">
        <div className="section-shell">
          <div className="grad-accent relative overflow-hidden rounded-[2rem] px-10 py-12 text-center text-white sm:px-16 sm:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">Ready to plan your next adventure?</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80">
                Join thousands of happy travelers who plan smarter, not harder.
              </p>
              <Link
                to={isAuthenticated ? '/planner' : '/login'}
                state={
                  isAuthenticated
                    ? undefined
                    : {
                        from: { pathname: '/planner' },
                        authMessage: 'Log in to generate, save, and manage your personalized AI itineraries.',
                      }
                }
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-heading text-base font-bold text-brand-500 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Sparkles className="h-5 w-5" />
                Start Planning Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
