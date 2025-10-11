export const ROUTERS = [
  "ISR4331",
  "ISR4321",
  "1941",
  "2901",
  "2911",
  "Router-PT",
  "1841",
  "2620XM",
  "2621XM",
  "2811",
] as const;

export type RouterModel = (typeof ROUTERS)[number];

export const SWITCHES = [
  "2960-24TT",
  "Switch-PT",
  "3560-24PS",
  "3650-24PS",
  "IE-2000",
  "2950-24",
  "2950T-24",
] as const;

export type SwitchModel = (typeof SWITCHES)[number];
