import WalletContainer from "@/components/WalletContainer";
import { AvatarIcon, IconType } from "@aragon/ods";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MobileNavDialog } from "./mobileNavDialog";
import { NavLink, type INavLink } from "./navLink";
import { Dashboard, Learn, Members, Proposals } from "./routes";

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navLinks: INavLink[] = [Dashboard, Proposals, Members, Learn];

  return (
    <>
      <nav className="h-30 sticky top-0 z-[var(--hub-navbar-z-index)] flex w-full items-center justify-center border-b border-b-neutral-100 bg-neutral-0">
        <div className="w-full max-w-[1280px] flex-col gap-2 p-3 md:px-6 md:pb-0 md:pt-5 lg:gap-3">
          <div className="flex w-full items-center justify-between">
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
              />
              <Image src="/logo-polygon-icon.svg" width="40" height="40" className="shrink-0 sm:hidden" alt="Polygon" />
            </Link>

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
          <ul className="hidden gap-x-10 md:flex lg:pl-10">
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
