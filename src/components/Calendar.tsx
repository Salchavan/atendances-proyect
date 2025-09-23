import { ErrorBoundary } from 'react-error-boundary';

export const Calendar = () => {
  return (
    <ErrorBoundary fallback={<div>Error loading calendar.</div>}>
      <div>Calendar</div>
    </ErrorBoundary>
  );
};
