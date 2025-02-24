import { IconType } from "@aragon/ods";
import { Link } from "@aragon/ods";
import { type ReactNode } from "react";

interface IHeaderProps {
  title?: string;
  children: ReactNode;
  learnMoreUrl?: string;
}

export const SectionHeader: React.FC<IHeaderProps> = ({ title, children, learnMoreUrl }) => {
  return (
    <div className="flex flex-col gap-y-3">
      {title ? (
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-3xl font-normal leading-tight text-neutral-800 md:text-3xl">
          {title}
        </h1>
      ) : null}
      <p className="max-w-[700px]">{children}</p>
      {learnMoreUrl ? (
        <Link target="_blank" href={learnMoreUrl} variant="primary" iconRight={IconType.LINK_EXTERNAL}>
          Learn more
        </Link>
      ) : null}
    </div>
  );
};
