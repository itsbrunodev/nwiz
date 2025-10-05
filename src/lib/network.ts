import { INTERFACES } from "@/constants/interfaces";

import type { Device } from "@/types/network/device";

/**
 * Converts a CIDR string or plain IP to an IP address and mask.
 * If only an IP is given, it derives the subnet mask from the IP class.
 *
 * @param cidr - A CIDR string like "192.168.0.1/24" or a plain IP like "192.168.0.1"
 * @example
 * convertCidr("192.168.0.1/24") // { ip: "192.168.0.1", mask: "255.255.255.0" }
 * convertCidr("10.0.0.1")       // { ip: "10.0.0.1", mask: "255.0.0.0" }
 * convertCidr("172.16.5.10")    // { ip: "172.16.5.10", mask: "255.255.0.0" }
 * convertCidr("192.168.0.1")    // { ip: "192.168.0.1", mask: "255.255.255.0" }
 */
export function convertCidr(cidr: string) {
  const [ip, prefixStr] = cidr.split("/");

  // Validate IP format
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    throw new Error("Invalid IP address");
  }

  // If prefix provided, use it directly
  if (prefixStr !== undefined) {
    const prefix = Number(prefixStr);
    if (prefix < 0 || prefix > 32) {
      throw new Error("Invalid CIDR prefix length");
    }

    // mask as a 32-bit integer
    const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

    // split mask into 4 octets
    const mask = [
      (maskInt >>> 24) & 0xff,
      (maskInt >>> 16) & 0xff,
      (maskInt >>> 8) & 0xff,
      maskInt & 0xff,
    ].join(".");

    return { ip, mask };
  }

  // Otherwise, determine mask based on IP class
  const firstOctet = Number(ip.split(".")[0]);
  let mask: string;

  if (firstOctet >= 1 && firstOctet <= 126) {
    mask = "255.0.0.0"; // Class A
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    mask = "255.255.0.0"; // Class B
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    mask = "255.255.255.0"; // Class C
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    mask = "Multicast (no standard subnet mask)";
  } else {
    throw new Error("Invalid or unsupported IP range");
  }

  return { ip, mask };
}

export function isValidIPv4(ip: string, mask?: string | number): boolean {
  const parseIPv4 = (s: string): number[] | null => {
    const parts = s.split(".");
    if (parts.length !== 4) return null;
    const octets: number[] = [];
    for (const p of parts) {
      if (p.length === 0) return null;
      if (!/^\d+$/.test(p)) return null;
      const n = Number(p);
      if (!Number.isFinite(n) || n < 0 || n > 255) return null;
      octets.push(n);
    }
    return octets;
  };

  const octetsToUint32 = (octets: number[]) =>
    (((octets[0] << 24) >>> 0) +
      ((octets[1] << 16) >>> 0) +
      ((octets[2] << 8) >>> 0) +
      (octets[3] >>> 0)) >>>
    0;

  const isContiguousMask = (maskUint: number): boolean => {
    const inv = ~maskUint >>> 0;
    return (inv & (inv + 1)) === 0;
  };

  let ipOnly = ip;
  let maskParam: string | number | undefined = mask;
  const slashIndex = ip.indexOf("/");
  if (slashIndex !== -1 && mask === undefined) {
    ipOnly = ip.substring(0, slashIndex);
    maskParam = ip.substring(slashIndex + 1);
  }

  const ipOctets = parseIPv4(ipOnly.trim());
  if (!ipOctets) return false;

  if (
    maskParam === undefined ||
    maskParam === null ||
    String(maskParam).trim() === ""
  ) {
    return true;
  }

  const maskStr = String(maskParam).trim();

  const prefixMatch = maskStr.match(/^\/?\s*(\d{1,2})$/);
  if (prefixMatch) {
    const prefix = Number(prefixMatch[1]);
    return Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
  }

  const maskOctets = parseIPv4(maskStr);
  if (!maskOctets) return false;
  const maskUint = octetsToUint32(maskOctets);
  return isContiguousMask(maskUint);
}

export function calculateDeviceName(
  name: string,
  deviceType: Device["deviceType"],
  devices: Device[],
) {
  return `${name}${devices.filter((device) => device.deviceType === deviceType).length}`;
}

export function getInterfacesForDevice(device: Device): string[] {
  switch (device.deviceType) {
    case "Router":
      return INTERFACES.Router[device.model];
    case "Switch":
      return INTERFACES.Switch[device.model];
    case "PC":
      return INTERFACES.PC;
    case "Server":
      return INTERFACES.Server;
    default:
      return [];
  }
}
