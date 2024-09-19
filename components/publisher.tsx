import { formatHexString } from "@/utils/evm";
import { Link, type IPublisher } from "@aragon/ods";
import { Else, If, Then } from "./if";

const MAX_PUBLISHERS_SHOWN = 3;

interface IPublisherProps {
  publisher: IPublisher[];
}

export const Publisher: React.FC<IPublisherProps> = (props) => {
  const { publisher } = props;

  return (
    <div className="flex gap-x-0.5 text-base leading-tight">
      <div className="inline-grid auto-cols-auto grid-flow-col content-center gap-x-1 leading-tight">
        <span className="text-neutral-500">Published by</span>

        <If val={publisher.length} atMost={MAX_PUBLISHERS_SHOWN}>
          <Then>
            {publisher.map(({ address, name, link }, index) => {
              const label = name ?? formatHexString(address);

              return (
                <span key={label} className="truncate">
                  {index >= 2 && ", "}

                  <If not={link}>
                    <Then>
                      <span className="truncate text-neutral-800">{label}</span>
                    </Then>
                    <Else>
                      <Link href={link}>{label}</Link>
                    </Else>
                  </If>
                </span>
              );
            })}
          </Then>
          <Else>
            <button>3+ creators</button>
          </Else>
        </If>
      </div>
    </div>
  );
};
