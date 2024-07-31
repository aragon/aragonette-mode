import { WalletContainer } from "@/components/walletContainer/walletContainer";
import { AvatarIcon, IconType } from "@aragon/ods";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrandingSubline } from "../brandingSubline/brandingSubline";
import { MobileNavDialog } from "./mobileNavDialog";
import { NavLink, type INavLink } from "./navLink";
import { Dashboard, Proposals } from "./routes";

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navLinks: INavLink[] = [Dashboard, Proposals];

  return (
    <>
      <nav className="h-30 sticky top-0 z-[var(--hub-navbar-z-index)] flex w-full items-center justify-center border-b border-b-neutral-100 bg-neutral-0">
        <div className="flex w-full max-w-screen-xl flex-col gap-x-2 gap-y-3 p-3 md:px-6 md:pb-0 md:pt-5 lg:gap-x-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2 sm:flex-col">
              <Link
                href="/"
                className={classNames(
                  "flex shrink-0 items-center gap-x-3 rounded-full md:rounded-lg",
                  "outline-none focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset" // focus styles
                )}
              >
                <Image
                  src="/logo-polygon.svg"
                  width="164"
                  height="32"
                  className="hidden shrink-0 sm:block"
                  alt="Polygon"
                  priority={true}
                />
                <Image
                  src="/logo-polygon-icon.svg"
                  width="40"
                  height="40"
                  className="shrink-0 sm:hidden"
                  alt="Polygon"
                  priority={true}
                />
              </Link>
              <BrandingSubline />
            </div>

            <div className="flex items-center gap-x-2">
              <div className="shrink-0">
                <WalletContainer />
              </div>

              {/* Nav Trigger */}
              <button
                onClick={() => setOpen(true)}
                className={classNames(
                  "rounded-full border border-neutral-100 bg-neutral-0 p-1 md:hidden",
                  "outline-none focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset" // focus styles
                )}
              >
                <AvatarIcon size="lg" icon={IconType.MENU} />
              </button>
            </div>
          </div>
          {/* Tab wrapper */}
          <ul className="hidden items-center gap-x-10 md:flex">
            {navLinks.map(({ id, name, path }) => (
              <NavLink name={name} path={path} id={id} key={id} />
            ))}
          </ul>
        </div>
      </nav>
      <MobileNavDialog open={open} navLinks={navLinks} onOpenChange={setOpen} />
    </>
  );
};
