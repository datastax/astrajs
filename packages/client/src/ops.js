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

const PATH_PREFIX = "/v2";

class AstraOps {
  constructor(client) {
    this.client = client;
  }

  async getDatabases() {
    return await this.client.get(`${PATH_PREFIX}/databases`);
  }

  async createDatabase(databaseDefinition) {
    return await this.client.post(
      `${PATH_PREFIX}/databases`,
      databaseDefinition
    );
  }

  async getDatabase(database) {
    return await this.client.get(`${PATH_PREFIX}/databases/${database}`);
  }

  async createKeyspace(database, keyspace) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/keyspaces/${keyspace}`
    );
  }

  async terminateDatabase(database) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/terminate`
    );
  }

  async parkDatabase(database) {
    return await this.client.post(`${PATH_PREFIX}/databases/${database}/park`);
  }

  async unparkDatabase(database) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/unpark`
    );
  }

  async resizeDatabase(database, options) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/resize`,
      options
    );
  }

  async resetDatabasePassword(database, options) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/resetPassword`,
      options
    );
  }

  async getAvailableRegions() {
    return await this.client.get(`${PATH_PREFIX}/availableRegions`);
  }

  async getRoles() {
    return await this.client.get(`${PATH_PREFIX}/organizations/roles`);
  }

  async createRole(roleDefinition) {
    return await this.client.post(
      `${PATH_PREFIX}/organizations/roles`,
      roleDefinition
    );
  }

  async getRole(role) {
    return await this.client.get(`${PATH_PREFIX}/organizations/roles/${role}`);
  }

  async updateRole(role, roleDefinition) {
    return await this.client.put(
      `${PATH_PREFIX}/organizations/roles/${role}`,
      roleDefinition
    );
  }

  async deleteRole(role) {
    return await this.client.delete(
      `${PATH_PREFIX}/organizations/roles/${role}`
    );
  }

  async inviteUser(userDefinition) {
    return await this.client.put(
      `${PATH_PREFIX}/organizations/users`,
      userDefinition
    );
  }

  async getUsers() {
    return await this.client.get(`${PATH_PREFIX}/organizations/users`);
  }

  async getUser(user) {
    return await this.client.get(`${PATH_PREFIX}/organizations/users/${user}`);
  }

  async removeUser(user) {
    return await this.client.delete(
      `${PATH_PREFIX}/organizations/users/${user}`
    );
  }

  async updateUserRoles(user, roles) {
    return await this.client.put(
      `${PATH_PREFIX}/organizations/users/${user}/roles`,
      roles
    );
  }

  async getClients() {
    return await this.client.get(`${PATH_PREFIX}/clientIdSecrets`);
  }

  async createToken(roles) {
    return await this.client.post(`${PATH_PREFIX}/clientIdSecrets`, roles);
  }

  async deleteToken(token) {
    return await this.client.post(`${PATH_PREFIX}/clientIdSecret/${token}`);
  }

  async getOrganization() {
    return await this.client.get(`${PATH_PREFIX}/currentOrg`);
  }
}

module.exports = { AstraOps };
