import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { Commands } from "@/components/network/commands";
import { AddDeviceButton } from "@/components/network/devices/add";
import { DevicesList } from "@/components/network/devices/list";
import { NetworkIssues } from "@/components/network/issues";
import { ResetNetworkButton } from "@/components/network/reset";
import { SettingsNetworkButton } from "@/components/network/settings";
import { NetworkVisualizationGraph } from "@/components/network/visualization/graph";
import { NetworkVisualizationTree } from "@/components/network/visualization/tree";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import {
  networkAtom,
  networkVisualizationAtom,
  VISUALIZATION_TYPES,
  validationAtom,
} from "@/stores/network";

import { generateCommands } from "@/lib/commands";
import { decodeCompactBase64 } from "@/lib/encode";

export function IndexPage() {
  const [network, setNetwork] = useAtom(networkAtom);
  const issues = useAtomValue(validationAtom);

  const [visualizationType, setVisualizationType] = useAtom(
    networkVisualizationAtom,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const encodedData = url.searchParams.get("network");

      if (!encodedData) return;

      const decoded = decodeCompactBase64(encodedData);

      const currentSerialized = JSON.stringify(network ?? {});
      const decodedSerialized = JSON.stringify(decoded ?? {});

      if (currentSerialized !== decodedSerialized) {
        setNetwork(decoded);
      }

      const cleanUrl =
        window.location.origin +
        window.location.pathname +
        window.location.hash;

      window.history.replaceState({}, "", cleanUrl);
    } catch (err) {
      console.error("Failed to parse or decode network param:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `nwiz - ${network?.name || "New Network"}`;
    }
  }, [network?.name]);

  const commands = useMemo(() => {
    return generateCommands(network, {
      verbose: false,
    });
  }, [network]);

  return (
    <>
      <div className="flex flex-col gap-1 border-b pb-3">
        <h2 className="font-bold text-2xl">{network?.name || "New Network"}</h2>
        <p className="text-muted-foreground text-sm">
          {network?.description || "No description."}
        </p>
      </div>
      <div className="flex gap-2">
        <AddDeviceButton />
        <SettingsNetworkButton />
        <div className="my-auto h-6 w-px bg-border" />
        <ResetNetworkButton />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-lg">Devices</h3>
        <DevicesList />
      </div>
      {issues.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-lg">Issues</h3>
          <NetworkIssues />
        </div>
      )}
      {network?.devices && network.devices.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">Network Visualization</h3>
            <ButtonGroup>
              {VISUALIZATION_TYPES.map(({ label, value }) => (
                <Button
                  variant={value === visualizationType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizationType(value)}
                  key={value}
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
          {visualizationType === "tree" && <NetworkVisualizationTree />}
          {visualizationType === "graph" && <NetworkVisualizationGraph />}
        </div>
      )}
      {commands.size > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-lg">Commands</h3>
          <Commands commandsMap={commands} devices={network?.devices} />
        </div>
      )}
    </>
  );
}
