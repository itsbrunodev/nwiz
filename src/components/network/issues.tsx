import { useAtomValue } from "jotai";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { validationAtom } from "@/stores/network";

import { cn } from "@/lib/utils";

export function NetworkIssues() {
  const issues = useAtomValue(validationAtom);

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm",
            issue.level === "error"
              ? "text-destructive"
              : "text-yellow-600 dark:text-yellow-500",
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: simple fix
          key={i}
        >
          {issue.level === "error" ? (
            <AlertCircle className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
          <div>
            <span className="font-semibold">{issue.source.deviceName}: </span>
            {issue.message}
          </div>
        </div>
      ))}
    </div>
  );
}
