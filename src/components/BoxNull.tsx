type Props = {
  grid: string;
};

export const BoxNull = ({ grid }: Props) => {
  return (
    <div
      className={`w-full h-full border-2 border-dashed border-red-500 rounded-lg bg-red-100 flex justify-center items-center ${grid} text-red-500 font-bold text-4xl`}
    >
      Empty
    </div>
  );
};
