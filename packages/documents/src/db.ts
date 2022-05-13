import { Collection } from "./collection";

export class Db {
  astraClient: any;
  namespaceClient: any;
  name: string;

  constructor(astraClient: any, name: string) {
    this.astraClient = astraClient;
    this.namespaceClient = astraClient.collections.namespace(name);
    this.name = name;
  }

  collection(collectionName: string) {
    return new Collection(this.namespaceClient, collectionName);
  }

  async createCollection(collectionName: string, options: any, cb: any) {
    try {
      await this.namespaceClient.createCollection(collectionName);
    } catch (e) {
      // console.error(e);
    }
    if (cb) {
      return cb();
    }
  }

  async dropCollection(collectionName: string, cb: any) {
    try {
      await this.namespaceClient.deleteCollection(collectionName);
    } catch (e) {}
    if (cb) {
      cb(null, null);
    }
    return null;
  }

  async dropDatabase(cb: any) {
    if (cb) {
      return cb(null, {});
    }
  }
}
