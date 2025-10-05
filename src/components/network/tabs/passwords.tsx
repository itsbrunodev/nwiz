import { Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import short from "short-uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDevice } from "@/hooks/use-device";

import { camelToTitleCase } from "@/lib/utils";

import type {
  ConsoleLineConfig,
  EnableSecretConfig,
  VtyLineConfig,
} from "@/types/network/config/password";
import type { LocalUser } from "@/types/network/config/user";
import type { Device } from "@/types/network/device";

type LinePasswordFieldKey = "lineConsole" | "lineVty" | "lineAux";

type PasswordsConfigShape = {
  localUsers?: LocalUser[];
  enableSecret?: EnableSecretConfig;
  lineConsole?: ConsoleLineConfig;
  lineVty?: VtyLineConfig;
  lineAux?: ConsoleLineConfig;
};

export function DevicePasswordsManager<T extends Device>({
  deviceId,
}: {
  deviceId: string;
}) {
  const [device, setDevice] = useDevice<T>(deviceId);

  const linePasswordFields = useMemo(() => {
    if (device?.deviceType === "Router") {
      return ["lineConsole", "lineVty", "lineAux"] as const;
    }
    return ["lineConsole", "lineVty"] as const;
  }, [device?.deviceType]);

  if (!device) return null;

  const deviceConfig = (device.config ?? {}) as PasswordsConfigShape;

  const setUsers = (users: LocalUser[]) => {
    setDevice({
      ...device,
      config: { ...device.config, localUsers: users } as T["config"],
    });
  };

  const addUser = () => {
    const newUser: LocalUser = {
      id: short.generate(),
      username: "",
      password: "",
    };
    setUsers([...(deviceConfig.localUsers ?? []), newUser]);
  };

  const updateUser = (index: number, field: keyof LocalUser, value: string) => {
    const updatedUsers = [...(deviceConfig.localUsers ?? [])];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsers(updatedUsers);
  };

  const removeUser = (id: string) => {
    setUsers((deviceConfig.localUsers ?? []).filter((user) => user.id !== id));
  };

  type Payload =
    | Partial<EnableSecretConfig>
    | Partial<ConsoleLineConfig>
    | Partial<VtyLineConfig>;

  const setPasswordForKey = (
    key: LinePasswordFieldKey | "enableSecret",
    payload: Payload,
  ) => {
    // biome-ignore lint/suspicious/noExplicitAny: simple fix
    const existingEntry = (deviceConfig as any)[key] ?? {};

    let updatedEntry = { ...existingEntry, ...(payload as T["config"]) };

    if (key === "lineVty" && payload && "password" in payload) {
      updatedEntry = {
        from: existingEntry.from ?? 0,
        to: existingEntry.to ?? 15,
        ...updatedEntry,
      };
    }

    const newConfig = { ...device.config, [key]: updatedEntry } as T["config"];
    setDevice({ ...device, config: newConfig });
  };

  const setAllPasswords = () => {
    const password = deviceConfig.enableSecret?.password;
    if (!password) return;

    const newConfigPart: Partial<PasswordsConfigShape> = {
      lineConsole: { password },
      lineVty: { ...(deviceConfig.lineVty || { from: 0, to: 15 }), password },
      lineAux: { password },
    };

    setDevice({
      ...device,
      config: { ...device.config, ...newConfigPart } as T["config"],
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium">Local Users</h3>
          <p className="text-muted-foreground text-xs">
            Manage local username and password credentials for device access.
          </p>
        </div>
        <div className="space-y-2">
          {(deviceConfig.localUsers ?? []).map((user, index) => (
            <div key={user.id} className="flex items-center gap-2">
              <Input
                label="Username"
                value={user.username}
                onChange={(e) => updateUser(index, "username", e.target.value)}
              />
              <Input
                label="Password"
                value={user.password ?? ""}
                onChange={(e) => updateUser(index, "password", e.target.value)}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeUser(user.id)}
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
          <Button
            className="w-fit"
            variant="outline"
            size="sm"
            onClick={addUser}
          >
            Add User
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <h3 className="font-medium">Enable Secret</h3>
          <p className="text-muted-foreground text-xs">
            Set the password for privileged (enable) mode.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Input
            label="Enable Secret"
            containerClassName="w-full"
            value={deviceConfig.enableSecret?.password ?? ""}
            onChange={(e) =>
              setPasswordForKey("enableSecret", { password: e.target.value })
            }
          />
          <Button variant="outline" size="sm" onClick={setAllPasswords}>
            Copy to all lines
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <h3 className="font-medium">Line Passwords</h3>
          <p className="text-muted-foreground text-xs">
            Set passwords for console, VTY, and auxiliary lines.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {linePasswordFields.map((fieldKey) => (
            <div key={fieldKey} className="flex flex-col gap-2">
              <Input
                label={camelToTitleCase(fieldKey)}
                value={deviceConfig[fieldKey]?.password ?? ""}
                onChange={(e) =>
                  setPasswordForKey(fieldKey, { password: e.target.value })
                }
              />
              {fieldKey === "lineVty" && (
                <div className="flex w-full gap-2 [&>*]:flex-1">
                  <Input
                    label="From"
                    type="number"
                    value={deviceConfig.lineVty?.from ?? ""}
                    onChange={(e) =>
                      setPasswordForKey("lineVty", {
                        from: Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    label="To"
                    type="number"
                    value={deviceConfig.lineVty?.to ?? ""}
                    onChange={(e) =>
                      setPasswordForKey("lineVty", {
                        to: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
