import { useState } from "react";

import { TabBar } from "../tab-bar";
import { GeneralTab } from "./general";
import { InterfacesTab } from "./interfaces";
import { PasswordsTab } from "./password";
import { SshTab } from "./ssh";
import { StaticRoutesTab } from "./static-routes";

const tabs = [
  "General",
  "Interfaces",
  "Static Routes",
  "Passwords",
  "SSH",
] as const;
type Tab = (typeof tabs)[number];

export function RouterContent({ routerId }: { routerId: string }) {
  const [currentTab, setCurrentTab] = useState<Tab>("General");

  return (
    <div className="flex min-h-96 flex-col gap-3">
      <TabBar<Tab>
        tabs={tabs}
        currentTab={currentTab}
        onChange={setCurrentTab}
      />
      {currentTab === "General" && <GeneralTab routerId={routerId} />}
      {currentTab === "Interfaces" && <InterfacesTab routerId={routerId} />}
      {currentTab === "Static Routes" && (
        <StaticRoutesTab routerId={routerId} />
      )}
      {currentTab === "Passwords" && <PasswordsTab routerId={routerId} />}
      {currentTab === "SSH" && <SshTab routerId={routerId} />}
    </div>
  );
}
