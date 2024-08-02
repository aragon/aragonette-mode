import { Spinner } from "@aragon/ods";

export const PleaseWaitSpinner = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center pt-60 text-neutral-500">
      <div className="flex flex-col items-center justify-center gap-y-4">
        <Spinner size="xl" variant="success" className="-m-[2px] inline-block" />
        <p className="text-xl text-neutral-500">Governed on Aragon</p>
      </div>
    </div>
  );
};
