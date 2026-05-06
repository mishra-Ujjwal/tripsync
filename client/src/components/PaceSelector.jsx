const options = [
  { value: 'relaxed', title: 'Relaxed', icon: '🐢', description: 'Room to linger and breathe' },
  { value: 'balanced', title: 'Balanced', icon: '⚖️', description: 'Steady rhythm with highlights' },
  { value: 'packed', title: 'Fast-Paced', icon: '🚀', description: 'High-energy and activity-rich' },
];

const PaceSelector = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((option) => {
      const active = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
            active
              ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_10px_22px_rgba(91,76,219,0.18)]'
              : 'border-black/10 bg-white text-ink hover:border-brand-200'
          }`}
        >
          <span className="mr-2">{option.icon}</span>
          {option.title}
          <span className={`ml-2 hidden text-xs sm:inline ${active ? 'text-white/75' : 'text-[#6B6780]'}`}>{option.description}</span>
        </button>
      );
    })}
  </div>
);

export default PaceSelector;
