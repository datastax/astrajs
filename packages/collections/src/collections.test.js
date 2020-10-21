"use strict";

const assert = require("assert");
const astraCollections = require("./collections");
const faker = require("faker");

// setup envars
require("dotenv").config();

describe("AstraJS", () => {
  describe("Astra collections client", () => {
    it("should initialize an Astra collections client", async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
      });

      assert.notEqual(astraClient, null);
    });
  });

  describe("Astra collections API", () => {
    // setup test context
    let testCollection = null;
    const namespace = process.env.ASTRA_DB_KEYSPACE;
    const collection = "test";
    const documentId = faker.random.alphaNumeric(8);

    before(async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
      });
      testCollection = astraClient.namespace(namespace).collection(collection);
    });

    it("should create a document", async () => {
      await testCollection.create(documentId, {
        firstName: "Cliff",
        lastName: "Wicklow",
      });

      const document = await testCollection.get(documentId);
      assert.equal(document.firstName, "Cliff");
    });

    it("should create a subdocument", async () => {
      await testCollection.create(`${documentId}/addresses`, {
        home: {
          city: "New York",
          state: "NY",
        },
      });

      const document = await testCollection.get(`${documentId}/addresses`);
      assert.equal(document.home.state, "NY");
    });

    it("should udpate a document", async () => {
      await testCollection.update(documentId, {
        firstName: "Dang",
      });

      const document = await testCollection.get(documentId);
      assert.equal(document.firstName, "Dang");
    });

    it("should udpate a subdocument", async () => {
      await testCollection.update(`${documentId}/addresses/home`, {
        city: "Buffalo",
      });

      const document = await testCollection.get(`${documentId}/addresses/home`);
      assert.equal(document.city, "Buffalo");
    });

    it("should replace a subdocument", async () => {
      await testCollection.replace(`${documentId}/addresses`, {
        work: {
          city: "New York",
          state: "NY",
        },
      });

      const document = await testCollection.get(`${documentId}/addresses/work`);
      assert.equal(document.state, "NY");
      const document2 = await testCollection.get(
        `${documentId}/addresses/home`
      );
      assert.equal(document2, null);
    });

    it("should delete a subdocument", async () => {
      await testCollection.delete(`${documentId}/addresses`);
      const document = await testCollection.get(`${documentId}/addresses`);
      assert.equal(document, null);
    });

    it("should delete a document", async () => {
      await testCollection.delete(documentId);
      const document = await testCollection.get(documentId);
      assert.equal(document, null);
    });

    it("should find documents", async () => {
      const userId = faker.random.alphaNumeric(8);
      await testCollection.create(userId, {
        firstName: `Cliff-${userId}`,
        lastName: "Wicklow",
      });

      const userId2 = faker.random.alphaNumeric(8);
      await testCollection.create(userId2, {
        firstName: `Cliff-${userId}`,
        lastName: "Danger",
      });

      const documents = await testCollection.find({
        firstName: { $eq: `Cliff-${userId}` },
      });
      assert.equal(Object.keys(documents).length, 2);
      assert.equal(documents[userId].lastName, "Wicklow");
      assert.equal(documents[userId2].lastName, "Danger");
    });

    it("should find a single document", async () => {
      const userId = faker.random.alphaNumeric(8);
      await testCollection.create(userId, {
        firstName: `Cliff-${userId}`,
        lastName: "Wicklow",
      });

      const userId2 = faker.random.alphaNumeric(8);
      await testCollection.create(userId2, {
        firstName: `Cliff-${userId}`,
        lastName: "Danger",
      });

      const document = await testCollection.findOne({
        firstName: { $eq: `Cliff-${userId}` },
      });
      assert.equal(document.lastName, "Wicklow");
    });
  });
});
