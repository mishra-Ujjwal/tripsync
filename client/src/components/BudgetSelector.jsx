const options = [
  { value: 'low', title: 'Budget', icon: '🎒', description: '$30-80/day' },
  { value: 'medium', title: 'Mid-Range', icon: '🏨', description: '$80-200/day' },
  { value: 'luxury', title: 'Luxury', icon: '💎', description: '$200+/day' },
];

const BudgetSelector = ({ value, onChange }) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {options.map((option) => {
      const active = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`card-hover rounded-[1.3rem] border p-4 text-center transition ${
            active
              ? 'border-brand-500 bg-gradient-to-br from-brand-500/8 to-brand-600/5 shadow-[0_0_0_2px_rgba(91,76,219,0.18)]'
              : 'border-black/10 bg-white hover:border-brand-200'
          }`}
        >
          <div className="text-2xl">{option.icon}</div>
          <p className="mt-2 font-heading text-sm font-bold text-ink">{option.title}</p>
          <p className="mt-1 text-xs text-[#6B6780]">{option.description}</p>
        </button>
      );
    })}
  </div>
);

export default BudgetSelector;
