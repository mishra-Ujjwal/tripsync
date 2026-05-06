export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDateRange = (startDate, endDate) =>
  `${new Date(startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })} - ${new Date(endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
