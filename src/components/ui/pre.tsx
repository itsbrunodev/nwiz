import { cn } from "@/lib/utils";

export function Pre(props: React.ComponentProps<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "w-full overflow-y-auto whitespace-pre-wrap break-all rounded-md border bg-accent p-3",
        props.className,
      )}
    />
  );
}
