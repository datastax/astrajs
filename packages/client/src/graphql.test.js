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
const { AstraGraphQL, gql } = require("./graphql");
const faker = require("faker");

// setup envars
require("dotenv").config();

describe("AstraGraphQL", () => {
  describe("AstraGraphQL client", () => {
    it("should initialize an AstraGraphQL client", async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });

      const astraGqlClient = new AstraGraphQL(astraClient.restClient);
      assert.notStrictEqual(astraGqlClient, null);
    });
  });

  describe("AstraGraphQL API", () => {
    // setup test context
    const keyspace = process.env.ASTRA_DB_KEYSPACE;
    const documentId = faker.random.alphaNumeric(8);
    let astraGqlClient = null;

    before(async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });
      astraGqlClient = new AstraGraphQL(astraClient.restClient);
    });

    it("should query the schema", async () => {
      const schemaClient = astraGqlClient.getSchema();
      const res = await schemaClient.query({
        query: gql`
          {
            keyspaces {
              name
            }
          }
        `,
      });
      assert.notStrictEqual(res.data.keyspaces, []);
    });

    it("should query a namespace", async () => {
      const keyspaceClient = astraGqlClient.getKeyspace(keyspace);
      const res = await keyspaceClient.query({
        query: gql`
          {
            test {
              values {
                leaf
              }
            }
          }
        `,
      });
      assert.notStrictEqual(res.data.test.values, []);
    });
  });
});
