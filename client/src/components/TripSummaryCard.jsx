import { Calendar, Users, Wallet } from 'lucide-react';
import { formatCurrency, formatDateRange } from '../utils/formatters';

const budgetLabelMap = {
  low: 'Budget',
  medium: 'Mid-Range',
  luxury: 'Luxury',
};

const paceLabelMap = {
  relaxed: 'Relaxed Pace',
  balanced: 'Balanced Pace',
  packed: 'Fast-Paced',
};

const TripSummaryCard = ({ tripInputs, tripSummary, estimatedCost, destinationImage }) => (
  <div className="relative overflow-hidden">
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-800 px-6 pb-16 pt-12 text-white sm:px-10 sm:pt-16">
      {destinationImage?.image && (
        <img
          src={destinationImage.image}
          alt={destinationImage.imageAlt || `${tripInputs.destination} destination view`}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-indigo-900/40 to-transparent" />

      <div className="relative z-10 max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            AI Generated
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize text-white backdrop-blur-sm">
            {tripInputs.tripType} Trip
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {paceLabelMap[tripInputs.pace] || tripInputs.pace}
          </span>
        </div>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {tripInputs.destination}
        </h1>
        <p className="mt-3 text-lg font-normal text-white/75 sm:text-xl">
          {tripSummary?.vibe || 'A polished AI-generated itinerary tailored to your travel style'}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/70">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Calendar className="h-4 w-4" />
            </span>
            {formatDateRange(tripInputs.startDate, tripInputs.endDate)}
          </span>
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Users className="h-4 w-4" />
            </span>
            {tripInputs.travelers} {tripInputs.travelers === 1 ? 'Person' : 'People'}
          </span>
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Wallet className="h-4 w-4" />
            </span>
            {estimatedCost?.total
              ? formatCurrency(estimatedCost.total)
              : budgetLabelMap[tripInputs.budget] || tripInputs.budget}
          </span>
        </div>

        {destinationImage?.photographerName && (
          <p className="mt-5 text-xs text-white/50">
            Photo by{' '}
            <a
              href={destinationImage.photographerProfile || destinationImage.unsplashPhotoLink || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              {destinationImage.photographerName}
            </a>{' '}
            via Google Places
          </p>
        )}
      </div>
    </div>
  </div>
);

export default TripSummaryCard;