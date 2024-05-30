import { SNAPSHOT_SPACE, SNAPSHOT_URL } from "@/constants";
import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  type IDialogRootProps,
  IconType,
  InputText,
} from "@aragon/ods";
import { type ChangeEvent, useState } from "react";

interface IStageAdvancementDialog extends IDialogRootProps {
  onClose: () => void;
  onConfirm: (communityProposalId: string) => void;
}

export const StageAdvancementDialog: React.FC<IStageAdvancementDialog> = (props) => {
  const { onClose, onConfirm, ...otherProps } = props;

  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const snapshotSpaceUrl = `${SNAPSHOT_URL}#/${SNAPSHOT_SPACE}`;

  const validateInput = (value: string) => {
    return value.startsWith(`${snapshotSpaceUrl}/proposal/`);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value?.trim();
    setValue(value);
    setIsValid(validateInput(value));
  };

  const showError = !isValid && value;

  return (
    <DialogRoot {...otherProps}>
      <DialogHeader title="Advance to next stage" onCloseClick={onClose} onBackClick={onClose} showBackButton={true} />
      <DialogContent className="flex flex-col gap-y-6">
        <p className="text-lg leading-normal text-neutral-500">
          To advance the next stage called Community gPOL voting you have to create an proposal in the Polygon Snapshot
          Space. After creation, add the corresponding snapshot proposal link to advance the next stage.
        </p>
        <InputText
          placeholder={`${snapshotSpaceUrl}/proposal/...`}
          label="Snapshot proposal link"
          value={value}
          onChange={handleChange}
          variant={showError ? "critical" : "default"}
          {...(showError ? { alert: { message: "Invalid snapshot proposal link", variant: "critical" } } : {})}
        />
        <div className="flex justify-between">
          <Button
            variant="primary"
            iconRight={IconType.CHEVRON_RIGHT}
            size="lg"
            className="!rounded-full"
            disabled={!isValid}
            onClick={() => onConfirm(value)}
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            iconRight={IconType.LINK_EXTERNAL}
            size="lg"
            className="!rounded-full"
            href={snapshotSpaceUrl}
            target="_blank"
          >
            Open Snapshot
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
