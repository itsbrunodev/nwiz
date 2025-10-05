import { DeviceSshManager } from "@/components/network/tabs/ssh";

import type { Switch } from "@/types/network/device";

export function SshTab({ switchId }: { switchId: string }) {
  return <DeviceSshManager<Switch> deviceId={switchId} />;
}
