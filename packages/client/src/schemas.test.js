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
const { AstraSchemas } = require("./schemas");

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
    return await astraCollections.createClient({
      baseApiPath: "/v2/schemas",
      authUrl: process.env.STARGATE_AUTH_URL,
      baseUrl: process.env.STARGATE_BASE_URL,
      username: process.env.STARGATE_USERNAME,
      password: process.env.STARGATE_PASSWORD,
    });
  },
};

describe("AstraSchemas", () => {
  describe("AstraSchemas client", () => {
    it("should initialize an AstraSchemas client", async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });

      const schemasClient = new AstraSchemas(astraClient.restClient);
      assert.notStrictEqual(schemasClient, null);
    });
  });

  for (const testClient in testClients) {
    describe(`${testClient} - AstraSchemas API`, () => {
      // setup test context
      const keyspace = process.env.ASTRA_DB_KEYSPACE;
      let schemasClient = null;
      const table = {
        name: "users",
        columnDefinitions: [
          {
            name: "firstname",
            typeDefinition: "text",
          },
          {
            name: "lastname",
            typeDefinition: "text",
          },
          {
            name: "favorite_color",
            typeDefinition: "text",
          },
        ],
        primaryKey: {
          partitionKey: ["firstname"],
          clusteringKey: ["lastname"],
        },
      };
      const column = { name: "favorite_food", typeDefinition: "text" };
      const index = {
        column: "favorite_color",
        name: "favorite_color_idx",
        ifNotExists: true,
      };
      const udt = {
        name: "custom",
        ifNotExists: true,
        fields: [
          {
            name: "title",
            typeDefinition: "text",
          },
        ],
      };

      before(async () => {
        const astraClient = await testClients[testClient]();
        schemasClient = new AstraSchemas(astraClient.restClient);
      });
      if (testClient === "Stargate") {
        it("should create a keyspace", async () => {
          const res = await schemasClient.createKeyspace({
            name: keyspace,
          });
          assert.strictEqual(res.name, keyspace);
        });
      }

      it("should get all keyspaces", async () => {
        const res = await schemasClient.getKeyspaces();
        assert.notStrictEqual(res, []);
      });

      it("should get a keyspace", async () => {
        const res = await schemasClient.getKeyspaces();
        const keyspaceRes = await schemasClient.getKeyspace(res[0].name);
        assert.strictEqual(res[0].name, keyspaceRes.name);
      });

      it("should create a table", async () => {
        const res = await schemasClient.createTable(keyspace, table);
        assert.strictEqual(res.name, table.name);
      });

      it("should get all tables", async () => {
        const res = await schemasClient.getTables(keyspace);
        assert.notStrictEqual(res.length, 0);
      });

      it("should get a table", async () => {
        const res = await schemasClient.getTable(keyspace, table.name);
        assert.strictEqual(res.name, table.name);
      });

      it("should update a table", async () => {
        table.tableOptions = {
          defaultTimeToLive: 0,
        };
        const res = await schemasClient.updateTable(
          keyspace,
          table.name,
          table
        );
        assert.strictEqual(res.name, table.name);

        const tableDef = await schemasClient.getTable(keyspace, table.name);
        assert.strictEqual(tableDef.tableOptions.defaultTimeToLive, 0);
      });

      it("should create a column", async () => {
        const res = await schemasClient.createColumn(
          keyspace,
          table.name,
          column
        );
        assert.strictEqual(res.name, column.name);
      });

      it("should get columns", async () => {
        const res = await schemasClient.getColumns(keyspace, table.name);
        assert.strictEqual(res.length, 4);
      });

      it("should get a column", async () => {
        const res = await schemasClient.getColumn(
          keyspace,
          table.name,
          column.name
        );
        assert.strictEqual(res.name, column.name);
      });

      // it("should update a column", async () => {
      //   column.static = true;
      //   const res = await schemasClient.updateColumn(
      //     keyspace,
      //     table.name,
      //     column.name,
      //     column
      //   );
      //   assert.strictEqual(res.name, column.name);
      // });

      it("should delete a column", async () => {
        const res = await schemasClient.deleteColumn(
          keyspace,
          table.name,
          column.name
        );
        assert.strictEqual(res, "");
      });

      it("should create an index", async () => {
        const res = await schemasClient.createIndex(
          keyspace,
          table.name,
          index
        );
        assert.strictEqual(res.success, true);
      });

      it("should get all indexes", async () => {
        const res = await schemasClient.getIndexes(keyspace, table.name);
        assert.strictEqual(res[0].index_name, index.name);
      });

      it("should delete an index", async () => {
        const res = await schemasClient.deleteIndex(
          keyspace,
          table.name,
          index.name
        );
        assert.strictEqual(res, "");
      });

      it("should create a type", async () => {
        const res = await schemasClient.createType(keyspace, udt);
        assert.strictEqual(res.name, udt.name);
      });

      it("should get a type", async () => {
        const res = await schemasClient.getType(keyspace, udt.name);
        assert.strictEqual(res.name, udt.name);
      });

      it("should get all types", async () => {
        const res = await schemasClient.getTypes(keyspace);
        assert.strictEqual(res.length, 1);
      });

      it("should update a type", async () => {
        const res = await schemasClient.updateType(keyspace, {
          name: "custom",
          addFields: [
            {
              name: "description",
              typeDefinition: "text",
            },
          ],
        });
        assert.strictEqual(res, "");
      });

      it("should delete a type", async () => {
        const res = await schemasClient.deleteType(keyspace, udt.name);
        assert.strictEqual(res, "");
      });

      it("should delete a table", async () => {
        const res = await schemasClient.deleteTable(keyspace, table.name);
        assert.strictEqual(res, "");
      });

      if (testClient === "Stargate") {
        it("should delete a keyspace", async () => {
          const res = await schemasClient.deleteKeyspace(keyspace);
          assert.strictEqual(res, "");
        });
      }
    });
  }
});
