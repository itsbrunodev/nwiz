import { useSetAtom } from "jotai";
import { ArrowUpRightIcon, CircleQuestionMarkIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import short from "short-uuid";
import { toast } from "sonner";

import { networkAtom } from "@/stores/network";

import { decodeCompactBase64 } from "@/lib/encode";

import {
  ROUTERS,
  type RouterModel,
  SWITCHES,
  type SwitchModel,
} from "@/constants/devices";

import type { Network } from "@/types/network";
import type { EndDeviceConfig } from "@/types/network/config/end-device";
import type { Connection } from "@/types/network/connection";
import type { Device, Router, Switch } from "@/types/network/device";

import { Link } from "../link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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
  const navigate = useNavigate();

  const setNetwork = useSetAtom(networkAtom);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

        let deviceType: Device["deviceType"] | null = null;

        if (ROUTERS.includes(ptDevice.model as RouterModel)) {
          deviceType = "Router";
        } else if (SWITCHES.includes(ptDevice.model as SwitchModel)) {
          deviceType = "Switch";
        } else if (ptDevice.model === "PC-PT") {
          deviceType = "PC";
        } else if (ptDevice.model === "Server-PT") {
          deviceType = "Server";
        } else if (ptDevice.model === "Laptop-PT") {
          deviceType = "Laptop";
        }

        if (deviceType === null) {
          throw new Error(`Unknown device model: ${ptDevice.model}`);
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
          case "PC":
          case "Server":
          case "Laptop": {
            config = {
              ipAddress: "",
              subnetMask: "",
              defaultGateway: "",
            } as EndDeviceConfig;
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

      try {
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
      } catch (connectionError) {
        setParsedPtNetwork(null);

        toast.error(`${(connectionError as Error).message}`);
      }
    } catch (error) {
      setParsedPtNetwork(null);

      if (!(error instanceof SyntaxError)) {
        toast.error(`${(error as Error).message}`);
      }
    }
  };

  const handleImport = () => {
    if (parsedPtNetwork) {
      setNetwork(parsedPtNetwork);

      toast.success("Successfully imported network from Packet Tracer.");
    } else if (code) {
      try {
        setNetwork(decodeCompactBase64(code));

        toast.success("Successfully imported network from code.");
      } catch (error) {
        toast.error(`${(error as Error).message}`);
      }
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              label="Packet Tracer response"
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
                  <Button
                    className="!p-0 [&_svg]:!size-3.5 h-fit gap-1"
                    size="sm"
                    variant="link"
                    asChild
                  >
                    <Link
                      to="https://github.com/itsbrunodev/nwiz?tab=readme-ov-file#import-from-packet-tracer"
                      target="_blank"
                      rel="noopener"
                    >
                      Readme <ArrowUpRightIcon />
                    </Link>
                  </Button>{" "}
                  on how to export your network topology from Packet Tracer and
                  import it here.
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <Button
            disabled={!code && !parsedPtNetwork}
            onClick={() => {
              handleImport();

              setIsDialogOpen(false);

              if (window.location.pathname !== "/") navigate("/");
            }}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
