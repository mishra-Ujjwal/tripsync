import { useEffect, useState } from 'react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EmptyState from '../components/EmptyState';
import SavedTripCard from '../components/SavedTripCard';
import { useToast } from '../hooks/useToast';
import { tripApi } from '../services/api';

const SavedTripsPage = () => {
  const { pushToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTrips = async (query = '') => {
    setLoading(true);
    try {
      const response = await tripApi.list(query);
      setTrips(response.data);
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Could not load trips',
        message: error.response?.data?.message || 'Saved trips are unavailable right now.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(search);
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    fetchTrips(search);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    setDeleteLoading(true);
    try {
      await tripApi.remove(tripToDelete._id);
      setTrips((current) => current.filter((trip) => trip._id !== tripToDelete._id));
      pushToast({
        type: 'success',
        title: 'Trip deleted',
        message: 'The saved itinerary has been removed.',
      });
      setTripToDelete(null);
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Delete failed',
        message: error.response?.data?.message || 'We could not delete the trip.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="py-10 sm:py-16 bg-white/90">
      <div className="section-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-500">Saved Trips</p>
            <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Your itinerary dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B6780]">
              Search saved plans, reopen details, and manage your premium trip history.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-3">
            <input
              type="text"
              placeholder="Search by destination or trip type"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-white/80 bg-white/90 px-5 py-3 text-sm outline-none shadow-[0_14px_32px_rgba(148,163,184,0.12)] focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            />
            <button type="submit" className="premium-button px-5 py-3">
              Search
            </button>
          </form>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-[0_18px_50px_rgba(148,163,184,0.14)]" />
              ))}
            </div>
          ) : trips.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {trips.map((trip) => (
                <SavedTripCard key={trip._id} trip={trip} onDelete={setTripToDelete} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={Boolean(tripToDelete)}
        trip={tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </section>
  );
};

export default SavedTripsPage;
