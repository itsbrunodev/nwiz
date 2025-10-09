import { atomWithStorage } from "jotai/utils";

export const welcomeStore = atomWithStorage<boolean>(
  "welcome-acknowledged",
  false,
);
