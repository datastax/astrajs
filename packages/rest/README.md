## @astrajs/rest

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
npm install @astrajs/rest

# setup some environment variables with your Astra connection information
export ASTRA_DB_ID={secret}
export ASTRA_DB_REGION={secret}
export ASTRA_DB_USERNAME={secret}
export ASTRA_DB_PASSWORD={secret}
```

Connect and start working with documents
```javascript
const { createClient } = require("@astrajs/rest");

// create an Astra client
const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
});

const basePath = "/api/rest/v2/namespaces/app/collections/users";

// get a single user by document id
const { data, status } = await astraClient.get(`${basePath}/cliff@wicklow.com`);

// get a subdocument by path
const { data, status } = await astraClient.get(`${basePath}/cliff@wicklow.com/blog/comments`);

// search a collection of documents
const { data, status } = await astraClient.get(basePath, { 
  params: { 
    where: { 
      name: { $eq: "Cliff" }
    }
  }
});

// create a new user without a document id
const { data, status } = await astraClient.post(basePath, {
  name: "cliff",
});

// create a new user with a document id
const { data, status } = await astraClient.put(`${basePath}/cliff@wicklow.com`, {
  name: "cliff",
});

// create a user subdocument
const { data, status } = await astraClient.put(`${basePath}/cliff@wicklow.com/blog`, {
  title: "new blog",
});

// partially update user
const { data, status } = await astraClient.patch(`${basePath}/cliff@wicklow.com`, {
  name: "cliff",
});

// delete a user
const { data, status } = await astraClient.delete(`${basePath}/cliff@wicklow.com`);
```