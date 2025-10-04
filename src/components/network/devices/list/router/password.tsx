import { DevicePasswordsManager } from "@/components/network/tabs/passwords";

import type { Router } from "@/types/network/device";

export function PasswordsTab({ routerId }: { routerId: string }) {
  return <DevicePasswordsManager<Router> deviceId={routerId} />;
}
