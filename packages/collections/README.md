## @astrajs/collections

[![Actions Status](https://github.com/kidrecursive/astrajs/workflows/Tests/badge.svg)](https://github.com/kidrecursive/astrajs/actions) 

Connect your NodeJS app to your [DataStax Astra Database](https://astra.datastax.com) or to your [Stargate](https://stargate.io/) instance.

### Resources
- [DataStax Astra](https://astra.datastax.com)
- [Stargate REST API documentation](https://stargate.io/)

### Quickstart

Gather your Astra Database connection information

Setup your environment
```bash
# install @astrajs/collections
npm install @astrajs/collections

# setup some environment variables with your Astra connection information
export ASTRA_DB_ID={secret}
export ASTRA_DB_REGION={secret}
export ASTRA_DB_USERNAME={secret}
export ASTRA_DB_PASSWORD={secret}
```

Connect and start working with documents
```javascript
const { createClient } = require("@astrajs/collections");

// create an Astra client
const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
});

// create a shortcut to the users collection in the app namespace/keyspace
// collections are created automatically
const usersCollection = astraClient.namespace("app").collection("users");

// get a single user by document id
const user = await usersCollection.get("cliff@wicklow.com");

// get a subdocument by path
const userBlogComments = await usersCollection.get("cliff@wicklow.com/blog/comments");

// search a collection of documents
const users = await usersCollection.find({ name: { $eq: "Cliff" } });

// find a single user
const user = await usersCollection.findOne({ name: { $eq: "dang" } });

// create a new user
const user = await usersCollection.create("cliff@wicklow.com", {
  name: "cliff",
});

// create a user subdocument
const user = await usersCollection.create("cliff@wicklow.com/blog", {
  title: "new blog",
});

// partially update user
const user = await usersCollection.update("cliff@wicklow.com", {
  name: "cliff",
});

// partially update a user subdocument 
const userBlog = await usersCollection.update("cliff@wicklow.com/blog", {
  title: "my spot",
});

// replace a user subdocumet
const userBlog = await usersCollection.replace("cliff@wicklow.com/blog", {
  title: "New Blog",
});

// delete a user
const user = await usersCollection.delete("cliff@wicklow.com");

// delete a user subdocument
const userBlog = await usersCollection.delete("cliff@wicklow.com/blog");
```