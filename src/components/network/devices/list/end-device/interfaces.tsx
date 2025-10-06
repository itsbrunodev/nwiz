import { DeviceInterfaceManager } from "@/components/network/tabs/interfaces";
import { Input } from "@/components/ui/input";

import { useDevice } from "@/hooks/use-device";

import { convertCidr } from "@/lib/network";

import type { EndDeviceConfig } from "@/types/network/config/end-device";
import type { EndDevice } from "@/types/network/device";

export function InterfacesTab({ deviceId }: { deviceId: string }) {
  const [device, setDevice] = useDevice<EndDevice>(deviceId);

  if (!device) {
    return <p>Device not found.</p>;
  }

  const updateConfig = (updates: Partial<EndDeviceConfig>) => {
    setDevice({
      ...device,
      config: {
        ...device.config,
        ...updates,
      },
    });
  };

  return (
    <DeviceInterfaceManager<EndDevice>
      deviceId={deviceId}
      renderInterfaceFields={() => (
        <div className="space-y-4">
          <div>
            <Input
              label="IP Address"
              value={device.config.ipAddress || ""}
              onChange={(e) => updateConfig({ ipAddress: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const ipAddress = e.currentTarget.value;
                  let subnetMask = "";

                  try {
                    subnetMask = convertCidr(ipAddress).mask;
                  } catch (error) {
                    console.error("Invalid CIDR notation:", error);
                    subnetMask = device.config.subnetMask || "";
                  }

                  updateConfig({ ipAddress, subnetMask });
                }
              }}
            />
            <p className="mx-3 mt-1 text-muted-foreground text-xs">
              Press{" "}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-medium text-muted-foreground">
                Enter
              </kbd>{" "}
              to calculate the subnet mask. You can also use a CIDR notation
              (e.g. 192.168.0.1/24) to calculate the subnet mask.
            </p>
          </div>
          <Input
            label="Subnet Mask"
            value={device.config.subnetMask || ""}
            onChange={(e) => updateConfig({ subnetMask: e.target.value })}
          />
          <Input
            label="Default Gateway"
            value={device.config.defaultGateway || ""}
            onChange={(e) => updateConfig({ defaultGateway: e.target.value })}
          />
        </div>
      )}
    />
  );
}
