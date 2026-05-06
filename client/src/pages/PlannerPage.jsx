import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, Sparkles, Users, Wallet } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import PlannerForm from '../components/PlannerForm';
import { useToast } from '../hooks/useToast';
import { tripApi } from '../services/api';
import { formatDateRange } from '../utils/formatters';

const today = new Date().toISOString().slice(0, 10);
const fiveDaysLater = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10);

const initialForm = {
  destination: 'Jaipur',
  startDate: today,
  endDate: fiveDaysLater,
  travelers: 2,
  budget: 'medium',
  interests: ['culture', 'food', 'views'],
  pace: 'balanced',
  tripType: 'couple',
  hotelPreference: 'Boutique hotel',
  transportPreference: 'Private cab',
  foodPreference: 'Local cuisine',
  notes: '',
  premium: false,
};

const stepLabels = ['Basics', 'Style and Interests', 'Preferences'];

const budgetLabelMap = {
  low: 'Budget',
  medium: 'Mid-Range',
  luxury: 'Luxury',
};

const PlannerPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const progress = Math.round((currentStep / 3) * 100);

  const durationDays = useMemo(() => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [form.endDate, form.startDate]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.startDate) nextErrors.startDate = 'Choose a trip start date.';
    if (!form.endDate) nextErrors.endDate = 'Choose a trip end date.';
    if (new Date(form.endDate) < new Date(form.startDate)) {
      nextErrors.endDate = 'End date must be after the start date.';
    }
    if (!form.interests.length) nextErrors.interests = 'Select at least one interest.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      pushToast({
        type: 'error',
        title: 'Please review your trip settings',
        message: 'A few planner fields still need attention.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await tripApi.generate({
        ...form,
        travelers: Number(form.travelers),
      });
      navigate('/result', { state: response.data });
    } catch (error) {
      pushToast({
        type: 'error',
        title: 'Generation failed',
        message: error.response?.data?.message || 'We could not generate your itinerary right now.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="relative py-10 sm:py-16 bg-white/95">
      <div className="section-shell">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/8 px-3 py-1 text-sm font-semibold text-brand-500">
            <Sparkles className="h-4 w-4" />
            AI Trip Planner
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Design your <span className="headline-gradient">perfect trip</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6B6780] sm:text-base">
            Tell us about your travel dreams and our AI will create a personalized itinerary in seconds.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#6B6780]">
              Step {currentStep} of 3 — {stepLabels[currentStep - 1]}
            </span>
            <span className="text-sm font-semibold text-brand-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="grad-accent h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 min-w-0">
            {isGenerating ? (
              <LoadingScreen />
            ) : (
              <PlannerForm
                form={form}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isGenerating={isGenerating}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />
            )}
          </div>

          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-[1.8rem] border border-black/[0.04] bg-white p-6 shadow-[0_22px_60px_rgba(30,27,46,0.08)]">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#6B6780]"></h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/8 text-brand-500">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6780]">Destination</div>
                      <div className="font-semibold text-ink">{form.destination || 'Not set yet'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/8 text-teal-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6780]">Dates</div>
                      <div className="font-semibold text-ink">{formatDateRange(form.startDate, form.endDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97066]/8 text-[#F97066]">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6780]">Travelers</div>
                      <div className="font-semibold text-ink">{form.travelers}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6780]">Budget</div>
                      <div className="font-semibold text-ink">{budgetLabelMap[form.budget] || form.budget}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-[#1E1B2E] p-4 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">Travel style</div>
                  <div className="mt-2 font-heading text-lg font-bold capitalize">
                    {form.tripType} • {form.pace}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[1rem] bg-white/8 px-3 py-2">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">Duration</div>
                      <div className="mt-1 font-semibold text-white">{durationDays} days</div>
                    </div>
                    {/* <div className="rounded-[1rem] bg-white/8 px-3 py-2">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">Model</div>
                      <div className="mt-1 font-semibold text-white">{form.premium ? 'gpt-5.4' : 'gpt-5.4-mini'}</div>
                    </div> */}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.interests.map((interest) => (
                      <span key={interest} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white/85">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-[#6B6780]">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Your data stays private and secure.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlannerPage;
