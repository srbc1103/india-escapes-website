import { databases } from "../../../../lib/appwrite"
import { COLLECTIONS, DBID } from "../../../../constants"
import { Query } from "appwrite"
import CategoryClient from "./CategoryClient"

export async function generateMetadata({ params }) {
  const { category } = await params
  try {
    const result = await databases.listDocuments(DBID, COLLECTIONS.CATEGORIES, [
      Query.equal("url", category),
    ])
    if (result.documents.length > 0) {
      const doc = result.documents[0]
      const title = doc.meta_title || doc.page_heading || doc.name || category
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
  return { title: category }
}

export default function CategoryPage({ params }) {
  return <CategoryClient params={params} />
}
