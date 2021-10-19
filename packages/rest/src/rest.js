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

const axios = require("axios");
const _ = require("lodash");
const ConfigParser = require("configparser");
const { forEach } = require("lodash");
const tunnel = require("tunnel");

/** Section to activate when using fiddler to debug
const agent = tunnel.httpsOverHttp({
  proxy: {
     host: '127.0.0.1',
     port: 8866
   },
   rejectUnauthorized: false
 });
*/

const REQUESTED_WITH = "@astrajs/rest";
const DEFAULT_AUTH_PATH = "/api/rest/v1/auth";
const DEFAULT_METHOD = "get";
const DEFAULT_TIMEOUT = 30000;
const HTTP_METHODS = {
  get: "GET",
  post: "POST",
  put: "PUT",
  patch: "PATCH",
  delete: "DELETE",
};

/**
 * Configure an AstraClient to connect to Astra
 *
 * @param {Object} options A set of AstraJS REST connection options
 * @param {string} options.configFile An ini-style configuration file to read options from.
 * @param {string} options.configSection The section from the config file to use
 * @param {string} options.configUpdate Whether to write new values to the correct file/section
 * @param {string} options.astraDatabaseId The database id of your Astra database
 * @param {string} options.astraDatabaseRegion The region of your Astra database
 * @param {string} options.username Reconnect using the provided credentials
 * @param {string} options.password Reconnect using the provided credentials
 * @param {string} [options.baseUrl] The url of your Astra/Stargate REST instance
 * @param {string} [options.authUrl] A separate auth URL for Stargate
 * @param {string} [options.authToken] A valid stargate/Asta auth token
 * @param {string} options.applicationToken A valid Asta application token
 * @param {string} [options.autoReconnect] Reconnect using the provided credentials
 * @param {Function} [options.getAuthToken] A function that returns a promise which returns a valid authToken, for reading tokens from shared storage
 * @param {Function} [options.setAuthToken] A function that returns a promise which takes an authToken, for writing tokens to shared storage
 * @param {string} [options.debug] Show detailed request logs
 * @returns {Promise} Resolves to an AstraClient instance
 */
const createClient = async (options) => {
  // for now, we do not support usage in browsers
  if (typeof window !== "undefined") {
    throw new Error("@astrajs/rest: not for use in a web browser");
  }

  // Check to see if a config file was passed in
  if (options.configFile) {
    const config = new ConfigParser();
    const configSection = options.configSection || "default";
    config.read(options.configFile);
    const envToFlag = {
      ASTRA_DB_ID: "astraDatabaseId",
      ASTRA_DB_REGION: "astraDatabaseRegion",
      ASTRA_DB_APPLICATION_TOKEN: "applicationToken",
    };
    Object.keys(envToFlag).forEach((env) => {
      let option = envToFlag[env];
      if (!options[option] && config.get(configSection, env) != undefined) {
        options[option] = config.get(configSection, env);
      }
    });
  }

  // set the baseURL to Astra, if the user provides a Stargate URL, use that instead.
  // astraDatabaseId and astraDatabaseRegion are required if no other URL is provided.
  let baseUrl = null;
  if ((options.astraDatabaseId, options.astraDatabaseRegion)) {
    baseUrl = `https://${options.astraDatabaseId}-${options.astraDatabaseRegion}.apps.astra.datastax.com`;
  } else if (options.baseUrl) {
    baseUrl = options.baseUrl;
  }
  if (!baseUrl) {
    throw new Error("@astrajs/rest: baseUrl required for initialization");
  }

  // provision an auth token from Astra, Stargate, or user provided storage, or use
  // a provided application token
  let authToken = null;
  if (!options.applicationToken) {
    if (options.authToken) {
      authToken = options.authToken;
    } else if (options.getAuthToken) {
      authToken = await options.getAuthToken();
    } else {
      const response = await axiosRequest({
        url: options.authUrl ? options.authUrl : baseUrl + DEFAULT_AUTH_PATH,
        method: HTTP_METHODS.post,
        data: {
          username: options.username,
          password: options.password,
        },
      });
      authToken = response.data.authToken;
    }
  }

  if (!authToken && !options.applicationToken) {
    throw new Error(
      "@astrajs/rest: authToken or applicationToken required for initialization"
    );
  }

  // setup detailed request logging if the user desires it
  if (options.debug) {
    axios.interceptors.request.use((config) => {
      console.log(JSON.stringify(config, null, 2));
      return config;
    });

    axios.interceptors.response.use((response) => {
      console.log(JSON.stringify(response.data, null, 2));
      return response;
    });
  }

  return new AstraClient({ ...options, baseUrl, authToken });
};

const axiosRequest = async (options) => {
  try {
    const authHeader = {};
    if (options.applicationToken) {
      authHeader[options.authHeaderName] = options.applicationToken;
    } else {
      authHeader[options.authHeaderName] = options.authToken
        ? options.authToken
        : "";
    }

    axios.defaults.headers.common["User-Agent"] += "@astrajs";

    const response = await axios({
      url: options.url,
      data: options.data,
      params: options.params,
      method: options.method ? options.method : DEFAULT_METHOD,
      timeout: options.timeout ? options.timeout : DEFAULT_TIMEOUT,
      headers: {
        Accepts: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "@astrajs 0.0.1",
        "X-Requested-With": REQUESTED_WITH,
        ...authHeader,
      },
    });
    if (response.data.data) {
      return {
        status: response.status,
        ...response.data,
      };
    }
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    throw new Error(
      "Request Failed: " +
        _.get(error, "response.data") +
        "\nStack Trace: " +
        error.message
    );
  }
};

