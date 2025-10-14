import { useMemo } from "react";

import { cn } from "@/lib/utils";

const COMMANDS = [
  "ip",
  "interface",
  "crypto",
  "banner",
  "line",
  "enable",
  "configure",
  "service",
  "username",
  "hostname",
  "vlan",
  "access-list",
  "no",
];

const SUBCOMMANDS = [
  "route",
  "address",
  "access",
  "trunk",
  "name",
  "motd",
  "vty",
  "con",
  "secret",
  "password-encryption",
  "domain-name",
  "key",
  "version",
  "ssh",
  "memory",
];

const PARAMETERS = [
  "mode",
  "encapsulation",
  "dot1q",
  "privilege",
  "generate",
  "rsa",
  "modulus",
  "transport",
  "input",
  "local",
];

const ACTIONS = ["permit", "deny", "shutdown", "login", "exit", "end", "write"];

const IP_REGEX = /^\d{1,3}(\.\d{1,3}){3}$/;
const INTERFACE_REGEX =
  /^(?:GigabitEthernet|FastEthernet|Serial|Vlan|Loopback|g|f|s)\S*$/i;
const NUMBER_REGEX = /^\d+$/;

function getTokenType(
  token: string,
  context: { lineTokens: string[]; index: number },
): string {
  const lowerToken = token.toLowerCase();
  const prevToken = context.lineTokens[context.index - 1]?.toLowerCase();

  if (prevToken) {
    if (
      ["hostname", "username", "pool", "name", "domain-name"].includes(
        prevToken,
      )
    )
      return "token-value-name";

    if (prevToken === "vlan" && NUMBER_REGEX.test(token))
      return "token-value-number";

    if (prevToken === "modulus" && NUMBER_REGEX.test(token))
      return "token-value-number";

    if (
      prevToken === "route" &&
      context.lineTokens[context.index - 2]?.toLowerCase() === "ip"
    )
      return "token-value-ip";

    if (IP_REGEX.test(prevToken)) return "token-value-ip";
  }

  if (COMMANDS.includes(lowerToken)) return "token-command";
  if (SUBCOMMANDS.includes(lowerToken)) return "token-subcommand";
  if (PARAMETERS.includes(lowerToken)) return "token-parameter";
  if (ACTIONS.includes(lowerToken)) return "token-action";
  if (IP_REGEX.test(token)) return "token-value-ip";
  if (INTERFACE_REGEX.test(token)) return "token-value-interface";
  if (NUMBER_REGEX.test(token)) return "token-value-number";

  return "token-default";
}

function parseAndHighlight(code: string) {
  return code.split("\n").map((line) => {
    const key = `${line.trim()}_${line.length}`;

    if (line.trim() === "") return <div className="min-h-6" key={key} />;

    if (line.trim().startsWith("!"))
      return (
        <div key={key}>
          <span className="token-comment">{line}</span>
        </div>
      );

    const motdMatch = line.match(/^(\s*)(banner motd\s+)(.)(.*?)\3\s*$/);

    if (motdMatch) {
      const [, indent, command, delimiter, content] = motdMatch;

      const commandTokens = command.trim().split(" ");

      return (
        <div key={key}>
          <span>{indent}</span>
          <span
            className={getTokenType(commandTokens[0], {
              lineTokens: [],
              index: 0,
            })}
          >
            {commandTokens[0]}{" "}
          </span>
          <span
            className={getTokenType(commandTokens[1], {
              lineTokens: commandTokens,
              index: 1,
            })}
          >
            {commandTokens[1]}{" "}
          </span>
          <span className="token-string">{`${delimiter}${content}${delimiter}`}</span>
        </div>
      );
    }

    const parts = line.split(/(\s+)/);
    const lineTokens = parts.filter((p) => p.trim() !== "");

    let tokenIndex = 0;

    return (
      <div key={key}>
        {parts.map((part, j) => {
          const key = `${part}_${j}`;

          if (part.trim() === "") return <span key={key}>{part}</span>;

          const tokenType = getTokenType(part, {
            lineTokens,
            index: tokenIndex,
          });

          tokenIndex++;

          return (
            <span className={tokenType} key={key}>
              {part}
            </span>
          );
        })}
      </div>
    );
  });
}

export function HighlightedPre({
  className,
  children,
  ...props
}: {
  children: string;
} & React.ComponentProps<"pre">) {
  const content = useMemo(() => {
    if (typeof children !== "string") return children;
    return parseAndHighlight(children);
  }, [children]);

  return (
    <pre
      {...props}
      className={cn(
        "w-full overflow-auto rounded-md border bg-card p-3 text-card-foreground",
        "whitespace-pre font-mono text-sm leading-relaxed",
        className,
      )}
    >
      <code>{content}</code>
    </pre>
  );
}
