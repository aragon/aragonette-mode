import { PUB_CHAIN } from "@/constants";
import { formatHexString } from "@/utils/evm";
import {
  AccordionContainer,
  AccordionItem,
  AccordionItemContent,
  AccordionItemHeader,
  AvatarIcon,
  IconType,
} from "@aragon/ods";
import Link from "next/link";
import { type DetailedAction } from "../../services/proposal/selectors";
import { CallParamField } from "./callParamField";

interface IProposalActionProps {
  actions?: DetailedAction[];
}

export const ProposalAction: React.FC<IProposalActionProps> = (props) => {
  const { actions } = props;

  return (
    <div className="overflow-hidden rounded-xl bg-neutral-0 pb-2 shadow-neutral">
      {/* Header */}
      <div className="flex flex-col gap-y-2 px-4 py-4 md:gap-y-3 md:px-6 md:py-6">
        <p className="text-xl leading-tight text-neutral-800 md:text-2xl">Actions</p>
        <p className="text-500 text-sm leading-normal md:text-base">
          The proposal must pass all voting stages above before the binding onchain actions are able to be executed.
        </p>
      </div>

      {/* Content */}
      <AccordionContainer isMulti={true} className="border-t border-t-neutral-100" defaultValue={["Action 1"]}>
        {actions?.map((action, index) => {
          const itemKey = `Action ${index + 1}`;
          const functionName = action.decoded?.functionName ?? null;
          const functionAbi = action.decoded?.functionAbi ?? null;
          const explorerUrl = `${PUB_CHAIN.blockExplorers?.default.url}/address/${action.raw.to}`;

          return (
            <AccordionItem className="border-t border-t-neutral-100 bg-neutral-0" key={itemKey} value={itemKey}>
              <AccordionItemHeader className="!items-start">
                <div className="flex w-full gap-x-6">
                  <div className="flex flex-1 flex-col gap-y-2">
                    <div className="flex">
                      {/* Method name */}
                      <span className="flex w-full text-left text-lg leading-tight text-neutral-800 md:text-xl">
                        {functionName}
                      </span>
                    </div>
                    <div className="flex w-full gap-x-6 text-sm leading-tight md:text-base">
                      <Link href={explorerUrl} target="_blank">
                        <span className="flex items-center gap-x-2 text-neutral-500">
                          {formatHexString(action.raw.to)}
                          {functionName != null && <AvatarIcon variant="primary" size="sm" icon={IconType.CHECKMARK} />}
                          {functionName == null && <AvatarIcon variant="warning" size="sm" icon={IconType.WARNING} />}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <span className="hidden text-sm leading-tight text-neutral-500 sm:block md:text-base">{itemKey}</span>
                </div>
              </AccordionItemHeader>

              <AccordionItemContent className="!overflow-none">
                <div className="flex flex-col gap-y-4">
                  {action.decoded?.args?.map((arg, i) => (
                    <div className="flex" key={i}>
                      <CallParamField value={arg} idx={i} functionAbi={functionAbi} />
                    </div>
                  ))}
                </div>
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </AccordionContainer>
    </div>
  );
};
