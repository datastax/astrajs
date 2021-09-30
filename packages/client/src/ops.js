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
    const res = await this.client.get(`${PATH_PREFIX}/databases`);
    return res.data;
  }

  async createDatabase(databaseDefinition) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases`,
      databaseDefinition
    );
    return res.data;
  }

  async getDatabase(database) {
    const res = await this.client.get(`${PATH_PREFIX}/databases/${database}`);
    return res.data;
  }

  async createKeyspace(database, keyspace) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/keyspaces/${keyspace}`
    );
    return res.data;
  }

  async terminateDatabase(database) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/terminate`
    );
    return res.data;
  }

  async parkDatabase(database) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/park`
    );
    return res.data;
  }

  async unparkDatabase(database) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/unpark`
    );
    return res.data;
  }

  async resizeDatabase(database, options) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/resize`,
      options
    );
    return res.data;
  }

  async resetDatabasePassword(database, options) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/resetPassword`,
      options
    );
    return res.data;
  }

  async getSecureBundle(database) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/secureBundleURL`
    );
    return res.data;
  }

  async getDatacenters(database) {
    const res = await this.client.get(
      `${PATH_PREFIX}/databases/${database}/datacenters`
    );
    return res.data;
  }

  async createDatacenter(database, options) {
    const res = await this.client.get(
      `${PATH_PREFIX}/databases/${database}/datacenters`,
      options
    );
    return res.data;
  }

  async terminateDatacenter(database, datacenter) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/datacenters/${datacenter}/terminate`
    );
    return res.data;
  }

  async getAccessList(database) {
    const res = await this.client.get(
      `${PATH_PREFIX}/databases/${database}/access-list`
    );
    return res.data;
  }

  async replaceAccessList(database, accessList) {
    const res = await this.client.put(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      accessList
    );
    return res.data;
  }

  async updateAccessList(database, accessList) {
    const res = await this.client.patch(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      accessList
    );
    return res.data;
  }

  async addAccessListAddress(database, address) {
    const res = await this.client.post(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      address
    );
  }

  async deleteAccessList(database, addresses) {
    const res = await this.client.delete(
      `${PATH_PREFIX}/databases/${database}/access-list`,
      addresses
    );
    return res.data;
  }

  async getPrivateLink(database) {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/private-link`
    );
    return res.data;
  }

  async getDatacenterPrivateLink(database, datacenter) {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/private-link`
    );
    return res.data;
  }

  async createDatacenterPrivateLink(database, datacenter, privateLink) {
    const res = await this.client.post(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/private-link`,
      privateLink
    );
    return res.data;
  }

  async createDatacenterEndpoint(database, datacenter, endpoint) {
    const res = await this.client.post(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoint`,
      endpoint
    );
    return res.data;
  }

  async updateDatacenterEndpoint(database, datacenter, endpoint) {
    const res = await this.client.put(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoint`,
      endpoint
    );
    return res.data;
  }

  async getDatacenterEndpoint(database, datacenter, endpoint) {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoints/${endpoint}`
    );
    return res.data;
  }

  async deleteDatacenterEndpoint(database, datacenter, endpoint) {
    const res = await this.client.delete(
      `${PATH_PREFIX}/organizations/clusters/${database}/datacenters/${datacenter}/endpoints/${endpoint}`
    );
    return res.data;
  }

  async getAvailableClassicRegions() {
    const res = await this.client.get(`${PATH_PREFIX}/availableRegions`);
    return res.data;
  }

  async getAvailableRegions() {
    const res = await this.client.get(`${PATH_PREFIX}/regions/serverless`);
    return res.data;
  }

  async getRoles() {
    const res = await this.client.get(`${PATH_PREFIX}/organizations/roles`);
    return res.data;
  }

  async createRole(roleDefinition) {
    const res = await this.client.post(
      `${PATH_PREFIX}/organizations/roles`,
      roleDefinition
    );
    return res.data;
  }

  async getRole(role) {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/roles/${role}`
    );
    return res.data;
  }

  async updateRole(role, roleDefinition) {
    const res = await this.client.put(
      `${PATH_PREFIX}/organizations/roles/${role}`,
      roleDefinition
    );
    return res.data;
  }

  async updateUserRoles(user, roles) {
    const res = await this.client.put(
      `${PATH_PREFIX}/organizations/users/${user}/roles`,
      roles
    );
    return res.data;
  }

  async deleteRole(role) {
    const res = await this.client.delete(
      `${PATH_PREFIX}/organizations/roles/${role}`
    );
    return res.data;
  }

  async inviteUser(userDefinition) {
    const res = await this.client.put(
      `${PATH_PREFIX}/organizations/users`,
      userDefinition
    );
    return res.data;
  }

  async getUsers() {
    const res = await this.client.get(`${PATH_PREFIX}/organizations/users`);
    return res.data;
  }

  async getUser(user) {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/users/${user}`
    );
    return res.data;
  }

  async removeUser(user) {
    const res = await this.client.delete(
      `${PATH_PREFIX}/organizations/users/${user}`
    );
    return res.data;
  }

  async getClients() {
    const res = await this.client.get(`${PATH_PREFIX}/clientIdSecrets`);
    return res.data;
  }

  async createToken(roles) {
    const res = await this.client.post(`${PATH_PREFIX}/clientIdSecrets`, roles);
    return res.data;
  }

  async revokeToken(token) {
    const res = await this.client.post(
      `${PATH_PREFIX}/clientIdSecret/${token}`
    );
    return res.data;
  }

  async getOrganization() {
    const res = await this.client.get(`${PATH_PREFIX}/currentOrg`);
    return res.data;
  }

  async getAccessLists() {
    const res = await this.client.get(`${PATH_PREFIX}/access-lists`);
    return res.data;
  }

  async getAccessListTemplate() {
    const res = await this.client.get(`${PATH_PREFIX}/access-list/template`);
    return res.data;
  }

  async validateAccessList() {
    const res = await this.client.post(`${PATH_PREFIX}/access-list/validate`);
    return res.data;
  }

  async getPrivateLinks() {
    const res = await this.client.get(
      `${PATH_PREFIX}/organizations/private-link`
    );
    return res.data;
  }

  async getStreamingProviders() {
    const res = await this.client.get(`${PATH_PREFIX}/streaming/providers`);
    return res.data;
  }

  async getStreamingTenants() {
    const res = await this.client.get(`${PATH_PREFIX}/streaming/tenants`);
    return res.data;
  }

  async createStreamingTenant(tenant) {
    const res = await this.client.post(
      `${PATH_PREFIX}/streaming/tenants`,
      tenant
    );
    return res.data;
  }

  async deleteStreamingTenant(tenant, cluster) {
    const res = await this.client.delete(
      `${PATH_PREFIX}/streaming/tenants/${tenant}/clusters/${cluster}`
    );
    return res.data;
  }

  async getStreamingTenant(tenant) {
    const res = await this.client.post(
      `${PATH_PREFIX}/streaming/tenants/${tenant}/limits`
    );
    return res.data;
  }
}

module.exports = { AstraOps };
