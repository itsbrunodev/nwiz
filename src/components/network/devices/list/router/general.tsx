import { DeviceGeneralManager } from "@/components/network/tabs/general";

import type { Router } from "@/types/network/device";

export function GeneralTab({ routerId }: { routerId: string }) {
  return <DeviceGeneralManager<Router> deviceId={routerId} />;
}
