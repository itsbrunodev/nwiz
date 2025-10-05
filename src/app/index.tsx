import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

import { Commands } from "@/components/network/commands";
import { AddDeviceButton } from "@/components/network/devices/add";
import { DevicesList } from "@/components/network/devices/list";
import { NetworkIssues } from "@/components/network/issues";
import { ResetNetworkButton } from "@/components/network/reset";
import { Label } from "@/components/ui/label";
import { Pre } from "@/components/ui/pre";

import { networkAtom, validationAtom } from "@/stores/network";

import { generateCommands } from "@/lib/commands";
import { decodeCompactBase64 } from "@/lib/encode";
import { createNetworkTree } from "@/lib/visualize";

export function IndexPage() {
  const [network, setNetwork] = useAtom(networkAtom);
  const issues = useAtomValue(validationAtom);

  const url = window.location.href;

  useEffect(() => {
    const urlParams = new URL(url).searchParams;
    const encodedData = urlParams.get("network");

    document.title = `nwiz - ${network?.name || "New Network"}`;

    if (encodedData) {
      setNetwork(decodeCompactBase64(encodedData));
      window.history.replaceState({}, "", window.location.href.split("?")[0]);
    }
  }, [setNetwork, url, network?.name]);

  const tree = createNetworkTree(network);

  const commands = generateCommands(network, {
    enableServicePasswordEncryption: true,
    saveConfiguration: true,
    verbose: false,
  });

  return (
    <>
      <div className="flex flex-col gap-1 border-b pb-3">
        <h2 className="font-bold text-2xl">{network.name || "New Network"}</h2>
        <p className="text-muted-foreground text-sm">
          {network.description || "No description."}
        </p>
      </div>
      <div className="flex gap-2">
        <AddDeviceButton />
        <ResetNetworkButton />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Devices</Label>
        <DevicesList />
      </div>
      {issues.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Issues</Label>
          <NetworkIssues />
        </div>
      )}
      {tree && (
        <div className="flex flex-col gap-2">
          <Label>Network</Label>
          <Pre>{tree}</Pre>
        </div>
      )}
      {commands.size > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Commands</Label>
          <Commands commandsMap={commands} devices={network.devices} />
        </div>
      )}
    </>
  );
}
