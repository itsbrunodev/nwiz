import { Plus, Trash2 } from "lucide-react";

import { DeviceInterfaceManager } from "@/components/network/tabs/interfaces";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <div>
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

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Subinterfaces (802.1Q)</Label>
                <Button variant="outline" size="sm" onClick={addSubInterface}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>

              {config.subInterfaces && config.subInterfaces.length > 0 && (
                <div className="flex flex-col gap-2">
                  {config.subInterfaces.map((subInt, index) => (
                    <Card key={subInt.vlanId}>
                      <CardHeader>
                        <CardTitle>
                          {config.name}.{subInt.vlanId}
                        </CardTitle>
                        <CardAction>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubInterface(index)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
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
                          // placeholder="Optional"
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      }}
    />
  );
}
