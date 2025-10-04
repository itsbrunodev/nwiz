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
