import { DevicePasswordsManager } from "@/components/network/tabs/passwords";

import type { Switch } from "@/types/network/device";

export function PasswordsTab({ switchId }: { switchId: string }) {
  return <DevicePasswordsManager<Switch> deviceId={switchId} />;
}