/**
 * An Astra/Stargate client.
 *
 * @class
 * @classdesc An Astra/Stargate client.
 * @returns {AstraClient}
 */
class AstraClient {
  /**
   * @param {Object} options A set of AstraJS REST connection options
   * @param {string} options.baseUrl The url of your database
   * @param {string} options.authToken A valid stargate/Astra auth token
   * @param {string} options.applicationToken A valid Astra application token
   * @param {string} options.username Reconnect using the provided credentials
   * @param {string} options.password Reconnect using the provided credentials
   * @param {string} [options.autoReconnect] Reconnect using the provided credentials
   * @param {Function} [options.getAuthToken] A function that returns a promise which returns a valid authToken, for reading tokens from shared storage
   * @param {Function} [options.setAuthToken] A function that returns a promise which takes an authToken, for writing tokens to shared storage
   * @returns {AstraClient}
   */
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.configFile = options.configFile;
    this.configSection = options.configSection || "default";
    this.baseApiPath = options.baseApiPath;
    this.authToken = options.authToken;
    this.applicationToken = options.applicationToken;
    this.authUrl = options.authUrl;
    this.autoReconnect = options.autoReconnect ? options.autoReconnect : true;
    this.getAuthToken = options.getAuthToken;
    this.setAuthToken = options.setAuthToken;
    this.username = options.username;
    this.password = options.password;
    this.authHeaderName = options.authHeaderName || "X-Cassandra-Token";
  }

  async _getAuthToken() {
    if (this.getAuthToken) {
      return await this.getAuthToken(authToken);
    }
    if (this.authToken) {
      return this.authToken;
    }
    await this._connect();
    return this.authToken;
  }

  async _setAuthToken(authToken) {
    if (this.setAuthToken) {
      await this.setAuthToken(authToken);
    }
    this.authToken = authToken;
  }

  async _connect() {
    const response = await axiosRequest({
      url: this.authUrl ? this.authUrl : this.baseUrl + DEFAULT_AUTH_PATH,
      method: HTTP_METHODS.post,
      data: {
        username: this.username,
        password: this.password,
      },
    });
    this._setAuthToken(response.data.authToken);
  }

  async _request(options) {
    const response = await axiosRequest({
      ...options,
      authToken: this.authToken,
      applicationToken: this.applicationToken,
      authHeaderName: this.authHeaderName,
    });
    if (
      response.status === 401 &&
      this.autoReconnect &&
      !this.applicationToken
    ) {
      console.log("@astrajs/rest: reconnecting");
      await this._connect();
      return await axiosRequest(options);
    }
    return response;
  }

  /**
   * Issue a HTTP GET request to Astra/Stargate
   *
   * @param  {string} path
   * @param  {Object} [options] The request options
   * @param  {Object} [options.params] The request query parameters
   * @param  {int} [options.timeout] The request timeout, in milliseconds
   * @returns {Promise} Resolves to a response instance { status: 200, data: {...} }
   */
  async get(path, options) {
    return await this._request({
      url: this.baseUrl + path,

      method: HTTP_METHODS.get,
      ...options,
    });
  }

  /**
   * Issue a HTTP POST request to Astra/Stargate
   *
   * @param  {string} path
   * @param  {Object} data The request body
   * @param  {Object} [options] The request options
   * @param  {Object} [options.params] The request query parameters
   * @param  {int} [options.timeout] The request timeout, in milliseconds
   * @returns {Promise} Resolves to a response instance { status: 200, data: {...} }
   */
  async post(path, data, options) {
    return await this._request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.post,
      data,
      ...options,
    });
  }

  /**
   * Issue a HTTP PUT request to Astra/Stargate
   *
   * @param  {string} path
   * @param  {Object} data The request body
   * @param  {Object} [options] The request options
   * @param  {Object} [options.params] The request query parameters
   * @param  {int} [options.timeout] The request timeout, in milliseconds
   * @returns {Promise} Resolves to a response instance { status: 200, data: {...} }
   */
  async put(path, data, options) {
    return await this._request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.put,
      data,
      ...options,
    });
  }

  /**
   * Issue a HTTP PATCH request to Astra/Stargate
   *
   * @param  {string} path
   * @param  {Object} data The request body
   * @param  {Object} [options] The request options
   * @param  {Object} [options.params] The request query parameters
   * @param  {int} [options.timeout] The request timeout, in milliseconds
   * @returns {Promise} Resolves to a response instance { status: 200, data: {...} }
   */
  async patch(path, data, options) {
    return await this._request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.patch,
      data,
      ...options,
    });
  }

  /**
   * Issue a HTTP DELETE request to Astra/Stargate
   *
   * @param  {string} path
   * @param  {Object} [options] The request options
   * @param  {Object} [options.params] The request query parameters
   * @param  {int} [options.timeout] The request timeout, in milliseconds
   * @returns {Promise} Resolves to a response instance { status: 200, data: {...} }
   */
  async delete(path, options) {
    return await this._request({
      url: this.baseUrl + path,
      method: HTTP_METHODS.delete,
      ...options,
    });
  }
}

module.exports = { createClient, axiosRequest };
