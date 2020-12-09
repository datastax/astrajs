"use strict";

const assert = require("assert");
const axios = require("axios");
const faker = require("faker");
const astraRest = require("./rest");
const _ = require("lodash");

// setup envars
require("dotenv").config();

const stargateAuthUrl = "http://localhost:8081/v1/auth";
const stargateBaseUrl = "http://localhost:8082";
/* start stargate:
docker run --name stargate \
  -p 8080:8080 -p 8081:8081 \
  -p 8082:8082 -p 127.0.0.1:9042:9042 \
  -e CLUSTER_NAME=stargate \
  -e CLUSTER_VERSION=6.8 \
  -e DEVELOPER_MODE=true \
  -e DSE=1 \
  stargateio/stargate-dse-68:v1.0.0
*/

describe("AstraJS REST", () => {
  describe("AstraJS REST Client", () => {
    it("should initialize an AstraDB REST Client", async () => {
      const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
      });

      assert.notEqual(astraClient, null);
    });
  });

  describe("Stargate REST Client", () => {
    it("should initialize a Stargate REST Client", async () => {
      const stargateClient = await astraRest.createClient({
        authUrl: stargateAuthUrl,
        baseUrl: stargateBaseUrl,
        username: "cassandra",
        password: "cassandra",
      });

      assert.notEqual(stargateClient, null);
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
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
      });
    });

    it("should PUT a document", async () => {
      await astraClient.put(documentPath, {
        firstName: "Cliff",
        lastName: "Wicklow",
        emails: ["cliff.wicklow@example.com"],
      });

      const res = await astraClient.get(documentPath);
      assert.equal(res.data.firstName, "Cliff");
      assert.equal(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should PUT to a subdocument", async () => {
      await astraClient.put(`${documentPath}/addresses`, {
        home: {
          city: "New York",
          state: "NY",
        },
      });

      const res = await astraClient.get(`${documentPath}/addresses`);
      assert.equal(res.data.home.city, "New York");
    });

    it("should PATCH a document", async () => {
      await astraClient.patch(`${documentPath}/addresses`, {
        home: {
          city: "Buffalo",
        },
      });

      const res = await astraClient.get(documentPath);
      assert.equal(res.data.addresses.home.city, "Buffalo");
    });

    it("should DELETE a document", async () => {
      const res = await astraClient.delete(documentPath);
      assert.equal(res.status, 204);
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
        authUrl: stargateAuthUrl,
        baseUrl: stargateBaseUrl,
        username: "cassandra",
        password: "cassandra",
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
      assert.equal(res.data.firstName, "Cliff");
      assert.equal(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should PUT to a subdocument", async () => {
      await stargateClient.put(`${documentPath}/addresses`, {
        home: {
          city: "New York",
          state: "NY",
        },
      });

      const res = await stargateClient.get(`${documentPath}/addresses`);
      assert.equal(res.data.home.city, "New York");
    });

    it("should PATCH a document", async () => {
      await stargateClient.patch(`${documentPath}/addresses`, {
        home: {
          city: "Buffalo",
        },
      });

      const res = await stargateClient.get(documentPath);
      assert.equal(res.data.addresses.home.city, "Buffalo");
    });

    it("should DELETE a document", async () => {
      const res = await stargateClient.delete(documentPath);
      assert.equal(res.status, 204);
    });
  });
});
