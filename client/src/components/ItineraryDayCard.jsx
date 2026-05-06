import { motion } from 'framer-motion';
import { Coffee, Lightbulb, RefreshCcw, Sunrise, Sun, Moon } from 'lucide-react';

const slotConfig = [
  {
    key: 'morning',
    label: 'Morning',
    Icon: Sunrise,
    dotColor: 'bg-amber-400',
    labelColor: 'text-amber-700',
    labelBg: 'bg-amber-50',
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    Icon: Sun,
    dotColor: 'bg-blue-400',
    labelColor: 'text-blue-700',
    labelBg: 'bg-blue-50',
  },
  {
    key: 'evening',
    label: 'Evening',
    Icon: Moon,
    dotColor: 'bg-indigo-400',
    labelColor: 'text-indigo-700',
    labelBg: 'bg-indigo-50',
  },
];

const dayAccentColors = [
  'bg-indigo-900',
  'bg-teal-700',
  'bg-violet-800',
  'bg-slate-700',
  'bg-indigo-700',
];

const normalizePlaces = (places) => {
  if (!places?.length) return [];
  return places.map((p) =>
    typeof p === 'string'
      ? { name: p, note: '' }
      : { name: p?.name || 'Planned stop', note: p?.note || '' }
  );
};

const SlotSection = ({ slotKey, label, Icon, dotColor, labelColor, labelBg, places, isLast }) => {
  const normalized = normalizePlaces(places);
  if (!normalized.length) return null;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-slate-100" />}
      </div>

      <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
        <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${labelBg} ${labelColor}`}>
          <Icon className="h-3 w-3" />
          {label}
        </div>

        <div className="space-y-2.5">
          {normalized.map((place, i) => (
            <div
              key={`${slotKey}-${i}`}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-800">{place.name}</p>
              {place.note && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{place.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ItineraryDayCard = ({ day, onRegenerate, loading }) => {
  const accentBg = dayAccentColors[(day.dayNumber - 1) % dayAccentColors.length];

  const slotsWithContent = slotConfig.filter(
    ({ key }) => normalizePlaces(day[key]).length > 0
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${accentBg}`}
          >
            {day.dayNumber}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{day.title}</h3>
            <p className="text-xs text-slate-400">Day {day.dayNumber} itinerary</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRegenerate(day)}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh day
        </button>
      </div>

      <div className="mb-5">
        {slotsWithContent.map(({ key, label, Icon, dotColor, labelColor, labelBg }, idx) => (
          <SlotSection
            key={key}
            slotKey={key}
            label={label}
            Icon={Icon}
            dotColor={dotColor}
            labelColor={labelColor}
            labelBg={labelBg}
            places={day[key]}
            isLast={idx === slotsWithContent.length - 1}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {day.foodSuggestions?.length > 0 && (
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-teal-700">
              <Coffee className="h-3.5 w-3.5" />
              Food suggestions
            </div>
            <ul className="space-y-1">
              {day.foodSuggestions.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-teal-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {day.tips?.length > 0 && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Lightbulb className="h-3.5 w-3.5" />
              Local tips
            </div>
            <ul className="space-y-1">
              {day.tips.map((item) => (
                <li key={item} className="text-xs leading-relaxed text-indigo-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ItineraryDayCard;