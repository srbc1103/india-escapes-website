import { databases } from "../../../../lib/appwrite"
import { COLLECTIONS, DBID } from "../../../../constants"
import { Query } from "appwrite"
import DestinationClient from "./DestinationClient"

export async function generateMetadata({ params }) {
  const { url } = await params
  try {
    const result = await databases.listDocuments(DBID, COLLECTIONS.DESTINATIONS, [
      Query.equal("url", url),
    ])
    if (result.documents.length > 0) {
      const doc = result.documents[0]
      const title = doc.meta_title || doc.page_heading || doc.name || url
      const description = doc.meta_description || doc.description || ''
      const keywords = doc.meta_keywords || ''
      return {
        title,
        description,
        keywords,
        openGraph: { title, description },
      }
    }
  } catch (e) {}
  return { title: url }
}

export default function DestinationPage({ params }) {
  return <DestinationClient params={params} />
}
