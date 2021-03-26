## @astrajs/rest

[![Actions Status](https://github.com/kidrecursive/astrajs/workflows/Tests/badge.svg)](https://github.com/kidrecursive/astrajs/actions) 

Connect your NodeJS app to your [DataStax Astra Database](https://astra.datastax.com) or to your [Stargate](https://stargate.io/) instance.

### Resources
- [DataStax Astra](https://astra.datastax.com)
- [Stargate REST API documentation](https://stargate.io/)
- [Quickstart](https://docs.astra.datastax.com/docs/astra-rest-client)

### Quickstart
Head on over to our official docs to get started: [https://docs.astra.datastax.com/docs/astra-rest-client](https://docs.astra.datastax.com/docs/astra-rest-client)

### Testing locally with Stargate
Start up a local instance of Stargate before running tests:
```sh
docker run --name stargate \
  -p 8080:8080 -p 8081:8081 \
  -p 8082:8082 -p 127.0.0.1:9042:9042 \
  -e CLUSTER_NAME=stargate \
  -e CLUSTER_VERSION=6.8 \
  -e DEVELOPER_MODE=true \
  -e DSE=1 \
  stargateio/stargate-dse-68:v1.0.15
``
