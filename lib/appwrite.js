import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69441e9b00062a6520c1')

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export { client, databases, account, storage };