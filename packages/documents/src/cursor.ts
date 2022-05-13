import { formatQuery } from "./utils";

export class FindCursor {
  collection: any;
  query: any;
  options: any;
  namespace: any;

  constructor(collection: any, query: any, options: any) {
    this.collection = collection;
    this.query = formatQuery(query, options);
    this.options = options;
    this.namespace = collection;
  }
  async toArray(cb: any) {
    const res = await this.collection.collectionClient.find(this.query);
    if (cb) {
      return cb(
        null,
        Object.keys(res.data).map((i) => res.data[i])
      );
    }
    return res.data;
  }

  stream(options: any) {
    throw new Error("Streaming cursors are not supported");
  }
}
