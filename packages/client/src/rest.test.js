// Copyright DataStax, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const assert = require("assert");
const astraCollections = require("@astrajs/collections");
const { AstraRest } = require("./rest");
const faker = require("faker");

// setup envars
require("dotenv").config();

const testClients = {
  "Astra DB": async () => {
    return await astraCollections.createClient({
      astraDatabaseId: process.env.ASTRA_DB_ID,
      astraDatabaseRegion: process.env.ASTRA_DB_REGION,
      applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });
  },
  Stargate: async () => {
    const stargateClient = await astraCollections.createClient({
      baseApiPath: "/v2/keyspaces",
      authUrl: process.env.STARGATE_AUTH_URL,
      baseUrl: process.env.STARGATE_BASE_URL,
      username: process.env.STARGATE_USERNAME,
      password: process.env.STARGATE_PASSWORD,
    });

    await stargateClient.restClient.post("/v2/schemas/keyspaces", {
      name: process.env.ASTRA_DB_KEYSPACE,
    });

    return stargateClient;
  },
};

describe("AstraRest", () => {
  describe("AstraRest client", () => {
    it("should initialize an AstraRest client", async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });

      const restClient = new AstraRest(astraClient.restClient);
      assert.notStrictEqual(restClient, null);
    });
  });

  for (const testClient in testClients) {
    describe(`${testClient} - AstraRest API`, () => {
      // setup test context
      const keyspace = process.env.ASTRA_DB_KEYSPACE;
      const prefix = testClient === "Stargate" ? "" : "/api/rest";
      let restClient = null;
      let astraClient = null;
      const table = {
        name: `users_${faker.random.alphaNumeric(8)}`,
        columnDefinitions: [
          {
            name: "firstname",
            typeDefinition: "text",
          },
          {
            name: "lastname",
            typeDefinition: "text",
          },
        ],
        primaryKey: {
          partitionKey: ["firstname"],
          clusteringKey: ["lastname"],
        },
      };
      const row = {
        firstname: "Cliff",
        lastname: "Wicklow",
      };

      before(async () => {
        astraClient = await testClients[testClient]();
        restClient = new AstraRest(astraClient.restClient);
        await astraClient.restClient.post(
          `${prefix}/v2/schemas/keyspaces/${keyspace}/tables`,
          table
        );
      });

      after(async () => {
        await astraClient.restClient.delete(
          `${prefix}/v2/schemas/keyspaces/${keyspace}/tables/${table.name}`
        );
      });

      it("should add a row", async () => {
        const res = await restClient.addRow(keyspace, table.name, row);
        assert.strictEqual(res.firstname, "Cliff");
        await restClient.addRow(keyspace, table.name, {
          firstname: row.firstname,
          lastname: "Boss",
        });
        await restClient.addRow(keyspace, table.name, {
          firstname: row.firstname,
          lastname: "Dang",
        });
      });

      it("should get rows", async () => {
        const res = await restClient.getRows(
          keyspace,
          table.name,
          `${row.firstname}/${row.lastname}`
        );
        assert.strictEqual(res[0].firstname, "Cliff");
        const res2 = await restClient.getRows(
          keyspace,
          table.name,
          row.firstname
        );
        assert.strictEqual(res2.length, 3);
      });

      it("should search a table", async () => {
        const res = await restClient.searchTable(keyspace, table.name, {
          firstname: { $eq: "Cliff" },
        });
        assert.strictEqual(res[0].firstname, "Cliff");
        assert.strictEqual(res.length, 3);
      });
    });
  }
});
