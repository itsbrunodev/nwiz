import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function TabBar<T extends string>({
  tabs,
  currentTab,
  onChange,
}: {
  tabs: readonly T[];
  currentTab: T;
  onChange: (tab: T) => void;
}) {
  return (
    <ButtonGroup aria-label="Tabs">
      {tabs.map((tab) => (
        <Button
          variant={currentTab === tab ? "default" : "secondary"}
          onClick={() => onChange(tab)}
          key={tab}
        >
          {tab}
        </Button>
      ))}
    </ButtonGroup>
  );
}
