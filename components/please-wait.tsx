import { Spinner } from "@aragon/ods";

export const PleaseWaitSpinner = ({ status = "Loading", fullMessage }: { status?: string; fullMessage?: string }) => {
  const message = fullMessage ?? `${status}, please wait...`;

  return (
    <div className="text-neutral-500">
      <Spinner size="sm" variant="neutral" className="-m-[2px] inline-block" /> &nbsp;&nbsp;{message}
    </div>
  );
};
