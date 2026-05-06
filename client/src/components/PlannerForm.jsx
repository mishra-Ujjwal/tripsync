import { ConciergeBell, Map, Minus, Plus, Search, Settings, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import BudgetSelector from './BudgetSelector';
import MultiSelectInterests from './MultiSelectInterests';
import PaceSelector from './PaceSelector';
import { placesApi } from '../services/api';
import {
  DESTINATIONS,
  FOOD_PREFERENCES,
  HOTEL_PREFERENCES,
  INTEREST_OPTIONS,
  TRANSPORT_PREFERENCES,
} from '../utils/constants';

const tripTypeOptions = [
  { value: 'solo', label: '🧳 Solo' },
  { value: 'couple', label: '💑 Couple' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
  { value: 'friends', label: '👯 Friends' },
];

const fieldClass = 'soft-input';

const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const active = value === option;

      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
            active
              ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_10px_22px_rgba(91,76,219,0.18)]'
              : 'border-black/10 bg-white text-ink hover:border-brand-200'
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

const SearchableDestinationSelect = ({ value, onChange, options }) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSuggestions(
        options.map((option) => ({
          placeId: option,
          text: option,
          primaryText: option,
          secondaryText: 'Popular destination',
        }))
      );
      return undefined;
    }

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const fallbackResponse = await placesApi.autocomplete(trimmedQuery);
        const nextSuggestions = fallbackResponse.data || [];

        if (!active) return;

        const fallbackMatches = options
          .filter((option) => option.toLowerCase().includes(trimmedQuery.toLowerCase()))
          .map((option) => ({
            placeId: option,
            text: option,
            primaryText: option,
            secondaryText: 'Popular destination',
          }));

        const deduped = [...nextSuggestions, ...fallbackMatches].filter(
          (suggestion, index, array) =>
            array.findIndex((entry) => entry.text.toLowerCase() === suggestion.text.toLowerCase()) === index
        );

        setSuggestions(deduped.slice(0, 8));
      } catch (error) {
        if (!active) return;
        setSuggestions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      setLoading(false);
      window.clearTimeout(timer);
    };
  }, [options, query]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return suggestions.length ? suggestions : options.map((option) => ({ placeId: option, text: option, primaryText: option, secondaryText: 'Popular destination' }));
    }

    return suggestions;
  }, [options, query, suggestions]);

  const handleSelect = (selected) => {
    setQuery(selected.text);
    onChange(selected.text);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    }

    if (e.key === 'Enter') {
      if (open && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative mt-2" ref={wrapperRef}>
      {/* <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6B6780]" /> */}

      <input
        type="text"
        value={query}
        onChange={(e) => {
          const newValue = e.target.value;
          setQuery(newValue);
          onChange(newValue);
          setOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search country or place..."
        className={`${fieldClass} pl-12 pr-10`}
      />

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6780]" />

      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.placeId}-${option.text}`}
                type="button"
                onClick={() => handleSelect(option)}
                className={`block w-full px-4 py-3 text-left text-sm transition ${
                  index === highlightedIndex
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink hover:bg-brand-50'
                }`}
              >
                <div className="font-medium text-ink">{option.primaryText || option.text}</div>
                {option.secondaryText ? (
                  <div className="mt-0.5 text-xs text-[#6B6780]">{option.secondaryText}</div>
                ) : null}
              </button>
            ))
          ) : loading ? (
            <div className="px-4 py-3 text-sm text-[#6B6780]">Searching Google Places...</div>
          ) : (
            <div className="px-4 py-3 text-sm text-[#6B6780]">
              No destination found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PlannerForm = ({ form, errors, onChange, onSubmit, isGenerating, currentStep, onStepChange }) => {
  const nextStep = () => onStepChange(Math.min(3, currentStep + 1));
  const prevStep = () => onStepChange(Math.max(1, currentStep - 1));

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {currentStep === 1 ? (
        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-black/[0.3] bg-white p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-heading text-lg font-bold text-ink">
              <Map className="h-5 w-5 text-brand-500" />
              Trip Basics
            </h3>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Destination</span>
                <SearchableDestinationSelect
                  value={form.destination}
                  onChange={(value) => onChange('destination', value)}
                  options={DESTINATIONS}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">Start Date</span>
                  <input
                    type="date"
                    className={`${fieldClass} mt-2`}
                    value={form.startDate}
                    onChange={(e) => onChange('startDate', e.target.value)}
                  />
                  {errors.startDate ? (
                    <p className="mt-2 text-sm text-rose-500">{errors.startDate}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-ink">End Date</span>
                  <input
                    type="date"
                    className={`${fieldClass} mt-2`}
                    value={form.endDate}
                    onChange={(e) => onChange('endDate', e.target.value)}
                  />
                  {errors.endDate ? (
                    <p className="mt-2 text-sm text-rose-500">{errors.endDate}</p>
                  ) : null}
                </label>
              </div>

              <div>
                <span className="text-sm font-semibold text-ink">Number of Travelers</span>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onChange('travelers', Math.max(1, Number(form.travelers) - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 transition hover:bg-brand-500/5"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center font-heading text-xl font-bold text-ink">
                    {form.travelers}
                  </span>

                  <button
                    type="button"
                    onClick={() => onChange('travelers', Math.min(20, Number(form.travelers) + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 transition hover:bg-brand-500/5"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-black/[0.04] bg-white p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-heading text-lg font-bold text-ink">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Budget
            </h3>
            <BudgetSelector value={form.budget} onChange={(value) => onChange('budget', value)} />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={nextStep} className="premium-button px-8 py-3">
              Next
            </button>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-black/[0.04] bg-white p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-heading text-lg font-bold text-ink">
              <ConciergeBell className="h-5 w-5 text-brand-500" />
              Trip Style
            </h3>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Trip Type</p>
                <div className="flex flex-wrap gap-2">
                  {tripTypeOptions.map((option) => {
                    const active = form.tripType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange('tripType', option.value)}
                        className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                          active
                            ? 'border-transparent bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_10px_22px_rgba(91,76,219,0.18)]'
                            : 'border-black/10 bg-white text-ink hover:border-brand-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Travel Pace</p>
                <PaceSelector value={form.pace} onChange={(value) => onChange('pace', value)} />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">
                  Interests <span className="font-normal text-[#6B6780]">(select multiple)</span>
                </p>
                <MultiSelectInterests
                  options={INTEREST_OPTIONS}
                  value={form.interests}
                  onChange={(value) => onChange('interests', value)}
                  error={errors.interests}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="secondary-button px-6 py-3">
              Back
            </button>
            <button type="button" onClick={nextStep} className="premium-button px-8 py-3">
              Next
            </button>
          </div>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-black/[0.04] bg-white p-6 sm:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-heading text-lg font-bold text-ink">
              <Settings className="h-5 w-5 text-teal-600" />
              Preferences
            </h3>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Hotel Preference</p>
                <ChipGroup
                  options={HOTEL_PREFERENCES}
                  value={form.hotelPreference}
                  onChange={(value) => onChange('hotelPreference', value)}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Transport Preference</p>
                <ChipGroup
                  options={TRANSPORT_PREFERENCES}
                  value={form.transportPreference}
                  onChange={(value) => onChange('transportPreference', value)}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-ink">Food Preference</p>
                <ChipGroup
                  options={FOOD_PREFERENCES}
                  value={form.foodPreference}
                  onChange={(value) => onChange('foodPreference', value)}
                />
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Additional Notes <span className="font-normal text-[#6B6780]">(optional)</span>
                </span>
                <textarea
                  rows="4"
                  className={`${fieldClass} mt-2 resize-none`}
                  value={form.notes}
                  onChange={(e) => onChange('notes', e.target.value)}
                  placeholder="We love hidden gems, want to avoid tourist traps, and prefer unhurried mornings..."
                />
              </label>
            </div>
          </div>

          {/* <div className="rounded-[1.8rem] bg-gradient-to-br from-[#1E1B2E] via-brand-500 to-brand-600 p-5 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Model
            </div>

            <p className="mt-3 font-heading text-lg font-bold">Upgrade itinerary generation</p>

            <p className="mt-1 text-sm text-white/80">
              Use `gpt-5.4` for richer descriptions, stronger pacing, and more polished travel notes.
            </p>

            <button
              type="button"
              onClick={() => onChange('premium', !form.premium)}
              className={`mt-4 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                form.premium
                  ? 'bg-white text-ink'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {form.premium ? 'Premium enabled' : 'Use default model'}
            </button>
          </div> */}

          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="secondary-button px-6 py-3">
              Back
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="premium-button px-8 py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? 'Generating your itinerary...' : 'Generate Itinerary'}
            </button>
          </div>
        </div>
      ) : null}
    </motion.form>
  );
};

export default PlannerForm;
