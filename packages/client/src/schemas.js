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

const PATH_PREFIX = "/api/rest/v2/schemas";

class AstraSchemas {
  constructor(client) {
    this.client = client;
  }

  async getKeyspaces() {
    return await this.client.get(`${PATH_PREFIX}/keyspaces`);
  }

  async getKeyspace(keyspace) {
    return await this.client.get(`${PATH_PREFIX}/keyspaces/${keyspace}`);
  }

  async createTable(keyspace, table) {
    return await this.client.post(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables`,
      table
    );
  }

  async getTables(keyspace) {
    return await this.client.get(`${PATH_PREFIX}/keyspaces/${keyspace}/tables`);
  }

  async getTable(keyspace, table) {
    return await this.client.get(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}`
    );
  }

  async updateTable(keyspace, table, tableDefinition) {
    return await this.client.put(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}`,
      tableDefinition
    );
  }

  async deleteTable(keyspace, table) {
    return await this.client.delete(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}`
    );
  }

  async createColumn(keyspace, table, columnDefinition) {
    return await this.client.post(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}`,
      columnDefinition
    );
  }

  async getColumns(keyspace, table) {
    return await this.client.get(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/columns`
    );
  }

  async getColumn(keyspace, table, column) {
    return await this.client.get(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/columns/${column}`
    );
  }

  async updateColumn(keyspace, table, column, columnDefinition) {
    return await this.client.put(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/columns/${column}`,
      columnDefinition
    );
  }

  async deleteColumn(keyspace, table, column) {
    return await this.client.delete(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/columns/${column}`
    );
  }

  async getIndexes(keyspace, table) {
    return await this.client.get(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/indexes`
    );
  }

  async createIndex(keyspace, table, indexDefinition) {
    return await this.client.post(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/indexes`,
      indexDefinition
    );
  }

  async deleteIndex(keyspace, table, index) {
    return await this.client.delete(
      `${PATH_PREFIX}/keyspaces/${keyspace}/tables/${table}/indexes/${index}`
    );
  }
}

module.exports = { AstraSchemas };
