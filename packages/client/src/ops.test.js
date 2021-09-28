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
const { AstraOps } = require("./ops");
const astraCollections = require("@astrajs/collections");
const faker = require("faker");

// setup envars
require("dotenv").config();

describe("Astra Ops", () => {
  describe("Astra Ops API", () => {
    let astraOpsClient = null;

    before(async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });
      astraOpsClient = new AstraOps(astraClient.restClient);
    });

    it("should get databases", async () => {
      const res = await astraOpsClient.getDatabases();
      assert.notStrictEqual(res.data.databases, []);
    });
  });
});
