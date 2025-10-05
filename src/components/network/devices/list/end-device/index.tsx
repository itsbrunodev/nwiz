import { useState } from "react";

import { TabBar } from "../tab-bar";
import { GeneralTab } from "./general";

const tabs = ["General"] as const;
type Tab = (typeof tabs)[number];

export function EndDeviceContent({ deviceId }: { deviceId: string }) {
  const [currentTab, setCurrentTab] = useState<Tab>("General");

  return (
    <div className="flex min-h-96 flex-col gap-3">
      <TabBar<Tab>
        tabs={tabs}
        currentTab={currentTab}
        onChange={setCurrentTab}
      />

      {currentTab === "General" && <GeneralTab deviceId={deviceId} />}
    </div>
  );
}
