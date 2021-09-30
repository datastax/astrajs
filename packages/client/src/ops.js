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

const _ = require("lodash");
const PATH_PREFIX = "/v2";
const DEFAULT_HOST = "https://api.astra.datastax.com";

class AstraOps {
  constructor(client) {
    const newClient = _.cloneDeep(client);
    newClient.baseUrl = DEFAULT_HOST;
    newClient.authHeaderName = "Authorization";
    newClient.applicationToken = `Bearer ${client.applicationToken}`;
    this.client = newClient;
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

  async getSecureBundle(database) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/secureBundleURL`,
      options
    );
  }

  async getDatacenters(database) {
    return await this.client.get(
      `${PATH_PREFIX}/databases/${database}/datacenters`
    );
  }

  async createDatacenter(database, options) {
    return await this.client.get(
      `${PATH_PREFIX}/databases/${database}/datacenters`,
      options
    );
  }

  async terminateDatacenter(database, datacenter) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/datacenters/${datacenter}/terminate`
    );
  }

  async getAccessList(database) {
    return await this.client.get(
      `${PATH_PREFIX}/databases/${database}/access-list`
    );
  }

  async replaceAccessList(database, accessList) {
    return await this.client.put(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      accessList
    );
  }

  async updateAccessList(database, accessList) {
    return await this.client.patch(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      accessList
    );
  }

  async addAccessListAddress(database, address) {
    return await this.client.post(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      address
    );
  }

  async deleteAccessList(database, addresses) {
    return await this.client.delete(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      addresses
    );
  }

  async getPrivateLink(database) {
    return await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/private-link`
    );
  }

  async getDatacenterPrivateLink(database, datacenter) {
    return await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/private-link`
    );
  }

  async createDatacenterPrivateLink(database, datacenter, privateLink) {
    return await this.client.post(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/private-link`,
      privateLink
    );
  }

  async createDatacenterEndpoint(database, datacenter, endpoint) {
    return await this.client.post(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoint`,
      endpoint
    );
  }

  async updateDatacenterEndpoint(database, datacenter, endpoint) {
    return await this.client.put(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoint`,
      endpoint
    );
  }

  async getDatacenterEndpoint(database, datacenter, endpoint) {
    return await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoints/${endpoint}`
    );
  }

  async deleteDatacenterEndpoint(database, datacenter, endpoint) {
    return await this.client.delete(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoints/${endpoint}`
    );
  }

  async getAvailableClassicRegions() {
    return await this.client.get(`${PATH_PREFIX}/availableRegions`);
  }

  async getAvailableRegions() {
    return await this.client.get(`${PATH_PREFIX}/regions/serverless`);
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

  async updateUserRoles(user, roles) {
    return await this.client.put(
      `${PATH_PREFIX}/organizations/users/${user}/roles`,
      roles
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

  async getClients() {
    return await this.client.get(`${PATH_PREFIX}/clientIdSecrets`);
  }

  async createToken(roles) {
    return await this.client.post(`${PATH_PREFIX}/clientIdSecrets`, roles);
  }

  async revokeToken(token) {
    return await this.client.post(`${PATH_PREFIX}/clientIdSecret/${token}`);
  }

  async getOrganization() {
    return await this.client.get(`${PATH_PREFIX}/currentOrg`);
  }

  async getAccessLists() {
    return await this.client.get(`${PATH_PREFIX}/access-lists`);
  }

  async getAccessListTemplate() {
    return await this.client.get(`${PATH_PREFIX}/access-list/template`);
  }

  async validateAccessList() {
    return await this.client.post(`${PATH_PREFIX}/access-list/validate`);
  }

  async getPrivateLinks() {
    return await this.client.get(`${PATH_PREFIX}/organizations/private-link`);
  }
}

module.exports = { AstraOps };
