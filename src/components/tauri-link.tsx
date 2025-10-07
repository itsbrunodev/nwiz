export function TauriLink(props: React.ComponentProps<"a">) {
  const isTauri = "__TAURI__" in window;

  async function openExternally() {
    const { openUrl } = await import("@tauri-apps/plugin-opener");

    openUrl(props.href || "");
  }

  return (
    <a
      {...props}
      href={isTauri ? undefined : props.href}
      onClick={(e) => {
        if (isTauri) {
          e.preventDefault();

          openExternally();
        }
      }}
    />
  );
}
