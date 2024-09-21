import { Button, Tag } from "@aragon/ods";

export const TokenStatusCell = ({ id }: { id: string }) => {
  // TODO: Fetch and resolve status
  const loading = false;
  const claimable = false;
  const inCooldown = false;
  const inWarmup = false;

  if (loading) {
    return <div className="flex items-center justify-between gap-x-4">-</div>;
  } else if (claimable) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Claimable" variant="success" />
        <Button size="sm" variant="secondary">
          Withdraw
        </Button>
      </div>
    );
  } else if (inCooldown) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="In cooldown" variant="warning" />
        <Button size="sm" variant="secondary" disabled={true}>
          Withdraw
        </Button>
      </div>
    );
  } else if (inWarmup) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="In warmup" variant="info" />
        <Button size="sm" variant="secondary">
          Withdraw
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-x-4">
      <Tag label="Active" />
      <Button size="sm" variant="secondary">
        Enter cooldown
      </Button>
    </div>
  );
};
