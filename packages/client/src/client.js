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

class AstraClient {
  constructor(collections, options) {
    // create a collections client
    this.collections = collections;

    // get a reference to the underlying REST client
    this._restClient = collections.restClient;

    // setup an Apollo connection
    this.graphql = new AstraGraphQL(this._restClient);

    // setup a REST connection
    // this.rest =

    // setup a Devops connection
    // this.devops =

    // setup a Schemas connection
    // this.schemas =

    // setup an IAM connection
    // this.iam =
  }
}

const createAstraClient = async (options) => {
  const collections = await astraCollections.createClient(options);
  return new AstraClient(collections, options);
};

module.exports = { AstraClient, createAstraClient };
