import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useDevice } from "@/hooks/use-device";

import type { VLAN } from "@/types/network/config/switch";
import type { Switch } from "@/types/network/device";

export function VlansTab({ switchId }: { switchId: string }) {
  const [device, setDevice] = useDevice<Switch>(switchId);
  const [newVlanId, setNewVlanId] = useState("");
  const [newVlanName, setNewVlanName] = useState("");

  const handleAddVlan = () => {
    const id = Number.parseInt(newVlanId, 10);

    if (Number.isNaN(id) || id < 1 || id > 4094) {
      toast.error("VLAN ID must be a number between 1 and 4094.");
      return;
    }

    if (!newVlanName.trim()) {
      toast.error("VLAN Name cannot be empty.");
      return;
    }

    const existingVlans = device.config.vlans || [];
    if (existingVlans.some((v) => v.id === id)) {
      toast.error(`VLAN with ID ${id} already exists.`);
      return;
    }

    const newVlan: VLAN = { id, name: newVlanName.trim() };

    setDevice({
      ...device,
      config: {
        ...device.config,
        vlans: [...existingVlans, newVlan].sort((a, b) => a.id - b.id),
      },
    });

    setNewVlanId("");
    setNewVlanName("");
    toast.success(`Successfully added VLAN ${id}.`);
  };

  const handleRemoveVlan = (vlanId: number) => {
    const updatedVlans = (device.config.vlans || []).filter(
      (v) => v.id !== vlanId,
    );

    setDevice({
      ...device,
      config: {
        ...device.config,
        vlans: updatedVlans,
      },
    });

    toast.success(`Successfully removed VLAN ${vlanId}.`);
  };

  const existingVlans = device.config.vlans ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-medium">Add New VLAN</h2>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="VLAN ID"
            type="number"
            min="1"
            max="4094"
            value={newVlanId}
            onChange={(e) => setNewVlanId(e.target.value)}
          />
          <Input
            label="VLAN Name"
            value={newVlanName}
            onChange={(e) => setNewVlanName(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleAddVlan}>
          Add VLAN
        </Button>
      </div>
      <Separator className="my-3" />
      <div className="space-y-3">
        <div>
          <h2 className="font-medium">Configured VLANs</h2>
          <p className="text-muted-foreground text-xs">
            These VLANs will be created in the switch's global configuration.
          </p>
        </div>
        {existingVlans.length === 0 ? (
          <p className="text-muted-foreground text-xs">No VLANs configured.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto rounded-md border">
            {existingVlans.map((vlan) => (
              <div
                className="flex items-center justify-between border-b p-3 last:border-b-0"
                key={vlan.id}
              >
                <div>
                  <p className="font-medium font-mono text-sm">
                    VLAN {vlan.id}
                  </p>
                  <p className="text-muted-foreground text-xs">{vlan.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVlan(vlan.id)}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
