import { DeviceGeneralManager } from "@/components/network/tabs/general";

import type { EndDevice } from "@/types/network/device";

export function GeneralTab({ deviceId }: { deviceId: string }) {
  return <DeviceGeneralManager<EndDevice> deviceId={deviceId} />;
}
