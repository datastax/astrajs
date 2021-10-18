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

const astraRest = require("@astrajs/rest");
const _ = require("lodash");

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_BASE_PATH = "/api/rest/v2/namespaces";

class AstraDocumentClient {
  constructor(restClient) {
    this.restClient = restClient;
  }

  namespace(namespaceName) {
    return new AstraNamespace(this.restClient, namespaceName);
  }
}

class AstraNamespace {
  constructor(restClient, namespaceName) {
    const basePath = restClient.baseApiPath
      ? restClient.baseApiPath
      : DEFAULT_BASE_PATH;
    this.restClient = restClient;
    this.namespaceName = namespaceName;
    this.basePath = `${basePath}/${namespaceName}`;
  }

  async getCollections() {
    const res = await this.restClient.get(`${this.basePath}/collections`);
    return res.data;
  }

  async createCollection(collectionName) {
    const res = await this.restClient.post(`${this.basePath}/collections`, {
      name: collectionName,
    });
    return res.data;
  }

  async deleteCollection(collectionName) {
    const res = await this.restClient.delete(
      `${this.basePath}/collections/${collectionName}`
    );
    return res.data;
  }

  collection(collectionName) {
    return new AstraCollection(
      this.restClient,
      this.namespaceName,
      collectionName
    );
  }
}

class AstraCollection {
  constructor(restClient, namespaceName, collectionName) {
    const basePath = restClient.baseApiPath
      ? restClient.baseApiPath
      : DEFAULT_BASE_PATH;
    this.restClient = restClient;
    this.namespaceName = namespaceName;
    this.collectionName = collectionName;
    this.basePath = `${basePath}/${namespaceName}/collections/${collectionName}`;
  }

  async _get(path, options) {
    const fullPath = path ? `${this.basePath}/${path}` : this.basePath;
    try {
      const response = await this.restClient.get(fullPath, options);
      if (response.status === 200) {
        return response.data;
      }
    } catch (e) {
      return null;
    }
  }

  async _put(path, document) {
    const res = await this.restClient.put(`${this.basePath}/${path}`, document);
    return res.data;
  }

  async upgrade() {
    const res = await this.restClient.post(`${this.basePath}/upgrade`);
    return res.data;
  }

  async getSchema() {
    return await this._get("json-schema");
  }

  async createSchema(schema) {
    return await this._put("json-schema", schema);
  }

  async updateSchema(schema) {
    return await this._put("json-schema", schema);
  }

  async get(path) {
    return await this._get(path);
  }

  async find(query, options) {
    return await this.restClient.get(this.basePath, {
      params: {
        where: query,
        "page-size": DEFAULT_PAGE_SIZE,
        ...options,
      },
    });
  }

  async findOne(query, options) {
    const response = await this._get(null, {
      params: {
        where: query,
        "page-size": 1,
        ...options,
      },
    });
    if (response !== null) {
      const documentKeys = Object.keys(response);
      if (documentKeys.length) {
        return response[documentKeys[0]];
      }
    }
    return null;
  }

  async create(path, document) {
    if (!_.isPlainObject(path)) {
      return this._put(path, document);
    }
    const res = await this.restClient.post(`${this.basePath}`, path);
    return res.data;
  }

  async batch(documents, idPath) {
    idPath = idPath ? idPath : "documentId";
    const res = await this.restClient.post(
      `${this.basePath}/batch`,
      documents,
      { params: { "id-path": idPath } }
    );
    return res.data;
  }

  async update(path, document) {
    const res = await this.restClient.patch(
      `${this.basePath}/${path}`,
      document
    );
    return res.data;
  }

  async replace(path, document) {
    return this._put(path, document);
  }

  async delete(path) {
    await this.restClient.delete(`${this.basePath}/${path}`);
    return { documentId: path, deleted: true };
  }

  async push(path, value) {
    const res = await this.restClient.post(
      `${this.basePath}/${path}/function`,
      {
        operation: "$push",
        value: value,
      }
    );
    return res.data;
  }
  async pop(path) {
    const res = await this.restClient.post(
      `${this.basePath}/${path}/function`,
      {
        operation: "$pop",
      }
    );
    return res.data;
  }
}

const createClient = async (options) => {
  const restClient = await astraRest.createClient(options);
  return new AstraDocumentClient(restClient, options.apiBasePath);
};

module.exports = { createClient };
