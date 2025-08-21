import { test, describe } from "bun:test";
import { testData } from "./common";
import {
  assertAssignFee,
  assertDecodeWithoutPrefix,
  assertDecodeWithPrefix,
  assertEncode,
  assertEncodedTransactionType,
  assertEncodeWithAuthAddress,
  assertEncodeWithSignature,
  assertExample,
  assertTransactionId,
  assertMultisigExample,
} from "./transaction_asserts";

const txnTestData = Object.entries({
  ["app call"]: testData.appCall,
  ["app create"]: testData.appCreate,
  ["app update"]: testData.appUpdate,
  ["app delete"]: testData.appDelete,
});

describe("App Call", () => {
  // Polytest Suite: App Call

  describe("Transaction Tests", () => {
    // Polytest Group: Transaction Tests

    for (const [label, testData] of txnTestData) {
      test("example", async () => {
        await assertExample(label, testData);
      });

      test("multisig example", async () => {
        await assertMultisigExample(label, testData);
      });

      test("get transaction id", () => {
        assertTransactionId(label, testData);
      });

      test("assign fee", () => {
        assertAssignFee(label, testData);
      });

      test("get encoded transaction type", () => {
        assertEncodedTransactionType(label, testData);
      });

      test("decode without prefix", () => {
        assertDecodeWithoutPrefix(label, testData);
      });

      test("decode with prefix", () => {
        assertDecodeWithPrefix(label, testData);
      });

      test("encode with auth address", async () => {
        await assertEncodeWithAuthAddress(label, testData);
      });

      test("encode with signature", () => {
        assertEncodeWithSignature(label, testData);
      });

      test("encode", () => {
        assertEncode(label, testData);
      });
    }
  });
});
