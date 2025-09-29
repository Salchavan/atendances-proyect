export const ErrorFallback = () => {
  return (
    <div
      role='alert'
      className='p-4 bg-red-100 text-red-500 rounded h-full w-full flex flex-col items-center justify-center'
    >
      <p>Something went wrong.</p>
    </div>
  );
};
