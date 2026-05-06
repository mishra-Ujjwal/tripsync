import { Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const budgetRows = [
  {
    key: 'stay',
    label: 'Accommodation',
    note: '4 nights with your chosen stay style',
    barColor: 'bg-indigo-500',
  },
  {
    key: 'food',
    label: 'Food & dining',
    note: 'Mix of local favourites and curated dining',
    barColor: 'bg-teal-500',
  },
  {
    key: 'tickets',
    label: 'Activities & tickets',
    note: 'Entries, highlights, and paid experiences',
    barColor: 'bg-violet-500',
  },
  {
    key: 'localTransport',
    label: 'Local transport',
    note: 'Transfers, transit, and practical movement',
    barColor: 'bg-orange-500',
  },
  {
    key: 'misc',
    label: 'Miscellaneous',
    note: 'Buffers for snacks, tips, and small add-ons',
    barColor: 'bg-slate-400',
  },
];

const BudgetBreakdownCard = ({ estimatedCost }) => {
  const total = estimatedCost?.total || 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h3 className="mb-6 flex items-center gap-3 text-base font-semibold text-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Calculator className="h-4 w-4" />
        </span>
        Budget breakdown
      </h3>

      <div className="space-y-5">
        {budgetRows.map(({ key, label, note, barColor }) => {
          const amount = estimatedCost?.[key] || 0;
          const pct = total ? Math.max(6, Math.round((amount / total) * 100)) : 0;

          return (
            <div key={key}>
              <div className="mb-1.5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{note}</p>
                </div>
                <span className="shrink-0 text-base font-semibold text-slate-800">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="text-sm font-semibold text-slate-700">Total estimated cost</span>
        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default BudgetBreakdownCard;