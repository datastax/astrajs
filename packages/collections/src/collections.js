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
    this.restClient = restClient;
    this.namespaceName = namespaceName;
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
    const response = await this.restClient.get(fullPath, options);
    if (response.status === 200) {
      return response.data;
    }
    return null;
  }

  async _put(path, document) {
    const response = await this.restClient.put(
      `${this.basePath}/${path}`,
      document
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  }

  async get(path) {
    return await this._get(path);
  }

  async find(query, options) {
    return await this._get(null, {
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
    const response = await this.restClient.post(`${this.basePath}`, path);
    if (response.status === 201) {
      return response.data;
    }
    return null;
  }

  async update(path, document) {
    const response = await this.restClient.patch(
      `${this.basePath}/${path}`,
      document
    );
    if (response.status === 200) {
      return response.data;
    }
    return null;
  }

  async replace(path, document) {
    return this._put(path, document);
  }

  async delete(path) {
    const response = await this.restClient.delete(`${this.basePath}/${path}`);
    if (response.status === 204) {
      return response.data;
    }
    return null;
  }
}

const createClient = async (options) => {
  const restClient = await astraRest.createClient(options);
  return new AstraDocumentClient(restClient, options.apiBasePath);
};

module.exports = { createClient };
