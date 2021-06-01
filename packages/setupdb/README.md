# @astrajs/setupdb

## Prerequisites
* node.js version 15+
* npm version 7+
* These can be updated using instructions [here](https://www.whitesourcesoftware.com/free-developer-tools/blog/update-node-js/).

## Getting the module
The easiest way to grab this for use in your project is to do the following:
* Make sure you have the most recent npm: `npm install -g npm@latest`
* Install astra-js `npm install -g @astrajs/setupdb`.
* Run the command: `npm exec @astrajs/setupdb`

Alternately, you can clone this repository and run `npm install` to pull in requirements.

## Running the module
To setup your ASTRA instance, you want to run `npm exec @astrajs/setupdb`
  If you get "npm exec not found" try `npx @astrajs/setupdb`

This will do the following:
* Have you go to your [Astra Database](https://datastx.io/workshops) to register or login. There is no credit card required to sign up. The 'Pay as you go' option gives you a huge amount of transactions for free:
   * 30 million reads
   * 5 million writes
   * 40 gigabytes of storage
* Give steps to grab a Database Administrator Token and paste it into the input field
* Ask you what database you want to use (default, existing, create)
* Create or access the database
* Create/update an .env file in the project root
* Create/update an .astrarc file in your home directory
  * This can be used by httpie-astra `pip3 install httpie-astra`
  * It can also be used by the @astra/collections and @astra/rest node modules

## Specify the database and keyspace
You can run the script and tell it which database/keyspace to use by using:
`npm exec astra-setup databasename keyspacename`