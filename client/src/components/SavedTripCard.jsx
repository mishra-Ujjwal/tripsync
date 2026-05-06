import { CalendarRange, MapPinned, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateRange } from '../utils/formatters';

const SavedTripCard = ({ trip, onDelete }) => (
  <article className="card-hover overflow-hidden rounded-[1.8rem] border border-black/[0.04] bg-white shadow-[0_20px_60px_-18px_rgba(91,76,219,0.12)]">
    <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{trip.tripType}</p>
          <h3 className="mt-3 font-heading text-2xl font-extrabold tracking-tight">{trip.destination}</h3>
          <p className="mt-3 text-sm leading-7 text-white/80">
            {trip.tripSummary?.vibe || 'Personalized itinerary ready to reopen.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(trip)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="p-5">
      <div className="grid gap-3 text-sm text-[#6B6780] sm:grid-cols-2">
        <div className="rounded-[1.2rem] bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-brand-500" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </div>
        </div>
        <div className="rounded-[1.2rem] bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-500" />
            {trip.travelers} traveler(s)
          </div>
        </div>
        <div className="rounded-[1.2rem] bg-surface px-4 py-3 capitalize">
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-brand-500" />
            {trip.pace} pace
          </div>
        </div>
        <div className="rounded-[1.2rem] bg-gradient-to-br from-[#1E1B2E] to-brand-600 px-4 py-3 text-center font-semibold capitalize text-white">
          {trip.budget}
        </div>
      </div>

      <Link to={`/trips/${trip._id}`} className="premium-button mt-6 w-full px-5 py-3">
        Open Trip
      </Link>
    </div>
  </article>
);

export default SavedTripCard;
