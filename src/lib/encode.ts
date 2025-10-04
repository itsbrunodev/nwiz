import lzs from "lz-string";

import type { Network } from "@/types/network";

const keyMap: Record<string, string> = {
  // Original keys
  id: "i",
  devices: "d",
  connections: "c",
  name: "n",
  hostname: "h",
  deviceType: "t",
  model: "m",
  config: "f",
  interfaces: "ifs",
  vlans: "v",
  ipAddress: "ip",
  subnetMask: "sm",
  defaultGateway: "gw",
  from: "fr",
  to: "to",
  deviceId: "di",
  interfaceName: "if",
  accessClass: "ac",
  accessLists: "al",
  accessVlan: "av",
  action: "act",
  address: "a",
  allowedVlans: "avl",
  authenticationRetries: "ar",
  createdAt: "ca",
  defaultRouter: "dr",
  description: "desc",
  destinationNetwork: "dnet",
  dhcpPools: "dp",
  dns: "dns",
  dnsServer: "ds",
  domainName: "dn",
  enabled: "e",
  enableSecret: "es",
  encapsulation: "enc",
  excludedAddresses: "ea",
  forwarding: "fw",
  http: "ht",
  keyString: "ks",
  lineAux: "la",
  lineConsole: "lc",
  lineVty: "lv",
  localUsers: "lu",
  mode: "md",
  modulus: "mod",
  nativeVlan: "nv",
  network: "nw",
  password: "p",
  privilege: "pr",
  records: "rec",
  rsaKey: "rk",
  rules: "r",
  services: "srv",
  sourceAddress: "sa",
  sourceWildcard: "sw",
  ssh: "ssh",
  staticRoutes: "sr",
  subInterfaces: "si",
  timeout: "tout",
  type: "ty",
  updatedAt: "ua",
  userPublicKeys: "upk",
  username: "u",
  version: "ver",
  vlanId: "vid",
};

const reverseKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(keyMap).map(([k, v]) => [v, k]),
);

const typeMap: Record<string, string> = {
  Router: "R",
  Switch: "S",
  Server: "V",
  PC: "P",
};
const reverseTypeMap: Record<string, string> = Object.fromEntries(
  Object.entries(typeMap).map(([k, v]) => [v, k]),
);

function minifyNetworkData(network: Network): unknown {
  function recurse(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(recurse);
    if (obj && typeof obj === "object") {
      const newObj: Record<string, unknown> = {};
      for (const key in obj) {
        const newKey = keyMap[key] ?? key;
        // biome-ignore lint/suspicious/noExplicitAny: simple fix
        let value = (obj as any)[key];
        if (
          key === "deviceType" &&
          typeof value === "string" &&
          typeMap[value]
        ) {
          value = typeMap[value];
        }
        newObj[newKey] = recurse(value);
      }
      return newObj;
    }
    return obj;
  }
  return recurse(network);
}

function restoreNetworkData(minified: unknown): Network {
  function recurse(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(recurse);
    if (obj && typeof obj === "object") {
      const newObj: Record<string, unknown> = {};
      for (const key in obj) {
        const originalKey = reverseKeyMap[key] ?? key;
        // biome-ignore lint/suspicious/noExplicitAny: simple fix
        let value = (obj as any)[key];
        if (
          originalKey === "deviceType" &&
          typeof value === "string" &&
          reverseTypeMap[value]
        ) {
          value = reverseTypeMap[value];
        }
        newObj[originalKey] = recurse(value);
      }
      return newObj;
    }
    return obj;
  }
  return recurse(minified) as Network;
}

export function encodeCompactBase64(network: Network) {
  const minified = minifyNetworkData(network);
  return lzs.compressToEncodedURIComponent(JSON.stringify(minified));
}

export function decodeCompactBase64(str: string): Network {
  const jsonString = lzs.decompressFromEncodedURIComponent(str);
  if (!jsonString) throw new Error("Failed to decompress data.");
  const minified = JSON.parse(jsonString);
  return restoreNetworkData(minified);
}
