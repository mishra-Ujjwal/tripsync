import { AnimatePresence, motion } from 'framer-motion';

const ConfirmDeleteModal = ({ open, trip, onClose, onConfirm, loading }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
        >
          <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-slate-950">Delete saved trip?</h3>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            This will permanently remove <span className="font-semibold text-slate-900">{trip?.destination}</span> from your saved trips.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="secondary-button flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex-1 rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(244,63,94,0.22)] disabled:opacity-60"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default ConfirmDeleteModal;
