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

const astraCollections = require("@astrajs/collections");
const { AstraGraphQL } = require("./graphql");
const { AstraRest } = require("./rest");
const { AstraOps } = require("./ops");
const { AstraSchemas } = require("./schemas");

class AstraClient {
  constructor(collections) {
    this.collections = collections;
    this._restClient = collections.restClient;
    this.graphql = new AstraGraphQL(this._restClient);
    this.rest = new AstraRest(this._restClient);
    this.ops = new AstraOps(this._restClient);
    this.schemas = new AstraSchemas(this._restClient);
  }
}

const createAstraClient = async (options) => {
  const collections = await astraCollections.createClient(options);
  return new AstraClient(collections);
};

module.exports = { AstraClient, createAstraClient };
