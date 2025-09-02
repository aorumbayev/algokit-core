import * as path from "path";
import { Transaction } from "..";

const jsonString = await Bun.file(path.join(__dirname, "../../../../crates/algokit_transact_ffi/test_data.json")).text();

const NUMERIC_FIELDS = [
  "fee",
  "amount",
  "firstValid",
  "lastValid",
  "assetId",
  "total",
  "appId",
  "voteFirst",
  "voteLast",
  "voteKeyDilution",
];

const defaultReviver = (key: string, value: unknown) => {
  if (Array.isArray(value) && value.every((n) => typeof n === "number")) {
    // assetReferences and appReferences should be arrays of BigInts
    if (key === "assetReferences" || key === "appReferences") {
      return value.map((n) => BigInt(n));
    }
    return new Uint8Array(value);
  }

  if (typeof value === "number" && NUMERIC_FIELDS.includes(key)) {
    return BigInt(value);
  }

  // Handle assetFreeze objects - ensure frozen field defaults to false if missing
  // The Rust side uses #[serde(default)] on the frozen field, which means:
  // 1. When serializing, false values may be omitted from JSON
  // 2. When deserializing, missing values default to false
  // The TypeScript WASM bindings expect the field to always be present as a boolean
  if (key === "assetFreeze" && typeof value === "object" && value !== null) {
    const assetFreeze = value as any;
    if (assetFreeze.frozen === undefined) {
      assetFreeze.frozen = false; // Match WASM bindings' expectations
    }
    return assetFreeze;
  }

  return value;
};

export const parseJson = <T = any>(json: string, reviver: (_: string, value: unknown) => unknown = defaultReviver) => {
  return JSON.parse(json, reviver) as T;
};

export type TransactionTestData = {
  transaction: Transaction;
  id: string;
  idRaw: Uint8Array;
  unsignedBytes: Uint8Array;
  signedBytes: Uint8Array;
  signingPrivateKey: Uint8Array;
  rekeyedSenderAuthAddress: string;
  rekeyedSenderSignedBytes: Uint8Array;
  multisigAddresses: [string, string];
  multisigSignedBytes: Uint8Array;
};

export const testData =
  parseJson<
    Record<
      | "simplePayment"
      | "optInAssetTransfer"
      | "assetCreate"
      | "assetDestroy"
      | "assetConfig"
      | "appCall"
      | "appCreate"
      | "appUpdate"
      | "appDelete"
      | "onlineKeyRegistration"
      | "offlineKeyRegistration"
      | "nonParticipationKeyRegistration"
      | "assetFreeze"
      | "assetUnfreeze",
      TransactionTestData
    >
  >(jsonString);
