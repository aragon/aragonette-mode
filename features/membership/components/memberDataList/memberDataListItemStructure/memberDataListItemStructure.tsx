import { formatHexString, isAddressEqual } from "@/utils/evm";
import {
  type IDataListItemProps,
  DataList,
  MemberAvatar,
  Tag,
  Heading,
  formatterUtils,
  NumberFormat,
} from "@aragon/ods";
import { useAccount } from "wagmi";

export interface IMemberDataListItemProps extends IDataListItemProps {
  /**
   * Whether the member is a delegate of current user or not.
   */
  isDelegate?: boolean;
  /**
   * The number of delegations the member has from other members.
   */
  delegationCount?: number;
  /**
   * The total voting power of the member.
   */
  votingPower?: number;
  /**
   * ENS name of the user.
   */
  ensName?: string;
  name?: string;
  /**
   * 0x address of the user.
   */
  address: string;
  /**
   * Direct URL src of the user avatar image to be rendered.
   */
  avatarSrc?: string;
}

export const MemberDataListItemStructure: React.FC<IMemberDataListItemProps> = (props) => {
  const { isDelegate, delegationCount, votingPower, avatarSrc, ensName, name, address, ...otherProps } = props;

  const { address: currentUserAddress, isConnected } = useAccount();

  const isCurrentUser = isConnected && address && isAddressEqual(currentUserAddress, address);

  const resolvedUserHandle = ensName != null && ensName !== "" ? ensName : formatHexString(address);

  const hasDelegationOrVotingPower = delegationCount != null || votingPower != null;

  return (
    <DataList.Item className="min-w-fit !py-0 px-4 md:px-6" {...otherProps}>
      <div className="flex flex-col items-start justify-center gap-y-3 py-4 md:min-w-44 md:py-6">
        <div className="flex w-full items-center justify-between">
          <MemberAvatar ensName={ensName} address={address} avatarSrc={avatarSrc} responsiveSize={{ md: "md" }} />
          {isDelegate && !isCurrentUser && <Tag variant="info" label="Your Delegate" />}
          {isCurrentUser && <Tag variant="neutral" label="You" />}
        </div>

        {name && <p className="inline-block w-full truncate text-lg text-neutral-800 md:text-xl">{name}</p>}
        <p className="inline-block w-full truncate text-lg text-neutral-800 md:text-xl">{resolvedUserHandle}</p>

        {hasDelegationOrVotingPower && (
          <div className="flex h-12 flex-col gap-y-2">
            <span className="h-6">
              {delegationCount != null && delegationCount > 0 && (
                <p className="text-sm md:text-base">
                  {formatterUtils.formatNumber(delegationCount, { format: NumberFormat.GENERIC_SHORT })}
                  <span className="text-neutral-500">{` Delegation${delegationCount === 1 ? "" : "s"}`}</span>
                </p>
              )}
            </span>
            {votingPower != null && (
              <p className="text-sm md:text-base">
                {formatterUtils.formatNumber(votingPower, { format: NumberFormat.GENERIC_SHORT })}
                <span className="text-neutral-500"> Voting Power</span>
              </p>
            )}
          </div>
        )}
      </div>
    </DataList.Item>
  );
};
