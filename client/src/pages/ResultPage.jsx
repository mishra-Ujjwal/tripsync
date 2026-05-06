import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookmarkPlus,
  Download,
  Map,
  RefreshCcw,
  Share2,
  Sparkles,
} from 'lucide-react';
import BudgetBreakdownCard from '../components/BudgetBreakdownCard';
import EmptyState from '../components/EmptyState';
import ItineraryDayCard from '../components/ItineraryDayCard';
import TripSummaryCard from '../components/TripSummaryCard';
import { useToast } from '../hooks/useToast';
import { tripApi } from '../services/api';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [tripData, setTripData] = useState(location.state);
  const [saveLoading, setSaveLoading] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);

  if (!tripData) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          title="No itinerary in session"
          description="Create a trip plan first, then you'll be able to review, regenerate, and save it here."
        />
      </section>
    );
  }

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const response = await tripApi.save({
        tripInputs: tripData.tripInputs,
        destinationImage: tripData.destinationImage,
        tripSummary: tripData.tripSummary,
        estimatedCost: tripData.estimatedCost,
        itinerary: tripData.itinerary,
      });
      pushToast({
        type: 'success',
        title: 'Trip saved',
        message: 'Your itinerary is now in the saved trips dashboard.',
      });
      navigate(`/trips/${response.data._id}`);
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Save failed',
        message: error.response?.data?.message || 'We could not save this trip yet.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRegenerate = async (day) => {
    setRegeneratingDay(day.dayNumber);
    try {
      const response = await tripApi.regenerateDay({
        tripInputs: tripData.tripInputs,
        day,
      });
      setTripData((current) => ({
        ...current,
        itinerary: current.itinerary.map((item) =>
          item.dayNumber === day.dayNumber ? response.data : item
        ),
      }));
      pushToast({
        type: 'success',
        title: `Day ${day.dayNumber} refreshed`,
        message: 'Your itinerary has been updated with a new day plan.',
      });
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Regeneration failed',
        message: error.response?.data?.message || 'We could not regenerate that day right now.',
      });
    } finally {
      setRegeneratingDay(null);
    }
  };

  const activityCount = tripData.itinerary.reduce(
    (total, day) =>
      total + (day.morning?.length || 0) + (day.afternoon?.length || 0) + (day.evening?.length || 0),
    0
  );

  const foodCount = tripData.itinerary.reduce(
    (total, day) => total + (day.foodSuggestions?.length || 0),
    0
  );

  const tipCount = tripData.itinerary.reduce(
    (total, day) => total + (day.tips?.length || 0),
    0
  );

  const statCards = [
    { label: 'Total days', value: String(tripData.itinerary.length), accent: 'text-indigo-600 bg-indigo-50' },
    {
      label: 'Estimated',
      value: tripData.estimatedCost?.total
        ? `₹${Number(tripData.estimatedCost.total).toLocaleString('en-IN')}`
        : '—',
      accent: 'text-teal-700 bg-teal-50',
    },
    {
      label: 'Pace',
      value: tripData.tripInputs?.pace || 'balanced',
      accent: 'text-orange-600 bg-orange-50',
    },
    { label: 'Activities', value: `${activityCount}+`, accent: 'text-violet-700 bg-violet-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <TripSummaryCard
        tripInputs={tripData.tripInputs}
        tripSummary={tripData.tripSummary}
        estimatedCost={tripData.estimatedCost}
        destinationImage={tripData.destinationImage}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative z-10 -mt-6 mb-8 flex flex-wrap items-center gap-2 pt-2">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to planner
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 active:scale-95"
          >
            <BookmarkPlus className="h-4 w-4" />
            {saveLoading ? 'Saving…' : 'Save trip'}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Regenerate
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  {label}
                </span>
              </div>
              <div className="text-2xl font-bold capitalize text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_288px]">
          <div className="space-y-6">
            <BudgetBreakdownCard estimatedCost={tripData.estimatedCost} />

            <div className="space-y-6">
              {tripData.itinerary.map((day) => (
                <ItineraryDayCard
                  key={day.dayNumber}
                  day={day}
                  onRegenerate={handleRegenerate}
                  loading={regeneratingDay === day.dayNumber}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-40 flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Map className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Interactive map</p>
                <p className="text-xs text-slate-400">Coming soon</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 text-sm font-semibold text-slate-800">Trip statistics</h4>
              <div className="space-y-3">
                {[
                  ['Duration', `${tripData.itinerary.length} days`],
                  ['Activities planned', `${activityCount}+`],
                  ['Restaurants suggested', foodCount],
                  ['Local tips', tipCount],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <h4 className="mb-3 text-sm font-semibold text-indigo-800">Essential tips</h4>
              <div className="space-y-2.5 text-xs leading-relaxed text-indigo-700">
                <p>Plan is AI-polished for smooth pacing and better recommendations.</p>
                <p>Save itinerary to reopen, regenerate specific days, and keep a travel history.</p>
                <p>Destination banners use Google Places photos with attribution preserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;