export const TripStatsCard = ({ days, activityCount, foodCount, tipsCount, tripInputs }) => {
  const rows = [
    { label: 'Duration', value: `${days} day${days === 1 ? '' : 's'}` },
    { label: 'Activities planned', value: `${activityCount}+` },
    { label: 'Restaurants suggested', value: String(foodCount) },
    { label: 'Local tips', value: String(tipsCount) },
    tripInputs?.budget && { label: 'Budget level', value: tripInputs.budget },
    tripInputs?.travelStyle && { label: 'Travel style', value: tripInputs.travelStyle },
  ].filter(Boolean);

  return (
    <div className="sidebar-card">
      <h3 className="sidebar-card__title">Trip statistics</h3>
      <div className="stats-list">
        {rows.map(({ label, value }) => (
          <div key={label} className="stats-row">
            <span className="stats-row__label">{label}</span>
            <span className="stats-row__value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EssentialTipsCard = ({ tips }) => {
  const defaultTips = [
    { icon: '🎯', text: 'This plan is backend-structured first, then AI-polished for smoother pacing.' },
    { icon: '🗂️', text: 'Save to reopen later, regenerate specific days, and keep a travel history.' },
    { icon: '🧭', text: 'Destination banners are enriched from Google Places with attribution preserved.' },
    { icon: '💡', text: 'Tap "Regenerate day" on any day to get a fresh plan for just that date.' },
  ];

  const items = tips || defaultTips;

  return (
    <div className="sidebar-card sidebar-card--tinted">
      <h3 className="sidebar-card__title">Essential tips</h3>
      <div className="tips-list">
        {items.map((tip, i) => (
          <div key={i} className="tips-list__item">
            <span className="tips-list__icon">{tip.icon}</span>
            <span className="tips-list__text">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripStatsCard;