import classNames from "classnames";
import { createConfig, useEnsAvatar, useEnsName } from "wagmi";
import { IWalletProps, MemberAvatar, StateSkeletonBar, addressUtils, useOdsModulesContext } from "@aragon/ods";
import { normalize } from "viem/ens";
import { PUB_ENS_CHAIN, PUB_WEB3_ENS_ENDPOINT } from "@/constants";
import { createClient, http } from "viem";

export const config = createConfig({
  chains: [PUB_ENS_CHAIN],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(PUB_WEB3_ENS_ENDPOINT, { batch: true }),
    });
  },
});

/**
 * A fork of Aragon ODS wallet that directly passes the AvatarSrc to the Avatar component.
 * This allows us to directly bypass the Avatar's ENS lookup on the currently connected chain,
 * and force the Avatar to use the ENS lookup on the ENS chain (mainnet).
 *
 * This does mean that ENS names and on other networks will not resolve.
 */
export const WalletFork: React.FC<IWalletProps> = (props) => {
  const { user, className, ...otherProps } = props;

  const { data: ensName, isLoading: ensLoading } = useEnsName({
    address: user != null ? addressUtils.getChecksum(user.address) : undefined,
    query: { enabled: user?.name != null },
    config,
    chainId: PUB_ENS_CHAIN.id,
  });

  const resolvedUserName = user?.name ?? ensName;
  const resolvedUserHandle = resolvedUserName ?? addressUtils.truncateAddress(user?.address);

  // fetch the avatar here using the resolved handle
  const { data: ensAvatarData } = useEnsAvatar({
    name: resolvedUserName ? normalize(resolvedUserName) : undefined,
    query: { enabled: resolvedUserName != null },
    config,
    chainId: PUB_ENS_CHAIN.id,
  });

  const { copy } = useOdsModulesContext();

  const buttonClassName = classNames(
    "flex items-center rounded-full border border-neutral-100 bg-neutral-0 text-neutral-500 transition-all",
    "hover:border-neutral-200",
    "focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset",
    "active:bg-neutral-50 active:text-neutral-800",
    {
      "px-4 py-2.5": user == null,
      "p-1 md:pl-4": user != null,
    },
    className
  );

  return (
    <button className={buttonClassName} {...otherProps}>
      {!user && copy.wallet.connect}

      {user && (
        <>
          <div
            title={user.name ?? user.address}
            className="hidden min-w-0 max-w-24 items-center truncate md:mr-3 md:flex"
          >
            {ensLoading ? <StateSkeletonBar size="lg" /> : resolvedUserHandle}
          </div>
          <MemberAvatar
            size="lg"
            ensName={user.name}
            address={user.address}
            /* Pass the resolved avatarSrc directly to the Avatar component */
            avatarSrc={ensAvatarData as string | undefined}
          />
        </>
      )}
    </button>
  );
};
