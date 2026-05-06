const labelMap = {
  history: '🏛️ History',
  architecture: '🏰 Architecture',
  culture: '🎭 Culture',
  food: '🍜 Food',
  shopping: '🛍️ Shopping',
  nature: '🌿 Nature',
  adventure: '🏃 Adventure',
  spiritual: '🧘 Spiritual',
  photography: '📸 Photography',
  relaxation: '🌅 Relaxation',
  nightlife: '🎉 Nightlife',
  'water sports': '🏖️ Water Sports',
  views: '🌄 Views',
};

const MultiSelectInterests = ({ options, value, onChange, error }) => {
  const toggle = (item) => {
    onChange(value.includes(item) ? value.filter((entry) => entry !== item) : [...value, item]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const active = value.includes(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_10px_18px_rgba(91,76,219,0.18)]'
                  : 'border-black/10 bg-white text-ink hover:border-brand-200'
              }`}
            >
              {labelMap[item] || item}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-rose-500">{error}</p> : null}
    </div>
  );
};

export default MultiSelectInterests;
