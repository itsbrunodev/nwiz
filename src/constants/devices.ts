export const ROUTERS = ["4331", "4321", "1941", "2901", "2911"] as const;

export type RouterModel = (typeof ROUTERS)[number];

export const SWITCHES = ["2960"] as const;

export type SwitchModel = (typeof SWITCHES)[number];
