import { Link as RouterLink } from "react-router";

export function Link(props: React.ComponentProps<typeof RouterLink>) {
  const isTauri = "__TAURI__" in window;

  async function openExternally() {
    const { openUrl } = await import("@tauri-apps/plugin-opener");

    openUrl(props.to.toString());
  }

  return (
    <RouterLink
      {...props}
      onClick={(e) => {
        // open external links in the system browser when in Tauri
        if (isTauri && props.target === "_blank") {
          e.preventDefault();

          openExternally();
        }
      }}
    />
  );
}
