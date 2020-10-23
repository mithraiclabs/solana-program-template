import * as semver from "semver";
import { PublicKey } from "@solana/web3.js";

import TestHelper from "./testHelper";
import { LOCALNET_URL } from "./testHelper";

describe("With established connection", () => {
  let testHelper = new TestHelper();
  beforeAll(async () => {
    await testHelper.establishConnection(LOCALNET_URL);
  });

  afterAll(() => {
    // testHelper.connection._rpcWebSocket.close();
  });

  test("A valid connection should be established", async () => {
    expect(testHelper.connection).not.toBe(null);
    const version = await testHelper.connection.getVersion();
    expect(semver.gte(version["solana-core"].split(" ")[0], "1.3.9")).toBe(
      true
    );
  });

  test("10 accounts should be created", async () => {
    await testHelper.createAccounts();
    expect(Array.isArray(testHelper.accounts)).toBe(true);
    expect(testHelper.accounts.length).toBe(10);
  });

  describe("deployContracts", () => {
    test("it should deploy the hello world contract to the chain", async () => {
      jest.setTimeout(30000);
      await testHelper.deployContracts();
      expect(testHelper.programIds.length > 0).toBe(true);
      await Promise.all(
        testHelper.programIds.map(async (programId) => {
          // check if the first program is actually deployed
          let accountInfo;
          try {
            accountInfo = await testHelper.connection.getAccountInfo(programId);
          } catch (error) {
            // swallow error
          } finally {
            // not sure the best way to test the successfully deploy, but can
            // assume if the account info returned successfully then the program
            // exists on chain
            expect(accountInfo).toBeDefined();
          }
        })
      );
    });
  });
});
