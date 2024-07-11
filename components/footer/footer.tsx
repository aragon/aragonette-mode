import { Tag } from "@aragon/ods";
import Link from "next/link";
import React from "react";
import { BrandingSubline } from "../brandingSubline/brandingSubline";
import { type INavLink } from "../nav/navLink";
import { Dashboard, Learn, Members, Proposals } from "../nav/routes";

export const Footer: React.FC = () => {
  const navLinks: INavLink[] = [Dashboard, Proposals, Members, Learn];

  return (
    <div className="flex w-full flex-row border-t border-t-neutral-100 bg-neutral-0 p-4 md:p-0 xl:h-20">
      <div className="w-full md:flex md:flex-col md:justify-center md:gap-y-6 md:px-6 md:py-10 xl:flex-row xl:gap-x-6 xl:px-6 xl:py-5">
        <div className="flex items-center justify-between pb-4 pt-3 md:order-2 md:justify-center md:gap-x-4 md:pb-0 md:pt-0 xl:order-1 xl:flex-1 xl:justify-start">
          <BrandingSubline />
          <Tag label="v1.0.0" />
        </div>
        <ul className="divide-y divide-neutral-100 md:order-1 md:flex md:items-center md:justify-center md:gap-x-6 md:divide-y-0 xl:justify-start">
          {navLinks.map(({ id, name, path }) => (
            <LinkItem name={name} path={path} key={id} />
          ))}
        </ul>
        <div className="items-center pb-3 pt-6 md:order-3 md:flex md:justify-center md:pb-0 md:pt-0 xl:flex-1 xl:justify-end">
          <span className="text-base leading-tight text-neutral-500">&copy; 2024 Polygon</span>
        </div>
      </div>
    </div>
  );
};

interface ILinkItem {
  path: string;
  name: string;
}

const LinkItem: React.FC<ILinkItem> = ({ path, name }) => {
  return (
    <li className="group py-4 md:py-0">
      <Link href={path} className="overflow-hidden">
        <span className="line-clamp-1 leading-tight text-neutral-500 group-hover:text-neutral-800">{name}</span>
      </Link>
    </li>
  );
};
