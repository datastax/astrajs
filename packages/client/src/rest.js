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

const PATH_PREFIX = "/api/rest/v2/keyspaces";

class AstraRest {
  constructor(client) {
    this.client = client;
  }

  async searchTable(keyspace, table, query, options) {
    return await this.client.get(`${PATH_PREFIX}/${keyspace}/${table}`, {
      ...options,
      query,
    });
  }

  async addRow(keyspace, table, row) {
    return await this.client.post(`${PATH_PREFIX}/${keyspace}/${table}`, row);
  }

  async getRow(keyspace, table, keyPath, options) {
    return await this.client.get(
      `${PATH_PREFIX}/${keyspace}/${table}/${keyPath}`,
      {
        ...options,
      }
    );
  }

  async replaceRow(keyspace, table, keyPath, row) {
    return await this.client.put(
      `${PATH_PREFIX}/${keyspace}/${table}/${keyPath}`,
      row
    );
  }

  async updateRow(keyspace, table, keyPath, row) {
    return await this.client.patch(
      `${PATH_PREFIX}/${keyspace}/${table}/${keyPath}`,
      row
    );
  }

  async deleteRow(keyspace, table, keyPath) {
    return await this.client.delete(
      `${PATH_PREFIX}/${keyspace}/${table}/${keyPath}`
    );
  }
}

module.exports = { AstraRest };
