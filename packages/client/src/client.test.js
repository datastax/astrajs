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
const { createAstraClient } = require("./client");
const faker = require("faker");

// setup envars
require("dotenv").config();

describe("AstraClient", () => {
  describe("AstraClient client", () => {
    it("should initialize an AstraClient client", async () => {
      const astraClient = await createAstraClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });

      assert.notStrictEqual(astraClient, null);
      assert.notStrictEqual(astraClient.collections, null);
      assert.notStrictEqual(astraClient.graphql, null);
      assert.notStrictEqual(astraClient._restClient, null);
    });
  });

  describe("AstraClient API", () => {
    // setup test context
    const keyspace = process.env.ASTRA_DB_KEYSPACE;
    const documentId = faker.random.alphaNumeric(8);
    let astraClient = null;

    before(async () => {
      astraClient = await createAstraClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });
    });

    it("should have sub connections", async () => {
      assert.notStrictEqual(astraClient.collections, null);
      assert.notStrictEqual(astraClient.graphql, null);
      assert.notStrictEqual(astraClient._restClient, null);
    });
  });
});
