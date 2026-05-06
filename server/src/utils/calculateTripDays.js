const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateTripDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid dates provided');
  }

  const diff = Math.ceil((end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / MS_PER_DAY) + 1;

  if (diff <= 0) {
    throw new Error('End date must be after or same as start date');
  }

  return diff;
};
