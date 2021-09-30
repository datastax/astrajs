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
      assert.notStrictEqual(res, []);
    });

    it("should get a database", async () => {
      const res = await astraOpsClient.getDatabase(process.env.ASTRA_DB_ID);
      assert.strictEqual(res.id, process.env.ASTRA_DB_ID);
    });

    it("should get a secure bundle", async () => {
      const res = await astraOpsClient.getSecureBundle(process.env.ASTRA_DB_ID);
      assert.notStrictEqual(res.downloadURL, "");
    });

    it("should get datacenters", async () => {
      const res = await astraOpsClient.getDatacenters(process.env.ASTRA_DB_ID);
      assert.notStrictEqual(res.length, 0);
    });

    it("should get a private link", async () => {
      const res = await astraOpsClient.getPrivateLink(process.env.ASTRA_DB_ID);
      assert.strictEqual(res.clusterID, process.env.ASTRA_DB_ID);
    });

    it("should get available classic regions", async () => {
      const res = await astraOpsClient.getAvailableClassicRegions();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get available regions", async () => {
      const res = await astraOpsClient.getAvailableRegions();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get roles", async () => {
      const res = await astraOpsClient.getRoles();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get users", async () => {
      const res = await astraOpsClient.getUsers();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get clients", async () => {
      const res = await astraOpsClient.getClients();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get an organization", async () => {
      const res = await astraOpsClient.getOrganization();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get an access list template", async () => {
      const res = await astraOpsClient.getAccessListTemplate();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get all private links", async () => {
      const res = await astraOpsClient.getPrivateLinks();
      assert.strictEqual(res.length, 0);
    });

    it("should get all streaming providers", async () => {
      const res = await astraOpsClient.getStreamingProviders();
      assert.notStrictEqual(res.length, 0);
    });

    it("should get all streaming tenants", async () => {
      const res = await astraOpsClient.getStreamingTenants();
      assert.notStrictEqual(res.length, 0);
    });
  });
});
