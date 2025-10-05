import { DeviceGeneralManager } from "@/components/network/tabs/general";

import type { PC, Server } from "@/types/network/device";

export function GeneralTab({ deviceId }: { deviceId: string }) {
  return <DeviceGeneralManager<PC | Server> deviceId={deviceId} />;
}
