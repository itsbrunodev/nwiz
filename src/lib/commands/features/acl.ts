import type { AccessControlList } from "@/types/network/config/ssh";

export const generateAclCommands = (acls?: AccessControlList[]): string[] =>
  acls?.flatMap((acl) => [
    `no access-list ${acl.id}`,
    ...acl.rules.map(
      (rule) =>
        `access-list ${acl.id} ${rule.action} ${rule.sourceAddress} ${rule.sourceWildcard}`,
    ),
  ]) ?? [];
