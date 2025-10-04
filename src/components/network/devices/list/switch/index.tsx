import { useState } from "react";

import { TabBar } from "../tab-bar";
import { GeneralTab } from "./general";
import { InterfacesTab } from "./interfaces";
import { PasswordsTab } from "./password";

const tabs = ["General", "Interfaces", "Passwords", "SSH"] as const;
type Tab = (typeof tabs)[number];

export function SwitchContent({ switchId }: { switchId: string }) {
  const [currentTab, setCurrentTab] = useState<Tab>("General");

  return (
    <div className="flex min-h-96 flex-col gap-3">
      <TabBar<Tab>
        tabs={tabs}
        currentTab={currentTab}
        onChange={setCurrentTab}
      />

      {currentTab === "General" && <GeneralTab switchId={switchId} />}

      {currentTab === "Interfaces" && <InterfacesTab switchId={switchId} />}

      {currentTab === "Passwords" && <PasswordsTab switchId={switchId} />}
    </div>
  );
}
