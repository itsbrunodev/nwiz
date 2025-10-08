import { Kbd } from "../ui/kbd";

export function EnterHint() {
  return (
    <p className="mx-3 mt-1 text-muted-foreground text-xs">
      Press <Kbd>Enter</Kbd> to calculate the subnet mask. You can also use a
      CIDR notation (e.g. 192.168.0.1/24) to calculate the subnet mask.
    </p>
  );
}
