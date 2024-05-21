// TODO: to be replaced with ODS component when available

import { type ReactNode } from "react";

interface IDefinitionListProps {
  children?: ReactNode;
}

export const DefinitionList: React.FC<IDefinitionListProps> = (props) => {
  return <div className="flex flex-col gap-y-2 pb-4 ">{props.children}</div>;
};

interface IDefinitionListItemProps {
  term: string;
  children?: ReactNode;
}

export const DefinitionListItem: React.FC<IDefinitionListItemProps> = ({ term, children }) => {
  return (
    <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-6">
      <span className="w-full leading-tight text-neutral-800 md:w-auto md:max-w-40">{term}</span>
      <div className="flex flex-1 md:justify-end">{children}</div>
    </div>
  );
};
