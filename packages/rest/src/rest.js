"use strict";

const axios = require("axios");
const _ = require("lodash");

const REQUESTED_WITH = "@astrajs/rest";
const AUTH_PATH = "/api/rest/v1/auth";
const DEFAULT_METHOD = "get";
const DEFAULT_TIMEOUT = 10000;
const HTTP_METHODS = {
  get: "GET",
  post: "POST",
  put: "PUT",
  patch: "PATCH",
  delete: "DELETE",
};

const axiosRequest = async (options) => {
  try {
    const response = await axios({
      url: options.url,
      data: options.data,
      params: options.params,
      method: options.method ?? DEFAULT_METHOD,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      headers: {
        Accepts: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": REQUESTED_WITH,
        "X-Cassandra-Token": options.authToken ?? "",
      },
    });
    return {
      status: response.status,
      data: response.data.data ?? response.data,
    };
  } catch (error) {
    throw new Error("Request Failed: " + error.message);
  }
};

class Client {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.autoReconnect = options.autoReconnect ?? true;
    this.getAuthToken = options.getAuthToken;
    this.setAuthToken = options.setAuthToken;
    this.username = options.username;
    this.password = options.password;
  }

  async _getAuthToken() {
    if (this.getAuthToken) {
      return await this.getAuthToken(authToken);
    }
    if (this.authToken) {
      return this.authToken;
    }
    await this.connect();
    return this.authToken;
  }

  async _setAuthToken(authToken) {
    if (this.setAuthToken) {
      await this.setAuthToken(authToken);
    }
    this.authToken = authToken;
  }

  async connect() {
    const response = await axiosRequest({
      url: this.baseUrl + AUTH_PATH,
      method: HTTP_METHODS.post,
      data: {
        username: this.username,
        password: this.password,
      },
    });
    this._setAuthToken(response.data.authToken);
  }

  async request(options) {
    const response = await axiosRequest({
      ...options,
      authToken: this.authToken,
    });
    if (response.status === 401 && this.autoReconnect) {
      console.log("@astrajs/rest: reconnecting");
      await this.connect();
      return await axiosRequest(options);
    }
    return response;
  }

  async get(path, data, options) {
    return await this.request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.get,
      data,
      ...options,
    });
  }

  async post(path, data, options) {
    return await this.request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.post,
      data,
      ...options,
    });
  }

  async put(path, data, options) {
    return await this.request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.put,
      data,
      ...options,
    });
  }

  async patch(path, data, options) {
    return await this.request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.patch,
      data,
      ...options,
    });
  }

  async delete(path, options) {
    return await this.request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.delete,
      ...options,
    });
  }
}

// const options = {
//   baseUrl: "", // string
//   astraDatabaseId: "",
//   astraDatabaseRegion: "",
//   authToken: "", // string
//   autoReconnect: "", // bool
//   getAuthToken: "", // func
//   setAuthToken: "", // func
//   username: "", // string
//   password: "", // string
// };

const createClient = async (options) => {
  if (typeof window !== "undefined") {
    throw new Error("@astrajs/rest: not for use in a web browser");
  }

  let baseUrl = null;
  if ((options.astraDatabaseId, options.astraDatabaseRegion)) {
    baseUrl = `https://${options.astraDatabaseId}-${options.astraDatabaseRegion}.apps.astra.datastax.com`;
  } else if (options.baseUrl) {
    baseUrl = options.baseUrl;
  }
  if (!baseUrl) {
    throw new Error("@astrajs/rest: baseUrl required for initialization");
  }

  let authToken = null;
  if (options.authToken) {
    authToken = options.authToken;
  } else if (options.getAuthToken) {
    authToken = await options.getAuthToken();
  } else {
    const response = await axiosRequest({
      url: baseUrl + AUTH_PATH,
      method: HTTP_METHODS.post,
      data: {
        username: options.username,
        password: options.password,
      },
    });
    authToken = response.data.authToken;
  }
  if (!authToken) {
    throw new Error("@astrajs/rest: authToken required for initialization");
  }
  return new Client({ ...options, baseUrl, authToken });
};

module.exports = { createClient };
