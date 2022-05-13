import { ObjectId, AggregateOptions, AggregationCursor } from "mongodb";
import { FindCursor } from "./cursor";
import { formatQuery } from "./utils";
import _ from "lodash";

export class Collection {
  namespaceClient: any;
  collectionClient: any;
  name: string;
  collectionName: string;

  constructor(namespaceClient: any, name: string) {
    this.namespaceClient = namespaceClient;
    this.collectionClient = namespaceClient.collection(name);
    this.name = name;
    this.collectionName = name;
  }

  aggregate<T>(
    pipeline?: Document[],
    options?: AggregateOptions
  ): AggregationCursor<T> {
    throw new Error("Not Implemented");
  }

  async insertOne(mongooseDoc: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    let res: any = {};
    let err = null;
    try {
      if (!mongooseDoc._id) {
        mongooseDoc._id = new ObjectId().toHexString();
      }
      res = await this.collectionClient.create(mongooseDoc._id, mongooseDoc);
    } catch (e) {
      err = e;
    }
    if (res.documentId) {
      res.insertedId = res.documentId;
      delete res.documentId;
    }
    if (cb) {
      return cb(err, res);
    }
    return res;
  }

  async insertMany(mongooseDocs: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    let res = {};
    let err = null;
    mongooseDocs = mongooseDocs.map((mongooseDoc: any) => {
      if (!mongooseDoc._id) {
        mongooseDoc._id = new ObjectId().toHexString();
      }
      return mongooseDoc;
    });
    try {
      res = await this.collectionClient.batch(mongooseDocs, "_id");
    } catch (e) {
      err = e;
    }
    if (cb) {
      return cb(err, res);
    }
    return res;
  }

  async updateMany(query: any, update: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (update.$set) {
      update = {
        ...update.$set,
      };
      delete update.$set;
    }
    try {
      const docs = await this.collectionClient.find(
        formatQuery(query, options)
      );
      if (docs.data) {
        const res = await Promise.all(
          _.keys(docs.data).map((docId) => {
            return this.collectionClient.update(docId, update);
          })
        );
      }
    } catch (e) {}
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  async updateOne(query: any, update: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (update.$set) {
      update = {
        ...update.$set,
      };
      delete update.$set;
    }
    try {
      const doc = await this.collectionClient.findOne(
        formatQuery(query, options)
      );
      if (doc) {
        if (update.$inc) {
          _.keys(update.$inc).forEach((incrementKey) => {
            if (doc[incrementKey]) {
              update[incrementKey] += update.$inc[incrementKey];
            } else {
              update[incrementKey] = update.$inc[incrementKey];
            }
            delete update.$inc;
          });
        }
        const res = await this.collectionClient.update(doc._id, update);
        res.modifiedCount = 1;
        if (options?.returnDocument === "after") {
          res.value = { ...doc, ...update };
        } else {
          res.value = { ...doc };
        }

        if (cb) {
          return cb(null, res);
        }
      }
    } catch (e) {}
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  async findOneAndUpdate(query: any, update: any, options: any, cb: any) {
    return this.updateOne(query, update, options, cb);
  }

  async replaceOne(query: any, newDoc: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    try {
      const doc = await this.collectionClient.findOne(formatQuery(query, {}));
      if (doc) {
        const res = await this.collectionClient.replace(doc._id, newDoc);
        if (cb) {
          return cb(null, res);
        }
      }
    } catch (e) {}
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  find(query: any, options: any, cb: any) {
    const cursor = new FindCursor(this, query, options);
    if (cb) {
      return cb(null, cursor);
    }
    return cursor;
  }

  async distinct(key: any, filter: any, options: any, cb: any) {
    const res = await this.collectionClient.find(formatQuery(filter, options));
    let list: any = [];
    if (res.data) {
      Object.keys(res.data).forEach((resKey) => {
        list = list.concat(res.data[resKey][key]);
      });
    }
    list = _.uniq(list);
    if (cb) {
      return cb(null, list);
    }
    return list;
  }

  async countDocuments(query: any, options: any, cb: any) {
    let count = 0;
    try {
      const res = await this.collectionClient.find(formatQuery(query, options));
      count = res.count ? res.count : Object.keys(res.data).length;
    } catch (e) {}
    if (cb) {
      return cb(null, count);
    }
    return count;
  }

  async count(query: any, options: any, cb: any) {
    return this.countDocuments(query, options, cb);
  }

  async findOne(query: any, options: any, cb: any) {
    const res = await this.collectionClient.findOne(
      formatQuery(query, options)
    );
    if (cb) {
      return cb(null, res);
    }
    return res;
  }

  async createIndex(index: any, options: any, cb: any) {
    if (cb) {
      return cb(index);
    }
    return index;
  }

  async update() {}

  async findOneAndDelete(query: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    try {
      const doc = await this.collectionClient.findOne(
        formatQuery(query, options)
      );
      if (doc) {
        const res = this.collectionClient.delete(doc._id);
        return cb(null, { value: doc, deletedCount: 1 });
      }
    } catch (e) {}
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  async remove(query: any, options: any, cb: any) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    try {
      const docs = await this.collectionClient.find(
        formatQuery(query, options)
      );
      if (docs.data) {
        const res = await Promise.all(
          _.keys(docs.data).map((docId) => this.collectionClient.delete(docId))
        );
        return cb(null, {
          deletedCount: res.length,
        });
      }
    } catch (e) {}
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  async deleteMany(query: any, options: any, cb: any) {
    return this.remove(query, options, cb);
  }

  async findOneAndRemove(query: any, options: any, cb: any) {
    return this.findOneAndDelete(query, options, cb);
  }

  async deleteOne(query: any, options: any, cb: any) {
    return this.findOneAndDelete(query, options, cb);
  }
}
