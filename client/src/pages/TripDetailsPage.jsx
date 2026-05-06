import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BudgetBreakdownCard from '../components/BudgetBreakdownCard';
import EmptyState from '../components/EmptyState';
import ItineraryDayCard from '../components/ItineraryDayCard';
import LoadingScreen from '../components/LoadingScreen';
import TripSummaryCard from '../components/TripSummaryCard';
import { useToast } from '../hooks/useToast';
import { tripApi } from '../services/api';

const TripDetailsPage = () => {
  const { id } = useParams();
  const { pushToast } = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingDay, setRegeneratingDay] = useState(null);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const response = await tripApi.get(id);
      setTrip(response.data);
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Trip unavailable',
        message: error.response?.data?.message || 'We could not open this saved trip.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleRegenerate = async (day) => {
    if (!trip) return;
    setRegeneratingDay(day.dayNumber);
    try {
      const response = await tripApi.regenerateDay({
        tripId: trip._id,
        tripInputs: {
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelers: trip.travelers,
          budget: trip.budget,
          tripType: trip.tripType,
          interests: trip.interests,
          pace: trip.pace,
          hotelPreference: trip.hotelPreference,
          transportPreference: trip.transportPreference,
          foodPreference: trip.foodPreference,
          notes: trip.notes,
          premium: trip.premium,
        },
        day,
      });

      setTrip((current) => ({
        ...current,
        itinerary: current.itinerary.map((item) => (item.dayNumber === day.dayNumber ? response.data : item)),
      }));

      pushToast({
        type: 'success',
        title: `Day ${day.dayNumber} updated`,
        message: 'The saved trip now reflects the refreshed itinerary day.',
      });
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Regeneration failed',
        message: error.response?.data?.message || 'We could not refresh that day.',
      });
    } finally {
      setRegeneratingDay(null);
    }
  };

  if (loading) {
    return (
      <section className="section-shell py-16">
        <LoadingScreen title="Opening saved itinerary" subtitle="Loading your saved trip details and day-wise plan." />
      </section>
    );
  }

  if (!trip) {
    return (
      <section className="section-shell py-16">
        <EmptyState title="Trip not found" description="This saved itinerary could not be found. You can create a new one anytime." />
      </section>
    );
  }

  return (
    <section className="pb-16">
      <div className="section-shell pt-8">
        <Link to="/saved-trips" className="secondary-button px-4 py-2.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Saved Trips
        </Link>
      </div>

      <div className="mt-6">
        <TripSummaryCard
          tripInputs={{
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            travelers: trip.travelers,
            budget: trip.budget,
            tripType: trip.tripType,
            pace: trip.pace,
          }}
          tripSummary={trip.tripSummary}
          estimatedCost={trip.estimatedCost}
          destinationImage={trip.destinationImage}
        />
      </div>

      <div className="section-shell mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.48fr]">
        <div className="space-y-10">
          {trip.itinerary.map((day) => (
            <ItineraryDayCard key={day.dayNumber} day={day} onRegenerate={handleRegenerate} loading={regeneratingDay === day.dayNumber} />
          ))}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <BudgetBreakdownCard estimatedCost={trip.estimatedCost} />

          <div className="rounded-[1.8rem] border border-black/[0.04] bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-500">Trip Metadata</p>
            <div className="mt-5 grid gap-3 text-sm text-[#6B6780]">
              <div className="rounded-[1.2rem] bg-surface p-4 capitalize">Interests: {trip.interests.join(', ')}</div>
              <div className="rounded-[1.2rem] bg-surface p-4">Hotel: {trip.hotelPreference}</div>
              <div className="rounded-[1.2rem] bg-surface p-4">Transport: {trip.transportPreference}</div>
              <div className="rounded-[1.2rem] bg-surface p-4">Food: {trip.foodPreference}</div>
              <div className="rounded-[1.2rem] bg-gradient-to-br from-[#1E1B2E] to-brand-600 p-4 text-white">
                {trip.notes || 'No additional notes captured for this trip.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripDetailsPage;
