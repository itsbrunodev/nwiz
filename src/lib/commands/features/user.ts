import type { LocalUser } from "@/types/network/config/user";

export const generateLocalUserCommands = (users?: LocalUser[]): string[] =>
  users
    ?.filter((u) => u.username && u.password)
    .map(
      (u) =>
        `username ${u.username} privilege ${u.privilege || 1} password ${
          u.password
        }`,
    ) ?? [];
