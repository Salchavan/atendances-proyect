import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  className?: string;
};

export const BoxNull = ({ className }: Props) => {
  return (
    <ErrorBoundary fallback={<div>Error loading box.</div>}>
      <div
        className={`w-full h-full border-2 border-dashed border-red-500 rounded-lg bg-red-100 flex justify-center items-center ${className} text-red-500 font-bold text-4xl`}
      >
        Empty
      </div>
    </ErrorBoundary>
  );
};
