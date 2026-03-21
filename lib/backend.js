import axios from "axios";
import { account, databases, storage } from "./appwrite";
import { COLLECTIONS, DBID, HASH, LIST_LIMIT } from "../constants";
import { ID, Query } from "appwrite";
import Cookies from "js-cookie";

const api = axios.create();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status == 401) {
      Data.logOut()
      window.location.href('/ie_cms/auth')
    }
    return Promise.reject(error);
  }
);

export class DataService {
  name;userID;categories;regions;images;
  constructor() {
    this.name = 'India Escapes';
    this.userID
    this.categories = null;
    this.regions = null;
    this.images = []
  }

  setUser({ name,userID }) {
    if (name) this.name = name;
    if (userID) this.userID = userID;
  }

  async logOut() {
    let data = { status: '', message: '' }
    try {
      const session = await account.getSession('current')
      if (session) {
        await account.deleteSession('current')
      }
      Cookies.remove(HASH.TOKEN)
      this.setUser({userID:null}) 
      this.name = 'India Escapes'
      this.userID = null
      data.status = 'success'
      data.message = 'Logged out successfully.'
    } catch (error) {
      data.status = 'error'
      data.message = error.message || 'Logout failed.'
    }
    return data
  }

  async check_user(){
    // return false
    let has_token = Cookies.get(HASH.TOKEN)
    if(has_token){
      let token_str = Cookies.get(HASH.TOKEN) 
      try {
        const response = await account.getSession(token_str)
        if(response && response.userId){
          this.setUser({userID:response.userId})
          return true
        }else{
          return false
        }
      } catch (error) {
        return false
      }
    }else{
      return false
    }  
  }

