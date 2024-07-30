import { PUB_CHAIN, PUB_ENS_CHAIN } from "@/constants";
import { useMetadata } from "@/hooks/useMetadata";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { formatHexString, isAddressEqual } from "@/utils/evm";
import { type IResource } from "@/utils/types";
import { Button, Heading, IconType, Link } from "@aragon/ods";
import React, { useState } from "react";
import { zeroAddress, type Address } from "viem";
import { useAccount, useEnsName } from "wagmi";
import { DelegateAnnouncementDialog } from "../delegateAnnouncementDialog/delegateAnnouncementDialog";
import { useDelegate } from "@/plugins/snapshotDelegation/hooks/useDelegate";

interface IProfileAsideProps {
  address: string;
  resources?: IResource[];
}

export const ProfileAside: React.FC<IProfileAsideProps> = (props) => {
  const { address: profileAddress, resources } = props;

  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { address: connectedAccount } = useAccount();
  const memberIsConnectedAccount = isAddressEqual(connectedAccount, profileAddress);
  const { data: ensName } = useEnsName({ chainId: PUB_ENS_CHAIN.id, address: profileAddress as Address });

  const { data: connectedAccountDelegate } = useDelegate(connectedAccount, {
    enabled: memberIsConnectedAccount,
  });

  const { data: announcementCid } = useAnnouncement(profileAddress as Address);
  const { data: announcement } = useMetadata<IDelegationWallMetadata>(announcementCid);
  const hasDelegationProfile = !!announcementCid;

  const formattedAddress = formatHexString(profileAddress);
  const explorerUrl = `${PUB_CHAIN.blockExplorers?.default.url}/address/${profileAddress}`;

  // profile is for the connected account
  const showResources = !!resources && resources.length > 0;
  const showEditProfile = hasDelegationProfile && memberIsConnectedAccount;
  const memberHasPrimaryCta = !isAddressEqual(connectedAccountDelegate, zeroAddress);

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <Heading size="h3">Details</Heading>
        <dl className="divide-y divide-neutral-100">
          <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
            <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
              Address
            </dt>
            <dd className="flex size-full justify-end text-base leading-tight text-neutral-500">
              <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                {formattedAddress}
              </Link>
            </dd>
          </div>
          {ensName && (
            <div className="flex items-baseline py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Ens
              </dt>
              <dd className="flex size-full justify-end text-base leading-tight text-neutral-500">
                <Link iconRight={IconType.LINK_EXTERNAL} target="_blank" rel="noopener" href={explorerUrl}>
                  {ensName}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </div>
      {showResources && (
        <div className="flex flex-col gap-y-4">
          <Heading size="h3">Links</Heading>
          {resources.map(({ name, link }) => (
            <Link
              key={link}
              href={link}
              description={link}
              iconRight={IconType.LINK_EXTERNAL}
              target="_blank"
              rel="noopener"
            >
              {name}
            </Link>
          ))}
        </div>
      )}
      {showEditProfile && (
        <Button
          className="!rounded-full"
          onClick={() => setShowProfileCreationDialog(true)}
          variant={hasDelegationProfile && memberHasPrimaryCta ? "secondary" : "primary"}
        >
          Edit your delegate profile
        </Button>
      )}
      {showProfileCreationDialog && (
        <DelegateAnnouncementDialog
          onClose={() => setShowProfileCreationDialog(false)}
          open={showProfileCreationDialog}
          {...(announcement
            ? {
                defaultValues: {
                  identifier: announcement?.identifier,
                  bio: announcement?.bio,
                  message: announcement?.message,
                  resources: announcement?.resources,
                },
              }
            : {})}
        />
      )}
    </>
  );
};
