import { DeviceSshManager } from "@/components/network/tabs/ssh";

import type { Router } from "@/types/network/device";

export function SshTab({ routerId }: { routerId: string }) {
  return <DeviceSshManager<Router> deviceId={routerId} />;
}
