import { DeviceGeneralManager } from "@/components/network/tabs/general";

import type { Switch } from "@/types/network/device";

export function GeneralTab({ switchId }: { switchId: string }) {
  return <DeviceGeneralManager<Switch> deviceId={switchId} />;
}
