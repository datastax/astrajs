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
const faker = require("faker");
const astraRest = require("./rest");
const ConfigParser = require("configparser");

// setup envars
require("dotenv").config();

describe("AstraJS REST", () => {
  describe("AstraJS REST Client", () => {
    it("should initialize an AstraDB REST Client", async () => {
      const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });
      assert.notStrictEqual(astraClient, null);
    });

    it("should not initialize without a baseurl", async () => {
      let astraClient = null;
      try {
        astraClient = await astraRest.createClient({
          astraDatabaseId: process.env.ASTRA_DB_ID,
          applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
        });
        assert.strictEqual(true, false);
      } catch (e) {
        assert.strictEqual(astraClient, null);
      }
    });

    it("should not initialize an AstraDB REST Client in a window", async () => {
      global.window = true;
      let astraClient = null;
      try {
        astraClient = await astraRest.createClient({
          astraDatabaseId: process.env.ASTRA_DB_ID,
          astraDatabaseRegion: process.env.ASTRA_DB_REGION,
          applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
        });
        assert.strictEqual(true, false);
      } catch (e) {
        assert.strictEqual(astraClient, null);
      }
      global.window = undefined;
    });

    it("should initialize with a token", async () => {
      const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        authToken: "token",
      });
      assert.notStrictEqual(astraClient, null);
    });

    it("should initialize with a token function", async () => {
      const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        getAuthToken: () => {
          return "token";
        },
      });
      assert.notStrictEqual(astraClient, null);
    });

    it("should not initialize without a token", async () => {
      let astraClient = null;
      try {
        astraClient = await astraRest.createClient({
          astraDatabaseId: process.env.ASTRA_DB_ID,
          astraDatabaseRegion: process.env.ASTRA_DB_REGION,
          getAuthToken: () => {},
        });
        assert.strictEqual(true, false);
      } catch (e) {
        assert.strictEqual(astraClient, null);
      }
    });
  });

  describe("AstraJS REST Client - ConfigFile", () => {
    it("should initialize an AstraDB REST Client", async () => {
      const config = new ConfigParser();
      config.addSection("default");
      ["ASTRA_DB_ID", "ASTRA_DB_APPLICATION_TOKEN", "ASTRA_DB_REGION"].forEach(
        (envvar) => {
          if (envvar in process.env) {
            config.set("default", envvar, process.env[envvar]);
          }
        }
      );
      config.write("/tmp/.astratestrc");

      const astraClient = await astraRest.createClient({
        configFile: "/tmp/.astratestrc",
      });

      assert.notStrictEqual(astraClient, null);
    });
  });

  describe("Stargate REST Client", () => {
    it("should initialize a Stargate REST Client", async () => {
      const stargateClient = await astraRest.createClient({
        authUrl: process.env.STARGATE_AUTH_URL,
        baseUrl: process.env.STARGATE_BASE_URL,
        username: process.env.STARGATE_USERNAME,
        password: process.env.STARGATE_PASSWORD,
      });

      assert.notStrictEqual(stargateClient, null);
    });
  });

  describe("Astra Document API", () => {
    // setup test context
    let astraClient = null;
    const namespace = process.env.ASTRA_DB_KEYSPACE;
    const collection = "rest";
    const documentId = faker.random.alphaNumeric(8);
    const collectionsPath = `/api/rest/v2/namespaces/${namespace}/collections/${collection}`;
    const documentPath = `${collectionsPath}/${documentId}`;

    before(async () => {
      astraClient = await astraRest.createClient({
        configFile: "/tmp/.astratestrc",
      });
    });

    it("should PUT a document", async () => {
      await astraClient.put(documentPath, {
        firstName: "Cliff",
        lastName: "Wicklow",
        emails: ["cliff.wicklow@example.com"],
      });

      const res = await astraClient.get(documentPath);
      assert.strictEqual(res.data.firstName, "Cliff");
      assert.strictEqual(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should throw an error", async () => {
      let res = null;
      try {
        res = await astraClient.put("?$[]", {
          firstName: "Cliff",
        });
        assert.strictEqual(true, false);
      } catch (e) {
        assert.strictEqual(res, null);
      }
    });

    it("should PUT to a subdocument", async () => {
      await astraClient.put(`${documentPath}/addresses`, {
        home: {
          city: "New York",
          state: "NY",
        },
      });

      const res = await astraClient.get(`${documentPath}/addresses`);
      assert.strictEqual(res.data.home.city, "New York");
    });

    it("should PATCH a document", async () => {
      await astraClient.patch(`${documentPath}/addresses`, {
        home: {
          city: "Buffalo",
        },
      });

      const res = await astraClient.get(documentPath);
      assert.strictEqual(res.data.addresses.home.city, "Buffalo");
    });

    it("should DELETE a document", async () => {
      const res = await astraClient.delete(documentPath);
      assert.strictEqual(res.status, 204);
    });
  });

  describe("Stargate Document API", () => {
    // setup test context
    let stargateClient = null;
    const namespace = process.env.ASTRA_DB_KEYSPACE;
    const collection = "rest";
    const documentId = faker.random.alphaNumeric(8);
    const collectionsPath = `/v2/namespaces/${namespace}/collections/${collection}`;
    const documentPath = `${collectionsPath}/${documentId}`;

    before(async () => {
      stargateClient = await astraRest.createClient({
        authUrl: process.env.STARGATE_AUTH_URL,
        baseUrl: process.env.STARGATE_BASE_URL,
        username: process.env.STARGATE_USERNAME,
        password: process.env.STARGATE_PASSWORD,
      });

      await stargateClient.post("/v2/schemas/namespaces", {
        name: namespace,
      });
    });

    after(async () => {
      stargateClient.delete(`/v2/schemas/namespaces/${namespace}`);
    });

    it("should PUT a document", async () => {
      await stargateClient.put(documentPath, {
        firstName: "Cliff",
        lastName: "Wicklow",
        emails: ["cliff.wicklow@example.com"],
      });

      const res = await stargateClient.get(documentPath);
      assert.strictEqual(res.data.firstName, "Cliff");
      assert.strictEqual(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should PUT to a subdocument", async () => {
      await stargateClient.put(`${documentPath}/addresses`, {
        home: {
          city: "New York",
          state: "NY",
        },
      });

      const res = await stargateClient.get(`${documentPath}/addresses`);
      assert.strictEqual(res.data.home.city, "New York");
    });

    it("should PATCH a document", async () => {
      await stargateClient.patch(`${documentPath}/addresses`, {
        home: {
          city: "Buffalo",
        },
      });

      const res = await stargateClient.get(documentPath);
      assert.strictEqual(res.data.addresses.home.city, "Buffalo");
    });

    it("should DELETE a document", async () => {
      const res = await stargateClient.delete(documentPath);
      assert.strictEqual(res.status, 204);
    });
  });
});
