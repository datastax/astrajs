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

class AstraRest {
  constructor(client) {
    this.basePath = client.baseApiPath
      ? client.baseApiPath
      : "/api/rest/v2/keyspaces";
    this.client = client;
  }

  async searchTable(keyspace, table, query, options) {
    const res = await this.client.get(`${this.basePath}/${keyspace}/${table}`, {
      params: {
        where: query,
        ...options,
      },
    });
    return res.data;
  }

  async addRow(keyspace, table, row) {
    const res = await this.client.post(
      `${this.basePath}/${keyspace}/${table}`,
      row
    );
    return res.data;
  }

  async getRows(keyspace, table, keyPath, options) {
    const res = await this.client.get(
      `${this.basePath}/${keyspace}/${table}/${keyPath}`,
      {
        ...options,
      }
    );
    return res.data;
  }

  async replaceRows(keyspace, table, keyPath, row) {
    const res = await this.client.put(
      `${this.basePath}/${keyspace}/${table}/${keyPath}`,
      row
    );
    return res.data;
  }

  async updateRows(keyspace, table, keyPath, row) {
    const res = await this.client.patch(
      `${this.basePath}/${keyspace}/${table}/${keyPath}`,
      row
    );
    return res.data;
  }

  async deleteRows(keyspace, table, keyPath) {
    const res = await this.client.delete(
      `${this.basePath}/${keyspace}/${table}/${keyPath}`
    );
    return res.data;
  }
}

module.exports = { AstraRest };
