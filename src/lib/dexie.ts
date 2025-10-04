import Dexie, { type Table } from "dexie";

interface NetworkCode {
  id: string;
  code: string;
}

class NwizDB extends Dexie {
  networkCodes!: Table<NetworkCode, string>; // <EntityType, KeyType>

  constructor() {
    super("nwiz");
    this.version(1).stores({
      networkCodes: "id", // Primary key
    });
  }
}

export const dexie = new NwizDB();
