import { motion } from 'framer-motion';
import { BrainCircuit, LayoutDashboard, LocateFixed, ShieldCheck } from 'lucide-react';

const features = [
  {
    title: 'Backend-led planning logic',
    description: 'Scored attractions, realistic pacing, and budget-aware day grouping before AI polish.',
    icon: BrainCircuit,
  },
  {
    title: 'Premium day-wise rendering',
    description: 'Cinematic cards, polished summaries, and investor-demo-ready itinerary presentation.',
    icon: LayoutDashboard,
  },
  {
    title: 'Travel context that feels useful',
    description: 'Meals, local tips, alternatives, and route-minded sequencing that make trips feel practical.',
    icon: LocateFixed,
  },
  {
    title: 'Production-style full stack',
    description: 'Mongo persistence, regenerate-day flows, validation, and robust API error handling.',
    icon: ShieldCheck,
  },
];

const FeatureCards = () => (
  <section className="bg-white/60 py-20 sm:py-28">
    <div className="section-shell">
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0EA5A0]/8 px-3 py-1 text-sm font-semibold text-[#0EA5A0]">Why Travelers Love It</p>
      <h2 className="section-heading mt-4">
        Built for <span className="headline-gradient">real travelers</span>
      </h2>
    </div>

    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="rounded-[1.5rem] border border-black/[0.04] bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B4CDB]/8 text-brand-500">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 font-heading text-xl font-bold text-ink">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6B6780]">{feature.description}</p>
          </motion.div>
        );
      })}
    </div>
    </div>
  </section>
);

export default FeatureCards;
