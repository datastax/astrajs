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

const {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  concat,
  gql,
} = require("@apollo/client/core");
const fetch = require("cross-fetch");

class AstraGraphQL {
  constructor(astraRestClient) {
    this.astraRestClient = astraRestClient;
  }

  createApolloClient(uri) {
    const httpLink = new HttpLink({
      uri,
      fetch,
    });
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: concat(this.createTokenMiddleware(), httpLink),
    });
  }

  createTokenMiddleware() {
    return new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          "X-Cassandra-Token": this.astraRestClient.applicationToken
            ? this.astraRestClient.applicationToken
            : this.astraRestClient.authToken,
        },
      });
      return forward(operation);
    });
  }

  getSchema() {
    return this.createApolloClient(
      `${this.astraRestClient.baseUrl}/api/graphql-schema`
    );
  }

  getKeyspace(keyspaceName) {
    return this.createApolloClient(
      `${this.astraRestClient.baseUrl}/api/graphql/${keyspaceName}`
    );
  }
}

module.exports = { AstraGraphQL, gql };
