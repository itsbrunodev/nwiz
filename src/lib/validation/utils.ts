import { isValidIPv4 } from "../network";
import { MESSAGES, type ValidationResult } from "./types";

export function getSubnet(ip?: string, mask?: string): string | null {
  if (!ip || !mask) return null;
  const ipParts = ip.split(".").map(Number);
  const maskParts = mask.split(".").map(Number);

  if (ipParts.some(Number.isNaN) || maskParts.some(Number.isNaN)) return null;

  return ipParts.map((part, i) => part & maskParts[i]).join(".");
}

export function validateAndTrackIp(
  ip: string,
  source: ValidationResult["source"],
  ipAddressMap: Map<string, ValidationResult["source"]>,
): ValidationResult | null {
  const type = source.interfaceName ? "IPv4 address" : "IP address";
  const formatErr = validateAddressFormat(ip, type, source);

  if (formatErr) return formatErr;

  if (ipAddressMap.has(ip)) {
    // biome-ignore lint/style/noNonNullAssertion: simple fix
    const original = ipAddressMap.get(ip)!;

    return {
      level: "error",
      message: MESSAGES.DUPLICATE_IP(
        ip,
        original.deviceName,
        original.interfaceName,
      ),
      source,
    };
  }

  ipAddressMap.set(ip, source);
  return null;
}

export function validateAddressFormat(
  address: string,
  type: string,
  source: ValidationResult["source"],
): ValidationResult | null {
  const isValid =
    type === "subnet mask"
      ? isValidIPv4("0.0.0.0", address)
      : isValidIPv4(address);

  return isValid
    ? null
    : {
        level: "error",
        message: MESSAGES.INVALID_FORMAT(type, address),
        source,
      };
}
