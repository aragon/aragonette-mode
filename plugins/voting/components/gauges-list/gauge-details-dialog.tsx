import { Avatar, Button, DialogContent, DialogFooter, DialogRoot, Icon, IconType, Link } from "@aragon/ods";
import { type GaugeItem } from "../gauges-list/types";
import { shortenAddress } from "@/utils/address";

type GaugeDetailsDialogProps = {
  openDialog: boolean;
  selectedGauge: GaugeItem;
  onClose: () => void;
};

export const GaugeDetailsDialog: React.FC<GaugeDetailsDialogProps> = ({ selectedGauge, openDialog, onClose }) => {
  const close = () => {
    onClose();
  };

  return (
    <DialogRoot open={openDialog} containerClassName="!max-w-[600px]" onInteractOutside={onClose}>
      <div className="flex flex-row items-center">
        <div className="w-1/8 m-6 flex flex-row items-center gap-x-3">
          <Avatar
            alt="Gauge icon"
            size="xl"
            src={selectedGauge.metadata?.logo}
            fallback={
              <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                {selectedGauge.metadata?.name.slice(0, 2).toUpperCase()}
              </span>
            }
          />
          <div className="flex flex-col">
            <div>{selectedGauge.metadata?.name}</div>
            <div>{shortenAddress(selectedGauge.address)}</div>
          </div>
        </div>
        <div className="mx-8 flex flex-grow justify-end">
          <Button className="" size="sm" variant="tertiary" iconLeft={IconType.CLOSE} onClick={close} />
        </div>
      </div>
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-4">
        <div className="">{selectedGauge.metadata?.description}</div>
        {selectedGauge.metadata?.resources.map((resource, index) => (
          <div key={index} className="flex flex-row">
            <div className="w-1/2 text-sm">{resource.field}</div>
            <div className="flex w-1/2 flex-col">
              <Link href={resource.url} iconRight={IconType.LINK_EXTERNAL} target="_blank">
                <p className="text-sm">{resource.value}</p>
              </Link>
              <p className="text-sm text-neutral-200">{resource.url}</p>
            </div>
          </div>
        ))}
        <hr />
        <div className="mb-8 flex flex-row">
          <div className="w-1/2 text-sm">Total incentives</div>
          <p className="w-1/2 text-sm text-neutral-200">$100K USD</p>
        </div>
      </DialogContent>
    </DialogRoot>
  );
};
