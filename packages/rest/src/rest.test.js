"use strict";

const assert = require("assert");
const axios = require("axios");
const faker = require("faker");
const astraRest = require("./rest");
const _ = require("lodash");
const ConfigParser = require("configparser");
const fs = require("fs");

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
      assert.notEqual(astraClient, null);
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

      assert.notEqual(astraClient, null);
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
