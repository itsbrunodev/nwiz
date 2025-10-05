import { useSetAtom } from "jotai";
import { useState } from "react";
import short from "short-uuid";
import { toast } from "sonner";

import { networkAtom } from "@/stores/network";

import { decodeCompactBase64 } from "@/lib/encode";

import type { Network } from "@/types/network";
import type { Connection } from "@/types/network/connection";
import type {
  Device,
  PC,
  Router,
  Server,
  Switch,
} from "@/types/network/device";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ArrowUpRightIcon, CircleQuestionMarkIcon } from "lucide-react";

interface PacketTracerDevice {
  id: string; // full UUID from Packet Tracer
  name: string;
  model: string;
}

interface PacketTracerConnection {
  id: string;
  from: { deviceId: string; interfaceName: string };
  to: { deviceId: string; interfaceName: string };
}

interface PacketTracerTopology {
  devices: PacketTracerDevice[];
  connections: PacketTracerConnection[];
}

export function ImportNetwork() {
  const setNetwork = useSetAtom(networkAtom);

  const [code, setCode] = useState("");
  const [packetTracerResponse, setPacketTracerResponse] = useState("");

  const [parsedPtNetwork, setParsedPtNetwork] = useState<Network | null>(null);

  const handlePacketTracerChange = (value: string) => {
    setPacketTracerResponse(value);
    setParsedPtNetwork(null);

    if (!value.trim()) {
      return;
    }

    try {
      const ptTopology: PacketTracerTopology = JSON.parse(value);

      if (!ptTopology.devices || !ptTopology.connections) {
        throw new Error(
          'Invalid JSON structure. "devices" and "connections" arrays are required.',
        );
      }

      const ptUuidToShortUuid = new Map<string, string>();

      const newDevices: Device[] = ptTopology.devices.map((ptDevice) => {
        const newId = short.generate();
        ptUuidToShortUuid.set(ptDevice.id, newId);

        let deviceType: Device["deviceType"] = "PC";
        if (["1841", "1941", "2901", "2911"].includes(ptDevice.model)) {
          deviceType = "Router";
        } else if (["2960", "3560"].includes(ptDevice.model)) {
          deviceType = "Switch";
        } else if (ptDevice.model === "Server") {
          deviceType = "Server";
        }

        let config: Device["config"];

        switch (deviceType) {
          case "Router": {
            config = { interfaces: [] } as Router["config"];
            break;
          }
          case "Switch": {
            config = { vlans: [], interfaces: [] } as Switch["config"];
            break;
          }
          case "PC": {
            config = {
              ipAddress: "",
              subnetMask: "",
              defaultGateway: "",
            } as PC["config"];
            break;
          }
          case "Server": {
            config = {
              ipAddress: "",
              subnetMask: "",
              defaultGateway: "",
              services: {},
            } as Server["config"];
            break;
          }
        }

        return {
          id: newId,
          name: ptDevice.name,
          hostname: ptDevice.name,
          deviceType,
          model: ptDevice.model,
          config,
        } as Device;
      });

      const newConnections: Connection[] = ptTopology.connections.map(
        (ptConn) => {
          const fromDeviceId = ptUuidToShortUuid.get(ptConn.from.deviceId);
          const toDeviceId = ptUuidToShortUuid.get(ptConn.to.deviceId);

          if (!fromDeviceId || !toDeviceId) {
            throw new Error(
              `Could not map devices for connection: ${ptConn.id}`,
            );
          }

          return {
            id: short.generate(),
            from: {
              deviceId: fromDeviceId,
              interfaceName: ptConn.from.interfaceName,
            },
            to: {
              deviceId: toDeviceId,
              interfaceName: ptConn.to.interfaceName,
            },
          };
        },
      );

      const now = new Date().toISOString();

      const finalNetwork: Network = {
        id: short.generate(),
        devices: newDevices,
        connections: newConnections,
        createdAt: now,
        updatedAt: now,
      };

      setParsedPtNetwork(finalNetwork);
    } catch (error) {
      setParsedPtNetwork(null);
      if (!(error instanceof SyntaxError)) {
        toast.error(`Import Error: ${(error as Error).message}`);
      }
    }
  };

  const handleImport = () => {
    if (parsedPtNetwork) {
      setNetwork(parsedPtNetwork);
      toast.success("Network imported from Packet Tracer successfully");
    } else if (code) {
      setNetwork(decodeCompactBase64(code));
      toast.success("Network imported successfully");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Import</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Network</DialogTitle>
          <DialogDescription>
            Import a network shared by others by pasting the code or Packet
            Tracer response.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            label="Code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setPacketTracerResponse("");
              setParsedPtNetwork(null);
            }}
          />
          <div className="flex items-center">
            <Separator className="flex-1" />
            <p className="mx-3 font-medium text-muted-foreground text-xs">OR</p>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-2">
            <Input
              label="Packet Tracer Response"
              value={packetTracerResponse}
              onChange={(e) => {
                setCode("");
                handlePacketTracerChange(e.target.value);
              }}
            />
            <Alert>
              <CircleQuestionMarkIcon />
              <AlertTitle>
                Where can I find my Packet Tracer response?
              </AlertTitle>
              <AlertDescription>
                <div>
                  Refer to the{" "}
                  <Button className="!px-0" size="sm" variant="link" asChild>
                    <a
                      href="https://github.com/itsbrunodev/nwiz#faq"
                      target="_blank"
                      rel="noopener"
                    >
                      FAQ
                    </a>
                  </Button>{" "}
                  on how to export your network topology from Packet Tracer.
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button disabled={!code && !parsedPtNetwork} onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
