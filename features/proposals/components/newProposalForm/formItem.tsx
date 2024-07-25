interface IFormItemProps {
  id: string;
  label: string;
  helpText?: string;
  children?: React.ReactNode;
}

export const FormItem: React.FC<IFormItemProps> = (props) => {
  const { id, label, helpText, children } = props;

  return (
    <div className="flex flex-col gap-y-3">
      <label className="flex flex-col gap-0.5 md:gap-1" htmlFor={id}>
        <div className="flex flex-row items-center gap-3">
          <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">{label}</p>
        </div>
        {helpText && <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">{helpText}</p>}
      </label>
      {children}
    </div>
  );
};
