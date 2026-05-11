import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint('https://api.indiaescapes.in/v1')
  .setProject('69f734370019504781f8')

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export { client, databases, account, storage };