  async create_file({ buck_id, file, metadata }) {
    const bucket_id = buck_id || COLLECTIONS.BUCKET_ID
    let data = { status: '', message: '', file_id: null, document_id: null };
    try {
      // Upload file to storage
      const fileResponse = await storage.createFile(
        bucket_id,
        ID.unique(),
        file
      );
      const file_id = fileResponse.$id;
      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${COLLECTIONS.BUCKET_ID}/files/${file_id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      // Store metadata in collection
      const metadataResponse = await databases.createDocument(
        DBID,
        COLLECTIONS.MEDIA_METADATA,
        ID.unique(),
        {
          file_id,
          url,
          name: file.name,
          title: metadata?.title || '',
          alt: metadata?.alt || '',
          description: metadata?.description || '',
          mime_type: file.type,
        },
      );

      data.status = 'success';
      data.file_id = file_id;
      data.document_id = metadataResponse.$id;
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async list_files({ buck_id, limit = 10, offset = 0 }) {
    let data = { files: [], total: 0, status: '', message: '' };
    const bucket_id = buck_id || COLLECTIONS.BUCKET_ID
    try {
      const response = await databases.listDocuments(DBID, COLLECTIONS.MEDIA_METADATA, [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
      ]);
      data.files = response.documents;
      data.total = response.total;
      data.status = 'success';
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async update_file_metadata({ $id, metadata }) {
    let data = { status: '', message: '' };
    try {
      await databases.updateDocument(DBID, COLLECTIONS.MEDIA_METADATA, $id, metadata);
      data.status = 'success';
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async rename_file({ buck_id, file_id, $id, new_name }) {
    let data = { status: '', message: '' };
    const bucket_id = buck_id || COLLECTIONS.BUCKET_ID
    storage.updateFile(bucket_id, file_id, new_name).catch(err=>({}))
    try {
      await databases.updateDocument(DBID, COLLECTIONS.MEDIA_METADATA, $id, { name: new_name });
      data.status = 'success';
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async delete_file({ buck_id, file_id, $id }) {
    const bucket_id = buck_id || COLLECTIONS.BUCKET_ID;

    if (file_id) {
      storage.deleteFile(bucket_id, file_id).catch(() => {});
    }

    await databases.deleteDocument(DBID, COLLECTIONS.MEDIA_METADATA, $id);

    return { status: 'success' };
  }


  async login({ username, password }) {
    let data = { status: '', message: '', token: null };
    try {
      const response = await account.createEmailPasswordSession(username, password);
      if(response.$id){
        data.status = 'success';
        data.token = response.$id;
        this.setUser({userID:response.userId})
        Cookies.set(HASH.TOKEN, response.$id, { expires: 365 });
      }else{
        data.status = 'error';
        data.message = 'Login failed. Try again.';
      }
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data
  }

  async update_item({ collection_id, db_id, document_id, item_data }) {
    let data = { status: '', message: '', document: null };
    const dbid = db_id || DBID;
    try {
      const response = await databases.updateDocument(
        dbid,
        collection_id,
        document_id,
        item_data
      );
      data.status = 'success';
      data.document = response;
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async delete_item({ collection_id, db_id, document_id }) {
    let data = { status: '', message: '' };
    const dbid = db_id || DBID;
    try {
      await databases.deleteDocument(dbid, collection_id, document_id);
      data.status = 'success';
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }
  
  async fetchPackages(payload){
    let data = {packages:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=packages-list`,payload)
      data.packages = response.data.packages
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetchBlogs(payload){
    let data = {items:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=items-list`,payload,{queries:[Query.equal("active", true)]})
      data.items = response.data.items
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async searchPackages(payload){
    let data = {packages:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=search`,payload)
      data.packages = response.data.packages
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetchPackagesBundles(payload,type){
    let data = {items:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=${type}-packages`,payload)
      data.items = response.data.items
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetchRegions(payload){
    let data = {items:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=regions`,payload)
      data.items = response.data.data
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetchImages(payload){
    let data = {items:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=images`,payload)
      data.items = response.data.data
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async get_items_list(payload) {
    let data = { items: [], total: 0, status: '', message: '' };
    try {
      const response = await axios.post(`/api/package-query?ep=items-list`,payload)
      data.items = response.data.items
      data.total = response.data.total
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async get_all_items_for_export(payload) {
    let data = { items: [], total: 0, status: '', message: '' };
    try {
      // Fetch with a very high limit to get all items
      const response = await axios.post(`/api/package-query?ep=items-list`, {
        ...payload,
        limit: 10000,
        offset: 0
      });
      data.items = response.data.items;
      data.total = response.data.total;
      data.status = response.data.status;
      data.message = response.data.message;
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async create_item(payload) {
    let data = { status: '', message: '', document: null, insert_id: null };
    try {
      const response = await axios.post(`/api/package-query?ep=create`,payload)
      data.status = response.data.status
      data.message = response.data.message
      data.insert_id = response.data.insert_id;
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }

  async fetch_itinerary(pid){
    let data = {itinerary:[],status:'',message:'',document_id:null}
    try {
      const response = await axios.post(`/api/package-query?ep=itinerary`,{pid})
      data.itinerary = response.data.itinerary
      data.document_id = response.data.document_id
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetch_expenses(pid){
    let data = {expenses:[],status:'',message:'',document_id:null}
    try {
      const response = await axios.post(`/api/package-query?ep=expenses`,{pid})
      data.expenses = response.data.expenses
      data.status = response.data.status
      data.message = response.data.message
      data.document_id = response.data.document_id
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetch_inclusions(pid){
    let data = {inclusions:[],status:'',message:'',document_id:null}
    try {
      const response = await axios.post(`/api/package-query?ep=inclusions`,{pid})
      data.inclusions = response.data.inclusions
      data.status = response.data.status
      data.message = response.data.message
      data.document_id = response.data.document_id
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetch_exclusions(pid){
    let data = {exclusions:[],status:'',message:'',document_id:null}
    try {
      const response = await axios.post(`/api/package-query?ep=exclusions`,{pid})
      data.exclusions = response.data.exclusions
      data.status = response.data.status
      data.message = response.data.message
      data.document_id = response.data.document_id
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetch_package_component(pid,type){
    let data = {data:[],status:'',message:'',document_id:null}
    // let collection_id = type == 'inclusions' ?  COLLECTIONS.INCLUSIONS :  type == 'exclusions' ?  COLLECTIONS.EXCLUSIONS : type == 'expenses' ? COLLECTIONS.EXPENSES : type == 'itinerary' ? COLLECTIONS.ITINERARY :  COLLECTIONS.INFO
    try {
      const response = await axios.post(`/api/package-query?ep=package_component`,{pid,type})
      data.data = response.data.data
      data.status = response.data.status
      data.message = response.data.message
      data.document_id = response.data.document_id
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async fetchRelatedPackages(packageID) {
    let data = {packages:[],status:'',message:''}
    try {
      const response = await axios.post(`/api/package-query?ep=related-packages`,{packageID})
      data.packages = response.data.packages
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }

  async get_item_detail(payload) {
    let data = { status: '', message: '', document: null };
    try {
      const response = await axios.post(`/api/package-query?ep=detail`,payload)
      data.document = response.data.document
      data.status = response.data.status
      data.message = response.data.message
    } catch (error) {
      data.status = 'error'
      data.message = error.message
    }
    return data
  }
  

  async fetchPackageComplete({ url, category = [] }) {
    let data = {
      status: '',
      message: '',
      package: null,
      itinerary: [],
      inclusions: [],
      exclusions: [],
      info: [],
      expenses: [],
      related: []
    };
    try {
      const response = await axios.post(`/api/package-query?ep=package-complete`, {
        url,
        category
      });
      data.status = response.data.status;
      data.message = response.data.message;
      if (response.data.status === 'success' && response.data.data) {
        const { package: pkg, itinerary, inclusions, exclusions, info, expenses, related } = response.data.data;
        data.package = pkg;
        data.itinerary = itinerary;
        data.inclusions = inclusions;
        data.exclusions = exclusions;
        data.info = info;
        data.expenses = expenses;
        data.related = related;
      }
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
    }
    return data;
  }
}

let Data = new DataService();
export default Data;