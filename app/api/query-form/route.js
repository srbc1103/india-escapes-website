import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import axios from "axios";
import { account, databases, storage } from "../../../lib/appwrite";
import { COLLECTIONS, DBID, HASH, LIST_LIMIT } from "../../../constants";
import { ID, Query } from "appwrite";


export async function POST(request) {
    let payload = await request.json();
    let data = { status: '', message: '', document: null, insert_id: null };
    const db_id = DBID;
    const collection_id = COLLECTIONS.QUERIES;
    let {
      name,
      email,
      mobile,
      destination,
      message,
      query_type,
    } = payload
    let item_data = {name,email,mobile,destination,message,query_type,metadata:JSON.stringify(payload)}
    try {
      const response = await databases.createDocument(
        db_id,
        collection_id,
        ID.unique(),
        item_data
      );
      
      data.status = 'success';
    //   data.document = response;
      data.insert_id = response.$id;
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      data.status = 'error';
      data.message = error.message;
      return NextResponse.json(data, { status: 500 });
    }
}
