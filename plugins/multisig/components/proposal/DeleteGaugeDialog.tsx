import { DialogAlertRoot, DialogAlertHeader, DialogAlertContent, DialogAlertFooter } from "@aragon/ods";

const DeleteGaugeDialog = ({
  gaugeName,
  onConfirm,
  onCancel,
  open,
}: {
  gaugeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}) => {
  return (
    <DialogAlertRoot variant="critical" open={open} containerClassName="!max-w-[600px]">
      <DialogAlertHeader title="Delete Gauge" />
      <DialogAlertContent className="py-2">
        <p className="text-neutral-600">
          Are you sure you want to delete <span className="font-semibold">{gaugeName}</span>
        </p>
      </DialogAlertContent>
      <DialogAlertFooter
        actionButton={{ label: "Delete Gauge", onClick: onConfirm }}
        cancelButton={{ label: "Cancel", onClick: onCancel }}
      />
    </DialogAlertRoot>
  );
};

export default DeleteGaugeDialog;
