import { AlertCircleIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useDevice } from "@/hooks/use-device";

import { camelToTitleCase } from "@/lib/utils";

import type {
  SshConfig,
  SshRsaKeyConfig,
  SshUserPublicKey,
} from "@/types/network/config/ssh";
import type { Router, Switch } from "@/types/network/device";

const sshFields = ["timeout", "authenticationRetries"] as const;
const rsaModulusOptions = [1024, 2048, 4096] as const;

type SshFieldKey = (typeof sshFields)[number];
type SshCapableDevice = Router | Switch;

/**
 * Generic manager for device SSH configuration.
 * T is constrained to only devices that support SSH (Router or Switch).
 */
export function DeviceSshManager<T extends SshCapableDevice>({
  deviceId,
}: {
  deviceId: string;
}) {
  const [device, setDevice] = useDevice<T>(deviceId);

  if (!device) return null;

  const sshConfig = device.config?.ssh ?? ({} as SshConfig);

  const setConfigValue = (
    key: keyof T["config"],
    value: string | undefined,
  ) => {
    const newConfig: T["config"] = {
      ...device.config,
      [key]: value,
    } as T["config"];

    setDevice({
      ...device,
      config: newConfig,
    });
  };

  const setSshValue = (key: SshFieldKey, value: number | undefined) => {
    const newConfig: T["config"] = {
      ...device.config,
      ssh: {
        ...sshConfig,
        version: 2,
        rsaKey: sshConfig.rsaKey ?? { modulus: 1024 },
        [key]: value,
      },
    } as T["config"];

    setDevice({
      ...device,
      config: newConfig,
    });
  };

  const setRsaModulus = (modulus: SshRsaKeyConfig["modulus"]) => {
    const newConfig: T["config"] = {
      ...device.config,
      ssh: {
        ...sshConfig,
        version: 2,
        rsaKey: {
          ...sshConfig.rsaKey,
          modulus,
        },
      },
    } as T["config"];

    setDevice({
      ...device,
      config: newConfig,
    });
  };

  const setUserPublicKeys = (newUserPublicKeys: SshUserPublicKey[]) => {
    const newConfig: T["config"] = {
      ...device.config,
      ssh: {
        ...sshConfig,
        version: 2,
        rsaKey: sshConfig.rsaKey ?? { modulus: 1024 },
        userPublicKeys: newUserPublicKeys,
      },
    } as T["config"];

    setDevice({
      ...device,
      config: newConfig,
    });
  };

  const addUserPublicKey = () => {
    const newUser: SshUserPublicKey = { username: "", keyString: "" };
    setUserPublicKeys([...(sshConfig.userPublicKeys ?? []), newUser]);
  };

  const removeUserPublicKey = (index: number) => {
    const updatedKeys = [...(sshConfig.userPublicKeys ?? [])];
    updatedKeys.splice(index, 1);
    setUserPublicKeys(updatedKeys);
  };

  const updateUserPublicKey = (
    index: number,
    field: keyof SshUserPublicKey,
    value: string,
  ) => {
    const updatedKeys = [...(sshConfig.userPublicKeys ?? [])];
    updatedKeys[index] = { ...updatedKeys[index], [field]: value };
    setUserPublicKeys(updatedKeys);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircleIcon />
        <AlertTitle className="font-semibold">Prerequisites for SSH</AlertTitle>
        <AlertDescription>
          <p>
            For SSH to be enabled, the device must have a configured{" "}
            <strong>Hostname</strong> (in the General tab) different from the
            default hostname, a <strong>Domain Name</strong>, and a local{" "}
            <strong>Username/Password</strong> (in the Passwords tab).
          </p>
        </AlertDescription>
      </Alert>
      <Input
        label="Domain Name"
        value={device.config?.domainName ?? ""}
        onChange={(e) => setConfigValue("domainName", e.target.value)}
      />
      <Separator className="my-3" />
      <div className="space-y-3">
        <h2 className="font-medium">RSA Key Generation</h2>
        <Select
          value={
            sshConfig.rsaKey?.modulus ? String(sshConfig.rsaKey.modulus) : ""
          }
          onValueChange={(value) =>
            setRsaModulus(Number(value) as SshRsaKeyConfig["modulus"])
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a modulus" />
          </SelectTrigger>
          <SelectContent>
            {rsaModulusOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-3" />
      <div className="space-y-3">
        <h2 className="font-medium">SSH Timeouts & Retries</h2>
        <div className="space-y-2">
          {sshFields.map((fieldKey) => (
            <Input
              key={fieldKey}
              label={camelToTitleCase(fieldKey)}
              type="number"
              value={sshConfig[fieldKey] ?? ""}
              onChange={(e) =>
                setSshValue(
                  fieldKey,
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          ))}
        </div>
      </div>
      <Separator className="my-3" />
      <div className="space-y-3">
        <h2 className="font-medium">User Public Keys (RSA Authentication)</h2>
        {(sshConfig.userPublicKeys ?? []).length > 0 && (
          <div className="rounded-md border bg-card">
            {sshConfig.userPublicKeys?.map((user, index) => (
              <div
                key={user.username}
                className="flex items-center gap-2 border-b p-3 last:border-0"
              >
                <div className="grid w-full grid-cols-2 gap-2">
                  <Input
                    label="Username"
                    value={user.username}
                    onChange={(e) =>
                      updateUserPublicKey(index, "username", e.target.value)
                    }
                  />
                  <Input
                    label="Key String"
                    value={user.keyString}
                    onChange={(e) =>
                      updateUserPublicKey(index, "keyString", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove User Public Key"
                  onClick={() => removeUserPublicKey(index)}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button className="w-fit" size="sm" onClick={addUserPublicKey}>
          Add User Public Key
        </Button>
      </div>
    </div>
  );
}
