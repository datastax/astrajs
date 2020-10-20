"use strict";

const assert = require("assert");
const faker = require("faker");
const astraRest = require("./rest");
const _ = require("lodash");

// setup envars
require("dotenv").config();

describe("AstraJS", () => {
  describe("Astra REST Client", () => {
    it("should initialize an Astra REST Client", async () => {
      const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
      });

      assert.notEqual(astraClient, null);
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
});
