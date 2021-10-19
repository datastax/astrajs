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
const astraCollections = require("./collections");
const faker = require("faker");

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
    const stargateClient = await astraCollections.createClient({
      baseApiPath: "/v2/namespaces",
      authUrl: process.env.STARGATE_AUTH_URL,
      baseUrl: process.env.STARGATE_BASE_URL,
      username: process.env.STARGATE_USERNAME,
      password: process.env.STARGATE_PASSWORD,
    });

    await stargateClient.restClient.post("/v2/schemas/namespaces", {
      name: process.env.ASTRA_DB_KEYSPACE,
    });

    return stargateClient;
  },
};

describe("AstraJS - Collections", () => {
  describe("Astra DB collections client", () => {
    it("should initialize an Astra collections client", async () => {
      const astraClient = await astraCollections.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      });
      assert.notStrictEqual(astraClient, null);
    });
  });

  describe("Stargate collections Client", () => {
    it("should initialize a Stargate collections Client", async () => {
      const stargateClient = await astraCollections.createClient({
        authUrl: process.env.STARGATE_AUTH_URL,
        baseUrl: process.env.STARGATE_BASE_URL,
        username: process.env.STARGATE_USERNAME,
        password: process.env.STARGATE_PASSWORD,
      });

      assert.notStrictEqual(stargateClient, null);
    });
  });

  for (const testClient in testClients) {
    describe(`${testClient} collections API`, () => {
      // setup test context
      let testNamespace = null;
      let testCollection = null;
      let testSchemaCollection = null;
      const namespace = process.env.ASTRA_DB_KEYSPACE;
      const collection = `test_${faker.random.alphaNumeric(8)}`;
      const schemaCollection = `schema_test_${faker.random.alphaNumeric(8)}`;
      const documentId = faker.random.alphaNumeric(8);
      const schema = {
        $id: "https://example.com/person.schema.json",
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "Person",
        type: "object",
        properties: {
          firstName: {
            type: "string",
            description: "The persons first name.",
          },
          lastName: {
            type: "string",
            description: "The persons last name.",
          },
          age: {
            description:
              "Age in years which must be equal to or greater than zero.",
            type: "integer",
            minimum: 0,
          },
        },
      };

      before(async () => {
        const astraClient = await testClients[testClient]();
        testNamespace = astraClient.namespace(namespace);
        testCollection = astraClient
          .namespace(namespace)
          .collection(collection);
        testSchemaCollection = astraClient
          .namespace(namespace)
          .collection(schemaCollection);
      });

      after(async () => {
        testNamespace.deleteCollection(collection);
        testNamespace.deleteCollection(schemaCollection);
      });

      it("should create a collection in a namespace", async () => {
        const res = await testNamespace.createCollection(collection);
        assert.strictEqual(res.data, undefined);
        const schemaRes = await testNamespace.createCollection(
          schemaCollection
        );
        assert.strictEqual(schemaRes.data, undefined);
      });

      it("should list collections in a namespace", async () => {
        const res = await testNamespace.getCollections();
        assert.notStrictEqual(res.length, 0);
      });

      it("should create a collection with schema", async () => {
        const res = await testSchemaCollection.createSchema(schema);
        assert.strictEqual(res.schema.$id, schema.$id);
      });

      it("should udpate a collection's schema", async () => {
        const res = await testSchemaCollection.updateSchema(schema);
        assert.strictEqual(res.schema.$id, schema.$id);
      });

      // TODO: uncomment when this works
      // it("should get a collections schema", async () => {
      //   const res = await testSchemaCollection.getSchema();
      //   assert.strictEqual(res.schema.$id, schema.$id);
      // });

      it("should create a document", async () => {
        await testCollection.create(documentId, {
          firstName: "Cliff",
          lastName: "Wicklow",
        });

        const document = await testCollection.get(documentId);
        assert.strictEqual(document.firstName, "Cliff");
      });

      it("should create multiple documents", async () => {
        const documentId1 = faker.random.alphaNumeric(8);
        const documentId2 = faker.random.alphaNumeric(8);
        const res = await testCollection.batch(
          [
            {
              _id: documentId1,
              firstName: "Dang",
              lastName: "Son",
            },
            {
              _id: documentId2,
              firstName: "Yep",
              lastName: "Boss",
            },
          ],
          "_id"
        );

        const document1 = await testCollection.get(documentId1);
        assert.strictEqual(document1.firstName, "Dang");

        const document2 = await testCollection.get(documentId2);
        assert.strictEqual(document2.firstName, "Yep");
      });

      it("should create a subdocument", async () => {
        await testCollection.create(`${documentId}/addresses`, {
          home: {
            city: "New York",
            state: "NY",
          },
        });

        const document = await testCollection.get(`${documentId}/addresses`);
        assert.strictEqual(document.home.state, "NY");
        assert.strictEqual(document.home.city, "New York");
      });

      it("should create a document without an ID", async () => {
        const res = await testCollection.create({
          firstName: "New",
          lastName: "Guy",
        });
        const document = await testCollection.get(res.documentId);
        assert.strictEqual(document.firstName, "New");
      });

      it("should udpate a document", async () => {
        await testCollection.update(documentId, {
          firstName: "Dang",
        });

        const document = await testCollection.get(documentId);
        assert.strictEqual(document.firstName, "Dang");
      });

      it("should udpate a subdocument", async () => {
        await testCollection.update(`${documentId}/addresses/home`, {
          city: "Buffalo",
        });

        const document = await testCollection.get(
          `${documentId}/addresses/home`
        );
        assert.strictEqual(document.city, "Buffalo");
      });

      it("should replace a subdocument", async () => {
        await testCollection.replace(`${documentId}/addresses`, {
          work: {
            city: "New York",
            state: "NY",
          },
        });

        const document = await testCollection.get(
          `${documentId}/addresses/work`
        );
        assert.strictEqual(document.state, "NY");
        const document2 = await testCollection.get(
          `${documentId}/addresses/home`
        );
        assert.strictEqual(document2, null);
      });

      it("should delete a subdocument", async () => {
        const res = await testCollection.delete(`${documentId}/addresses`);
        assert.strictEqual(res.documentId, `${documentId}/addresses`);
        const document = await testCollection.get(`${documentId}/addresses`);
        assert.strictEqual(document, null);
      });

      it("should delete a document", async () => {
        const res = await testCollection.delete(documentId);
        assert.strictEqual(res.documentId, documentId);
        const document = await testCollection.get(documentId);
        assert.strictEqual(document, null);
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

        const res = await testCollection.find({
          firstName: { $eq: `Cliff-${userId}` },
        });
        const documents = res.data;
        assert.strictEqual(Object.keys(documents).length, 2);
        assert.strictEqual(documents[userId].lastName, "Wicklow");
        assert.strictEqual(documents[userId2].lastName, "Danger");

        const res2 = await testCollection.find(
          {
            firstName: { $eq: `Cliff-${userId}` },
          },
          { "page-size": 1 }
        );
        assert.notStrictEqual(res2.pageState, undefined);
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
        assert.strictEqual(document.firstName, `Cliff-${userId}`);

        const document2 = await testCollection.findOne({
          firstName: { $eq: `Cliff-wew` },
        });
        assert.strictEqual(document2, null);
      });

      it("should use document functions", async () => {
        const userId = faker.random.alphaNumeric(8);
        await testCollection.create(userId, {
          firstName: `Cliff-${userId}`,
          lastName: "Wicklow",
          roles: ["admin", "user"],
        });

        const popRes = await testCollection.pop(`${userId}/roles`);
        assert.strictEqual(popRes, "user");

        const doc = await testCollection.get(userId);
        assert.strictEqual(doc.roles.length, 1);

        await testCollection.push(`${userId}/roles`, "user");
        const doc2 = await testCollection.get(userId);
        assert.strictEqual(doc2.roles.length, 2);
      });
    });
  }
});
