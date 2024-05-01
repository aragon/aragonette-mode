import classNames from "classnames";
import React, { type ReactNode } from "react";

interface IMainSectionProps {
  children?: ReactNode;
  className?: string;
}

export const MainSection: React.FC<IMainSectionProps> = (props) => {
  const { children, className } = props;

  return (
    <div className={classNames("mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 md:py-6 xl:px-6 xl:py-10", className)}>
      {children}
    </div>
  );
};
