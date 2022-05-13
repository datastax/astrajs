import { Db } from "./db";
import { createAstraClient } from "@astrajs/client";
import { parseUri } from "./utils";

export class MongoClient {
  baseURL: string;
  keyspaceName: string;
  astraApplicationToken: string;
  astraClient: any;

  constructor(uri: string, options: any) {
    this.baseURL = uri;
    this.keyspaceName = options.keyspaceName;
    this.astraApplicationToken = options.astraApplicationToken;
    this.astraClient = null;
  }

  setMaxListeners(maxListeners: number) {
    return maxListeners;
  }

  db(dbName: string | undefined) {
    if (dbName) {
      return new Db(this.astraClient, dbName);
    }
    return new Db(this.astraClient, this.keyspaceName);
  }

  close(cb: any) {
    if (cb) {
      cb(null, null);
    }
    return null;
  }

  async connect(cb: any) {
    this.astraClient = await createAstraClient({
      baseUrl: this.baseURL,
      applicationToken: this.astraApplicationToken,
    });
    if (cb) {
      return cb(null, this);
    }
    return this;
  }

  static async connect(uri: string, cb: any) {
    const parsedUri = parseUri(uri);
    const client = new MongoClient(parsedUri.baseUrl, parsedUri);
    await client.connect(null);
    if (cb) {
      return cb(null, client);
    }
  }
}
