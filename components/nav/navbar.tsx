import WalletContainer from "@/components/WalletContainer";
import { AvatarIcon, IconType } from "@aragon/ods";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "./navLink";
import { Dashboard, Learn, Members, Proposals } from "./routes";

export const Navbar: React.FC = () => {
  const NavLinks = [Dashboard, Proposals, Members, Learn];

  return (
    <nav className="sticky top-0 w-full flex-col gap-2 border-b border-b-neutral-100 bg-neutral-0 p-3 md:px-6 md:pb-0 md:pt-5 lg:gap-3">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center gap-x-3">
          <Image src="/logo-bw-lg.png" width="60" height="60" className="w-9 shrink-0" alt="Aragonette" />
          <span className="py-1 text-lg font-semibold leading-tight text-neutral-700 md:text-xl">
            Polygon Governance Hub
          </span>
        </Link>

        <div className="flex items-center gap-x-2">
          <div className="shrink-0">
            <WalletContainer />
          </div>

          {/* Nav Trigger */}
          <button className="rounded-full border border-neutral-100 bg-neutral-0 p-1 md:hidden">
            <AvatarIcon size="lg" icon={IconType.MENU} />
          </button>
        </div>
      </div>

      {/* Tab wrapper */}
      <ul className="-mb-0.25 hidden gap-x-10 md:flex lg:pl-14">
        {NavLinks.map((tab) => {
          return (
            <li key={tab.id}>
              <NavLink label={tab.name} path={tab.path} id={tab.id} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
