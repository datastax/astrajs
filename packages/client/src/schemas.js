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

class AstraSchemas {
  constructor(client) {
    this.basePath = client.baseApiPath
      ? client.baseApiPath
      : "/api/rest/v2/schemas";
    this.client = client;
  }

  async getKeyspaces() {
    const res = await this.client.get(`${this.basePath}/keyspaces`);
    return res.data;
  }

  async getKeyspace(keyspace) {
    const res = await this.client.get(`${this.basePath}/keyspaces/${keyspace}`);
    return res.data;
  }

  async createKeyspace(keyspace) {
    const res = await this.client.post(`${this.basePath}/keyspaces`, keyspace);
    return res.data;
  }

  async deleteKeyspace(keyspace) {
    const res = await this.client.delete(
      `${this.basePath}/keyspaces/${keyspace}`
    );
    return res.data;
  }

  async createTable(keyspace, table) {
    const res = await this.client.post(
      `${this.basePath}/keyspaces/${keyspace}/tables`,
      table
    );

    return res.data;
  }

  async getTables(keyspace) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/tables`
    );
    return res.data;
  }

  async getTable(keyspace, table) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}`
    );
    return res.data;
  }

  async updateTable(keyspace, table, tableDefinition) {
    const res = await this.client.put(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}`,
      tableDefinition
    );
    return res.data;
  }

  async deleteTable(keyspace, table) {
    const res = await this.client.delete(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}`
    );
    return res.data;
  }

  async createColumn(keyspace, table, columnDefinition) {
    const res = await this.client.post(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/columns`,
      columnDefinition
    );
    return res.data;
  }

  async getColumns(keyspace, table) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/columns`
    );
    return res.data;
  }

  async getColumn(keyspace, table, column) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/columns/${column}`
    );
    return res.data;
  }

  async updateColumn(keyspace, table, column, columnDefinition) {
    const res = await this.client.put(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/columns/${column}`,
      columnDefinition
    );
    return res.data;
  }

  async deleteColumn(keyspace, table, column) {
    const res = await this.client.delete(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/columns/${column}`
    );
    return res.data;
  }

  async getIndexes(keyspace, table) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/indexes`
    );
    return res.data;
  }

  async createIndex(keyspace, table, indexDefinition) {
    const res = await this.client.post(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/indexes`,
      indexDefinition
    );
    return res.data;
  }

  async deleteIndex(keyspace, table, index) {
    const res = await this.client.delete(
      `${this.basePath}/keyspaces/${keyspace}/tables/${table}/indexes/${index}`
    );
    return res.data;
  }

  async getTypes(keyspace) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/types`
    );
    return res.data;
  }

  async getType(keyspace, type) {
    const res = await this.client.get(
      `${this.basePath}/keyspaces/${keyspace}/types/${type}`
    );
    return res.data;
  }

  async createType(keyspace, type) {
    const res = await this.client.post(
      `${this.basePath}/keyspaces/${keyspace}/types`,
      type
    );
    return res.data;
  }

  async updateType(keyspace, type) {
    const res = await this.client.put(
      `${this.basePath}/keyspaces/${keyspace}/types`,
      type
    );
    return res.data;
  }

  async deleteType(keyspace, type) {
    const res = await this.client.delete(
      `${this.basePath}/keyspaces/${keyspace}/types/${type}`
    );
    return res.data;
  }
}

module.exports = { AstraSchemas };
