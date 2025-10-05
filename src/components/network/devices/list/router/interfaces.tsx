import { XIcon } from "lucide-react";

import { DeviceInterfaceManager } from "@/components/network/tabs/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { convertCidr } from "@/lib/network";

import type {
  RouterInterface,
  SubInterface,
} from "@/types/network/config/router";
import type { Router } from "@/types/network/device";

export function InterfacesTab({ routerId }: { routerId: string }) {
  return (
    <DeviceInterfaceManager<Router>
      deviceId={routerId}
      renderInterfaceFields={(interfaceConfig, updateInterface) => {
        const config = interfaceConfig as RouterInterface;

        const addSubInterface = () => {
          const subInterfaces = config.subInterfaces || [];
          const existingVlanIds = subInterfaces.map((s) => s.vlanId);
          let nextVlanId = 10;

          while (existingVlanIds.includes(nextVlanId)) {
            nextVlanId += 10;
          }

          const newSubInterface: SubInterface = {
            vlanId: nextVlanId,
            encapsulation: "dot1Q",
            ipAddress: "",
            subnetMask: "",
          };

          updateInterface({
            subInterfaces: [...subInterfaces, newSubInterface],
          });
        };

        const updateSubInterface = (
          index: number,
          updates: Partial<SubInterface>,
        ) => {
          const subInterfaces = [...(config.subInterfaces || [])];
          subInterfaces[index] = { ...subInterfaces[index], ...updates };
          updateInterface({ subInterfaces });
        };

        const removeSubInterface = (index: number) => {
          const subInterfaces = (config.subInterfaces || []).filter(
            (_, i) => i !== index,
          );
          updateInterface({ subInterfaces });
        };

        return (
          <>
            <div className="mb-3">
              <Input
                label="IP Address"
                value={config.ipAddress || ""}
                onChange={(e) => updateInterface({ ipAddress: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const ipAddress = e.currentTarget.value;
                    let subnetMask = "";

                    try {
                      subnetMask = convertCidr(ipAddress).mask;
                    } catch (error) {
                      console.error(error);

                      subnetMask = "";
                    }

                    updateInterface({ ipAddress, subnetMask });
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
              value={config.subnetMask || ""}
              onChange={(e) => updateInterface({ subnetMask: e.target.value })}
            />
            <div className="space-y-3">
              <h3 className="font-medium">Subinterfaces (802.1Q)</h3>
              <Button variant="outline" size="sm" onClick={addSubInterface}>
                Add Subinterface
              </Button>
              <div className="space-y-2">
                {!config.subInterfaces ||
                  (config.subInterfaces.length === 0 && (
                    <p className="text-muted-foreground text-xs">
                      No subinterfaces configured.
                    </p>
                  ))}
                {config.subInterfaces && config.subInterfaces.length > 0 && (
                  <div className="flex flex-col rounded-md border bg-card">
                    {config.subInterfaces.map((subInt, index) => (
                      <div
                        className="space-y-2 border-b p-3 last:border-b-0"
                        key={subInt.vlanId}
                      >
                        <div className="flex items-center justify-between">
                          <p>
                            {config.name}.{subInt.vlanId}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubInterface(index)}
                          >
                            <XIcon />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            label="VLAN ID"
                            type="number"
                            min="1"
                            max="4094"
                            value={subInt.vlanId}
                            onChange={(e) =>
                              updateSubInterface(index, {
                                vlanId: Number(e.target.value) || 1,
                              })
                            }
                          />
                          <Input
                            label="Description (optional)"
                            value={subInt.description || ""}
                            onChange={(e) =>
                              updateSubInterface(index, {
                                description: e.target.value,
                              })
                            }
                          />
                          <Input
                            label="IP Address"
                            value={subInt.ipAddress}
                            onChange={(e) =>
                              updateSubInterface(index, {
                                ipAddress: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const ipAddress = e.currentTarget.value;

                                let subnetMask = "";

                                try {
                                  subnetMask = convertCidr(ipAddress).mask;
                                } catch (error) {
                                  console.error(error);

                                  subnetMask = "";
                                }
                                updateSubInterface(index, {
                                  ipAddress,
                                  subnetMask,
                                });
                              }
                            }}
                          />
                          <Input
                            label="Subnet Mask"
                            value={subInt.subnetMask}
                            onChange={(e) =>
                              updateSubInterface(index, {
                                subnetMask: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }}
    />
  );
}
