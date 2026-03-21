import { NextResponse } from "next/server";
import { account, databases, storage } from "../../../lib/appwrite";
import { COLLECTIONS, DBID, HASH, LIST_LIMIT, REGIONS } from "../../../constants";
import { ID, Query } from "appwrite";

// Cache duration helper - returns appropriate cache headers based on endpoint
function getCacheHeaders(ep) {
  const cacheConfigs = {
    // Long cache (1 hour) - rarely changing data
    'items-list': 'public, s-maxage=3600, stale-while-revalidate=7200',
    'regions': 'public, s-maxage=3600, stale-while-revalidate=7200',

    // Short cache (3 minutes) - frequently updated data (packages, deals)
    'packages-list': 'public, s-maxage=180, stale-while-revalidate=360',
    'detail': 'public, s-maxage=180, stale-while-revalidate=360',
    'package-complete': 'public, s-maxage=180, stale-while-revalidate=360',
    'deals-packages': 'public, s-maxage=180, stale-while-revalidate=360',
    'labels-packages': 'public, s-maxage=180, stale-while-revalidate=360',
    'related-packages': 'public, s-maxage=180, stale-while-revalidate=360',
    'package_component': 'public, s-maxage=180, stale-while-revalidate=360',
    'itinerary': 'public, s-maxage=180, stale-while-revalidate=360',
    'expenses': 'public, s-maxage=180, stale-while-revalidate=360',
    'inclusions': 'public, s-maxage=180, stale-while-revalidate=360',
    'exclusions': 'public, s-maxage=180, stale-while-revalidate=360',
    'images': 'public, s-maxage=180, stale-while-revalidate=360',

    // Very short cache (1 minute) - dynamic data
    'search': 'public, s-maxage=60, stale-while-revalidate=120',

    // No cache - mutations
    'create': 'no-store',
  };

  return cacheConfigs[ep] || 'public, s-maxage=180, stale-while-revalidate=360';
}

/* --------------------------------------------------------------
   Sanitizer – removes every property whose key starts with "$"
   -------------------------------------------------------------- */
export const sanitizeGeneric = (doc) => ({
  id: doc.$id,
  createdAt: doc.$createdAt,
  ...Object.fromEntries(
    Object.entries(doc).filter(([k]) => !k.startsWith("$"))
  ),
});


const sanitize = (item) => {
  if (Array.isArray(item)) return item.map(sanitizeGeneric);
  return sanitizeGeneric(item);
};


async function fetchPackages(payload = {}) {
  let {
    category = null,
    tag = null,
    location = null,
    activity = null,
    accommodation = null,
    destination_id = null,
    limit = null,
    featured = false,               // <-- new flag
  } = payload;

  const data = { packages: [], status: "", message: "" };
  const packageIds = new Set();

  try {
    // ── 1. Base queries that are always applied ───────
    const alwaysQueries = [Query.equal("active", true)];

    // ── 2. Direct filters on PACKAGES (apply featured when needed) ───────
    const pkgQueries = featured
      ? [...alwaysQueries, Query.equal("featured", true)]
      : alwaysQueries;

    if (category) {
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [...pkgQueries, Query.contains("categories", category)]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    if (tag) {
      const normalizedTag = tag.trim().toLowerCase();
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [
          ...pkgQueries,
          Query.or([
            Query.contains("tags", normalizedTag),
            Query.contains("tags", ` ${normalizedTag}`),
            Query.contains("tags", `${normalizedTag},`),
            Query.contains("tags", `,${normalizedTag}`),
            Query.contains("tags", ` ${normalizedTag},`),
            Query.contains("tags", `, ${normalizedTag}`),
            Query.contains("tags", `, ${normalizedTag},`),
          ]),
        ]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    if (destination_id) {
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [...pkgQueries, Query.contains("destinations", destination_id)]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    // ── 3. Metadata filters via ITINERARY ───────────────────────
    const searchMetadata = async (field, id) => {
      const resp = await databases.listDocuments(DBID, COLLECTIONS.ITINERARY, [
        Query.contains(`${field}.id`, id),
      ]);
      resp.documents.forEach(doc => {
        if (doc.package_id) packageIds.add(doc.package_id);
      });
    };

    if (location) await searchMetadata("location_metadata", location);
    if (activity) await searchMetadata("activity_metadata", activity);
    if (accommodation) await searchMetadata("accommodation_metadata", accommodation);

    // ── 4. Featured-only branch (NEW: handles case with ONLY featured=true) ──
    if (featured && packageIds.size === 0) {
      // No other filters → fetch ALL featured packages directly
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [
          ...pkgQueries,  // active + featured
          Query.orderDesc("$createdAt"),
        ]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    // ── 5. No filters at all → empty result ───────────────────────
    const hasAnyFilter =
      category ||
      tag ||
      location ||
      activity ||
      accommodation ||
      destination_id ||
      featured;

    if (!hasAnyFilter) {
      data.status = "success";
      data.packages = [];
      return data;
    }

    // ── 6. If we have IDs but featured===true, we must re-filter them ─────
    if (packageIds.size === 0) {
      data.status = "success";
      data.packages = [];
      return data;
    }

    // ── 7. Final fetch (batched) ─────────────────────────────────────
    const ids = Array.from(packageIds);
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    const all = [];

    for (const batch of batches) {
      // Base queries for the final pull
      let finalQueries = [
        Query.equal("active", true),
        Query.orderDesc("$createdAt"),
      ];

      // **Always** enforce featured when requested
      if (featured) finalQueries.push(Query.equal("featured", true));

      // Add ID filter
      if (batch.length === 1) {
        finalQueries.push(Query.equal("$id", batch[0]));
      } else {
        finalQueries.push(Query.or(batch.map(id => Query.equal("$id", id))));
      }

      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        finalQueries
      );

      all.push(...resp.documents);

      if (limit && all.length >= limit) break;
    }

    const result = all
      .slice(0, limit || undefined)
      .map(sanitizeGeneric);

    data.status = "success";
    data.packages = result;
  } catch (error) {
    data.status = "error";
    data.message = error.message || "Failed to fetch packages";
  }

  return data;
}

async function fetchPackagesForDeals(deals = []) {
  const data = { items: [], status: "", message: "" };

  try {
    // 1. Collect all unique package IDs from all deals
    const packageIdSet = new Set();
    for (const deal of deals) {
      for (const pid of deal.packages ?? []) {
        packageIdSet.add(pid);
      }
    }

    // 2. If no package IDs → return empty packages
    if (packageIdSet.size === 0) {
      data.deals = deals.map(deal => ({
        name: deal.name,
        url: deal.url,
        discount_rate: deal.discount_rate,
        packages: []
      }));
      data.status = "success";
      return data;
    }

    // 3. Split IDs into 100-doc batches
    const ids = Array.from(packageIdSet);
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    // 4. Fetch all packages in parallel
    const allPkgDocs = [];
    await Promise.all(
      batches.map(async (batch) => {
        const queries = [
          Query.equal("active", true),
          Query.or(batch.map(id => Query.equal("$id", id))),
          Query.orderDesc("$createdAt")
        ];

        const resp = await databases.listDocuments(
          DBID,
          COLLECTIONS.PACKAGES,
          queries
        );
        allPkgDocs.push(...resp.documents);
      })
    );

    // 5. Parse deal_metadata safely & build lookup map
    const pkgMap = {}; // pkgId → sanitized package
    const pkgDealNameMap = {}; // pkgId → deal name (from metadata)

    for (const doc of allPkgDocs) {
      const sanitized = sanitizeGeneric(doc);
      pkgMap[doc.$id] = sanitized;

      // Safely parse deal_metadata
      let metadata = null;
      if (doc.deal_metadata) {
        try {
          metadata = JSON.parse(doc.deal_metadata);
        } catch (e) {
          console.warn(`Invalid JSON in deal_metadata for package ${doc.$id}`);
        }
      }

      // Store the deal name this package belongs to
      if (metadata && typeof metadata.name === "string") {
        pkgDealNameMap[doc.$id] = metadata.name;
      }
    }

    // 6. Enrich deals — only include packages where deal_metadata.name matches
    data.items = deals.map(deal => {
      const matchingPackages = (deal.packages ?? [])
        .map(pid => {
          const pkg = pkgMap[pid];
          const metadataDealName = pkgDealNameMap[pid];
          // Only include if metadata exists and name matches
          if (pkg && metadataDealName === deal.name) {
            return pkg;
          }
          return null;
        })
        .filter(Boolean);

      return {
        name: deal.name,
        url: deal.url,
        discount_rate: deal.discount_rate,
        packages: matchingPackages
      };
    });

    data.status = "success";
  } catch (error) {
    data.status = "error";
    data.message = error.message || "Failed to fetch packages for deals";
  }

  return data;
}

async function fetchPackagesForLabels(labels = []) {
  const data = { items: [], status: "", message: "" };

  try {
    // 1. Collect all unique package IDs
    const packageIdSet = new Set();
    for (const label of labels) {
      for (const pid of label.packages ?? []) {
        packageIdSet.add(pid);
      }
    }

    // 2. No IDs → return empty packages for every label
    if (packageIdSet.size === 0) {
      data.labels = labels.filter(e=>e !== null).map(label => ({
        name: label.name,
        url: label.url,
        description: label.description,
        packages: []
      }));
      data.status = "success";
      return data;
    }

    // 3. Split into 100-doc batches (Appwrite limit)
    const ids = Array.from(packageIdSet);
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    // 4. Fetch all packages in parallel
    const allPkgDocs = [];
    await Promise.all(
      batches.map(async (batch) => {
        const queries = [
          Query.equal("active", true),
          Query.or(batch.map(id => Query.equal("$id", id))),
          Query.orderDesc("$createdAt")
        ];

        const resp = await databases.listDocuments(
          DBID,
          COLLECTIONS.PACKAGES,
          queries
        );
        allPkgDocs.push(...resp.documents);
      })
    );

    // 5. Build lookup map: pkgId → sanitized package
    const pkgMap = {};
    for (const doc of allPkgDocs) {
      pkgMap[doc.$id] = sanitizeGeneric(doc);
    }

    // 6. Enrich each label with full package objects
    data.items = labels.map(label => ({
      name: label.name,
      url: label.url,
      description: label.description,
      packages: (label.packages ?? [])
        .map(pid => pkgMap[pid])
        .filter(Boolean)   // drop missing packages
    }));

    data.status = "success";
  } catch (error) {
    data.status = "error";
    data.message = error.message || "Failed to fetch packages for labels";
  }

  return data;
}

async function fetchItemsList({
  collection_id,
  db_id,
  limit = LIST_LIMIT,
  offset = 0,
  queries = [],
  sort = "desc",
  search_query = null,
}) {
  let data = { items: [], total: 0, status: "", message: "" };
  const dbid = db_id || DBID;
  try {
    let queryArray = [Query.limit(limit), Query.offset(offset)];
    if (sort === "asc") {
      queryArray.push(Query.orderAsc("$createdAt"));
    } else if (sort === "rand") {
      queryArray.push(Query.orderAsc("random()"));
    } else {
      queryArray.push(Query.orderDesc("$createdAt"));
    }

    // Add search query if provided
    if (search_query && search_query.trim()) {
      const trimmed = search_query.trim();
      // Use contains for case-insensitive partial matching (doesn't require fulltext index)
      queryArray.push(Query.contains("name", trimmed));
    }

    queryArray.push(...queries);

    const response = await databases.listDocuments(
      dbid,
      collection_id,
      queryArray
    );
    const items = response.documents.map(sanitizeGeneric); // <-- SANITIZE

    data.total = response.total;
    data.items = items;
    data.status = "success";
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}

async function fetchRelatedPackages({ packageID, category = [], limit = 2 }) {
  const data = { packages: [], status: "", message: "" };
  try {
    const curPkgResp = await databases.getDocument(
      DBID,
      COLLECTIONS.PACKAGES,
      packageID
    );
    if (!curPkgResp.active) {
      data.status = "success";
      data.packages = [];
      return data;
    }
    const curPrice = parseFloat(curPkgResp.price) || 0;
    const curTags = curPkgResp.tags || "";
    const priceMin = curPrice * 0.7;
    const priceMax = curPrice * 1.3;
    const candidates = new Map();

    // Category matches
    if (Array.isArray(category) && category.length) {
      const catQueries = category.map((c) => Query.contains("categories", c));
      const catResp = await databases.listDocuments(DBID, COLLECTIONS.PACKAGES, [
        Query.or(catQueries),
        Query.notEqual("$id", packageID),
        Query.equal("active", true),
      ]);
      catResp.documents.forEach((d) => {
        const id = d.$id;
        const score = (candidates.get(id)?.score || 0) + 50;
        candidates.set(id, { score, pkg: d });
      });
    }

    // Tag matches
    const tagList = (curTags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length) {
      const tagQueries = tagList.map((t) => Query.contains("tags", t));
      const tagResp = await databases.listDocuments(DBID, COLLECTIONS.PACKAGES, [
        Query.or(tagQueries),
        Query.notEqual("$id", packageID),
        Query.equal("active", true),
      ]);
      tagResp.documents.forEach((d) => {
        const id = d.$id;
        const score = (candidates.get(id)?.score || 0) + 30;
        candidates.set(id, { score, pkg: d });
      });
    }

    // Itinerary metadata matches
    const itineraryResp = await databases.listDocuments(
      DBID,
      COLLECTIONS.ITINERARY,
      [Query.equal("package_id", packageID)]
    );
    const metaIds = { location: [], activity: [], accommodation: [] };
    if (itineraryResp.documents?.length) {
      itineraryResp.documents.forEach((doc) => {
        const days = doc.days || [];
        days.forEach((dayJson) => {
          try {
            const day = JSON.parse(dayJson);
            (day.locations || []).forEach((id) => metaIds.location.push(id));
            (day.activities || []).forEach((id) => metaIds.activity.push(id));
            (day.accommodations || []).forEach(
              (id) => metaIds.accommodation.push(id)
            );
          } catch (_) {}
        });
      });
    }

    const addMetaScore = async (field, weight) => {
      if (!metaIds[field]?.length) return;
      const uniq = [...new Set(metaIds[field])];
      const queries = uniq.map((id) => Query.contains(field, id));
      const resp = await databases.listDocuments(DBID, COLLECTIONS.PACKAGES, [
        Query.or(queries),
        Query.equal("active", true),
      ]);
      resp.documents.forEach((d) => {
        const id = d.$id;
        const score = (candidates.get(id)?.score || 0) + weight;
        candidates.set(id, { score, pkg: d });
      });
    };
    await addMetaScore("locations", 50);
    await addMetaScore("activities", 15);
    await addMetaScore("accommodations", 10);

    // Price range matches
    const priceResp = await databases.listDocuments(DBID, COLLECTIONS.PACKAGES, [
      Query.greaterThanEqual("price", priceMin),
      Query.lessThanEqual("price", priceMax),
      Query.notEqual("$id", packageID),
      Query.equal("active", true),
    ]);
    priceResp.documents.forEach((d) => {
      const id = d.$id;
      const score = (candidates.get(id)?.score || 0) + 5;
      candidates.set(id, { score, pkg: d });
    });

    const sorted = Array.from(candidates.values())
      .filter((o) => o.pkg)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const result = sorted.map((o) => ({
      ...sanitizeGeneric(o.pkg), // <-- SANITIZE
      relevance_score: o.score,
    }));

    data.status = "success";
    data.packages = result;
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}


async function fetchItinerary({ pid }) {
  let data = {
    itinerary: [],
    status: "",
    message: "",
    document_id: null,
  };
  try {
    const response = await databases.listDocuments(
      DBID,
      COLLECTIONS.ITINERARY,
      [Query.equal("package_id", pid), Query.limit(1)]
    );
    if (response.documents.length === 0) {
      data.status = "error";
      data.message = "Itinerary not added for this package.";
    } else {
      data.status = "success";
      const res = response.documents[0]?.days || [];
      data.document_id = response.documents[0]?.$id || null;
      const list = res
        .map((d) => JSON.parse(d))
        .sort((a, b) => a.day - b.day);
      data.itinerary = list;
    }
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}


async function fetchExpenses({ pid }) {
  let data = {
    expenses: [],
    status: "",
    message: "",
    document_id: null,
  };
  try {
    const response = await databases.listDocuments(
      DBID,
      COLLECTIONS.EXPENSES,
      [Query.equal("package_id", pid), Query.limit(1)]
    );
    if (response.documents.length === 0) {
      data.status = "error";
      data.message = "Optional experiences not added for this package.";
    } else {
      data.status = "success";
      const res = response.documents[0]?.expenses || [];
      data.document_id = response.documents[0]?.$id || null;
      const list = res.map((d) => JSON.parse(d));
      data.expenses = list;
    }
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}

async function fetchInclusions({ pid }) {
  let data = {
    inclusions: [],
    status: "",
    message: "",
    document_id: null,
  };
  try {
    const response = await databases.listDocuments(
      DBID,
      COLLECTIONS.INCLUSIONS,
      [Query.equal("package_id", pid), Query.limit(1)]
    );
    if (response.documents.length === 0) {
      data.status = "error";
      data.message = "Inclusions not added for this package.";
    } else {
      data.status = "success";
      const res = response.documents[0]?.inclusions || [];
      data.document_id = response.documents[0]?.$id || null;
      const list = res.map((d) => JSON.parse(d));
      data.inclusions = list;
    }
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}

async function fetchExclusions({ pid }) {
  let data = {
    exclusions: [],
    status: "",
    message: "",
    document_id: null,
  };
  try {
    const response = await databases.listDocuments(
      DBID,
      COLLECTIONS.EXCLUSIONS,
      [Query.equal("package_id", pid), Query.limit(1)]
    );
    if (response.documents.length === 0) {
      data.status = "error";
      data.message = "Exclusions not added for this package.";
    } else {
      data.status = "success";
      const res = response.documents[0]?.exclusions || [];
      data.document_id = response.documents[0]?.$id || null;
      const list = res.map((d) => JSON.parse(d));
      data.exclusions = list;
    }
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}

async function fetchPackageComponent({ pid, type }) {
  let data = {
    data: [],
    status: "",
    message: "",
    document_id: null,
  };
  let collection_id = type == 'inclusions' ?  COLLECTIONS.INCLUSIONS :  type == 'exclusions' ?  COLLECTIONS.EXCLUSIONS : type == 'expenses' ? COLLECTIONS.EXPENSES : type == 'itinerary' ? COLLECTIONS.ITINERARY :  COLLECTIONS.INFO
  // let item_type = type == 'inclusions' ?  'inclusions' :  type == 'exclusions' ?  COLLECTIONS.EXCLUSIONS : type == 'expenses' ? COLLECTIONS.EXPENSES : type == 'itinerary' ? COLLECTIONS.ITINERARY :  COLLECTIONS.INFO

  try {
    const response = await databases.listDocuments(
      DBID,
      collection_id,
      [Query.equal("package_id", pid), Query.limit(1), Query.orderDesc("$createdAt")]
    );
    if (response.documents.length === 0) {
      data.status = "error";
      data.message = "Not added for this package.";
    } else {
      data.status = "success";
      const res = response.documents[0]?.[type] || [];
      data.document_id = response.documents[0]?.$id || null;
      const list = res.map((d) => JSON.parse(d));
      data.data = list;
    }
  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }
  return data;
}

async function searchPackages(payload = {}) {
  let {
    query = null,
    limit = null,
    featured = false,
  } = payload;

  const data = { packages: [], status: "", message: "" };
  const packageIds = new Set();

  // ── Stop words: IGNORED during search
  const STOP_WORDS = new Set([
    "is", "of", "am", "are", "the", "very", "a", "an", "and", "or", "in", "on", "at",
    "to", "for", "with", "by", "from", "as", "it", "this", "that", "but", "if",
    "not", "be", "was", "were", "been", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "can", "i", "you", "he",
    "she", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
    "its", "our", "their"
  ]);

  try {
    // ── 1. Validate & tokenize input
    if (!query || typeof query !== "string" || query.trim() === "") {
      data.status = "success";
      data.packages = [];
      return data;
    }

    const terms = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term && !STOP_WORDS.has(term));

    if (terms.length === 0) {
      data.status = "success";
      data.packages = [];
      return data;
    }

    // ── 2. Base queries
    const baseQueries = [Query.equal("active", true)];
    if (featured) baseQueries.push(Query.equal("featured", true));

    // ── 3. Helper: Build OR or single query
    const buildSearchQuery = (field, useContains = false) => {
      if (terms.length === 1) {
        return useContains
          ? Query.contains(field, terms[0])
          : Query.search(field, terms[0]);
      }
      const orQueries = terms.map(term =>
        useContains ? Query.contains(field, term) : Query.search(field, term)
      );
      return Query.or(orQueries);
    };

    // ── 4. Search PACKAGES: name, tags, extra_content, description
    const pkgFields = [
      { field: "name", useContains: true },
      { field: "tags", useContains: true },
    ];

    for (const { field, useContains } of pkgFields) {
      const query = buildSearchQuery(field, useContains);
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [...baseQueries, query]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    // ── 5. Search ITINERARY: fetch all docs, filter in-memory
    // Avoids schema errors by not using nested field queries
    const itineraryResp = await databases.listDocuments(DBID, COLLECTIONS.ITINERARY, [
      Query.limit(100) // Safe: max 30 packages → ~30 itineraries
    ]);

    const searchLower = terms.map(t => t.toLowerCase());

    for (const doc of itineraryResp.documents) {
      if (!doc.package_id) continue;

      let matched = false;

      // Parse days once
      const days = (doc.days || []).map(d => JSON.parse(d));

      // Search: metadata names
      const metadata = [
        ...(doc.location_metadata || []),
        ...(doc.activity_metadata || []),
        ...(doc.accommodation_metadata || [])
      ];
      for (const meta of metadata) {
        if (meta.name && searchLower.some(term => meta.name.toLowerCase().includes(term))) {
          matched = true;
          break;
        }
      }

      // Search: day title/description
      if (!matched) {
        for (const day of days) {
          const text = `${day.title || ''} ${day.description || ''}`.toLowerCase();
          if (searchLower.some(term => text.includes(term))) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        packageIds.add(doc.package_id);
      }
    }

    // ── 6. Fallback: featured + no results
    if (featured && packageIds.size === 0) {
      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        [...baseQueries, Query.orderDesc("$createdAt")]
      );
      resp.documents.forEach(d => packageIds.add(d.$id));
    }

    // ── 7. Final fetch by IDs
    if (packageIds.size === 0) {
      data.status = "success";
      data.packages = [];
      return data;
    }

    const ids = Array.from(packageIds);
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    const all = [];
    for (const batch of batches) {
      let finalQueries = [
        Query.equal("active", true),
        Query.orderDesc("$createdAt"),
      ];
      if (featured) finalQueries.push(Query.equal("featured", true));

      if (batch.length === 1) {
        finalQueries.push(Query.equal("$id", batch[0]));
      } else {
        finalQueries.push(Query.or(batch.map(id => Query.equal("$id", id))));
      }

      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        finalQueries
      );

      all.push(...resp.documents);
      if (limit && all.length >= limit) break;
    }

    const result = all
      .slice(0, limit || undefined)
      .map(sanitizeGeneric);

    data.status = "success";
    data.packages = result;

  } catch (error) {
    data.status = "error";
    data.message = error.message || "Failed to search packages";
  }

  return data;
}

async function getItemDetail({
  collection_id,
  db_id,
  document_id = null,
  url = null,
  item_type = null,
}) {
  let data = { status: "", message: "", document: null };
  let related = [];
  const dbid = db_id || DBID;

  try {
    let response;

    // 1. Direct document_id lookup
    if (document_id && !url) {
      response = await databases.getDocument(dbid, collection_id, document_id);
    }

    // 2. URL + item_type: Sequential lookup
    else if (url && !document_id && item_type) {
      const collectionMap = {
        package: COLLECTIONS.PACKAGES,
        category: COLLECTIONS.CATEGORIES,
        location: COLLECTIONS.LOCATIONS,
        deal: COLLECTIONS.DEALS,
        label: COLLECTIONS.LABELS,
        destination: COLLECTIONS.DESTINATIONS,
        blog: COLLECTIONS.BLOGS,
      };

      const targetCollection = collectionMap[item_type.toLowerCase()];
      if (!targetCollection) {
        throw new Error(`Invalid item_type: ${item_type}`);
      }

      const canonicalTypes = ["package", "deal", "destination"];

      // STEP 1: Try matching `url` field
      const urlResult = await databases.listDocuments(dbid, targetCollection, [
        Query.equal("url", url),
      ]);

      if (urlResult.documents && urlResult.documents.length > 0) {
        response = urlResult.documents[0];
      }
      // STEP 2: If not found AND item_type supports canonical_url → try canonical_url
      else if (canonicalTypes.includes(item_type.toLowerCase())) {
        const canonicalResult = await databases.listDocuments(dbid, targetCollection, [
          Query.equal("canonical_url", url),
        ]);

        if (canonicalResult.documents && canonicalResult.documents.length > 0) {
          response = canonicalResult.documents[0];
        }
      }

      // If still no match
      if (!response) {
        data.status = "error";
        data.message = `No ${item_type} found with URL: ${url}`;
        return data;
      }
    }

    // 3. Validation: either document_id or (url + item_type)
    else {
      throw new Error("Provide either document_id OR (url + item_type)");
    }

    // Active check for packages & blogs
    if ((item_type === "package" || item_type === "blog") && response.active !== true) {
      data.status = "error";
      data.message = "Package not active";
      return data;
    }

    // Related blogs
    if (item_type === "blog") {
      const relatedResult = await databases.listDocuments(dbid, COLLECTIONS.BLOGS, [
        Query.notEqual("$id", response.$id),
        Query.equal("active", true),
        Query.limit(3),
        Query.orderDesc("$createdAt")
      ]);
      related = relatedResult.documents.map(doc => sanitizeGeneric(doc));
    }

    // Success
    data.status = "success";
    data.document = sanitizeGeneric(response);
    if (related.length) data.document.related = related;

  } catch (error) {
    data.status = "error";
    data.message = error.message;
  }

  return data;
}

async function createItem({ collection_id, db_id, item_data }) {
  let data = { status: '', message: '', document: null, insert_id: null };
  const dbid = db_id || DBID;
  try {
    const response = await databases.createDocument(
      dbid,
      collection_id,
      ID.unique(),
      item_data
    );
    data.status = 'success';
    data.insert_id = response.$id;
  } catch (error) {
    data.status = 'error';
    data.message = error.message;
  }
  return data;
}


export async function fetchDestinationsWithPackagesByRegion(payload) {
  const result = [];

  try {
    const destResp = await databases.listDocuments(
      DBID,
      COLLECTIONS.DESTINATIONS,
    );
    const destinations = destResp.documents || [];

    const regionMap = {};
    const destIdSet = new Set();

    for (const d of destinations) {
      const region = d.region || "More Regions";
      if (!regionMap[region]) regionMap[region] = [];

      regionMap[region].push({
        id: d.$id,
        name: d.name ?? "",
        url: d.url ?? ""
      });
      destIdSet.add(d.$id);
    }

    const allPkgDocs = [];
    let cursor = null;

    do {
      const queries = [
        Query.equal("active", true),
        Query.orderDesc("$createdAt"),
        Query.limit(100)
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const resp = await databases.listDocuments(
        DBID,
        COLLECTIONS.PACKAGES,
        queries
      );

      allPkgDocs.push(...(resp.documents || []));
      cursor = resp.documents?.length ? resp.documents[resp.documents.length - 1].$id : null;
    } while (cursor);

    const packages = allPkgDocs
      .map(sanitizeGeneric)
      .filter(pkg => Array.isArray(pkg.destinations) && pkg.destinations.length > 0);

    const destToPackages = {};

    for (const pkg of packages) {
      for (const destId of pkg.destinations) {
        if (destIdSet.has(destId)) {
          if (!destToPackages[destId]) destToPackages[destId] = [];
          destToPackages[destId].push(pkg);
        }
      }
    }

    for (const { id: regionId, name: regionName } of REGIONS) {
      const regionDests = regionMap[regionId] || [];

      const enriched = regionDests.map(dest => ({
        name: dest.name,
        url: dest.url,
        packages: destToPackages[dest.id] || []
      }));

      result.push({
        region: regionName,
        destinations: enriched
      });
    }

    return { status: "success", data: result, message: "" };
  } catch (err) {
    console.error("[fetchDestinationsWithPackagesByRegion] error:", err);
    return {
      status: "error",
      data: [],
      message: err.message || "Failed to fetch region data"
    };
  }
}

export async function fetchImagesMetadata(payload){
  let result = []

  try {
    const destResp = await databases.listDocuments(
      DBID,
      COLLECTIONS.MEDIA_METADATA,
      [Query.limit(1000)]
    );
    const images = destResp.documents || [];
    images.forEach(img=>{
      let {url,name,alt,title} = img
      let obj = {url,name,alt,title}
      result.push(obj)
    })

    return { status: "success", data: result, message: "" };
  } catch (err) {
    console.error("[fetchImagesMetadata] error:", err);
    return {
      status: "error",
      data: [],
      message: err.message || "Failed to fetch media metadata"
    };
  }

}

// Batched package detail fetch - combines all 7 API calls into one
async function fetchPackageComplete({ url, category = [] }) {
  try {
    // Step 1: Fetch package detail using URL to get the package ID
    const packageDetail = await getItemDetail({
      collection_id: COLLECTIONS.PACKAGES,
      url: url,
      item_type: 'package'
    });

    if (packageDetail.status !== 'success' || !packageDetail.document) {
      return {
        status: 'error',
        data: null,
        message: packageDetail.message || 'Package not found'
      };
    }

    // Step 2: Extract package ID from the fetched package
    const packageID = packageDetail.document.id || packageDetail.document.$id;

    // Step 3: Fetch all other data in parallel using the package ID
    const [
      itineraryData,
      inclusionsData,
      exclusionsData,
      infoData,
      expensesData,
      relatedData
    ] = await Promise.all([
      fetchItinerary({ pid: packageID }),
      fetchInclusions({ pid: packageID }),
      fetchExclusions({ pid: packageID }),
      fetchPackageComponent({ pid: packageID, type: 'info' }),
      fetchExpenses({ pid: packageID }),
      fetchRelatedPackages({ packageID, category, limit: 3 })
    ]);

    return {
      status: 'success',
      data: {
        package: packageDetail.document,
        itinerary: itineraryData.itinerary || [],
        inclusions: inclusionsData.inclusions || [],
        exclusions: exclusionsData.exclusions || [],
        info: infoData.data || [],
        expenses: expensesData.expenses || [],
        related: relatedData.packages || [],
      },
      message: ''
    };
  } catch (error) {
    console.error('[fetchPackageComplete] error:', error);
    return {
      status: 'error',
      data: null,
      message: error.message || 'Failed to fetch package data'
    };
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const ep = url.searchParams.get("ep");
  const payload = await request.json();

  try {
    let result;

    if (ep === "packages-list") {
      result = await fetchPackages(payload);
    } else if (ep === "package-complete") {
      result = await fetchPackageComplete(payload);
    } else if (ep === "items-list") {
      result = await fetchItemsList(payload);
    } else if (ep === "related-packages") {
      result = await fetchRelatedPackages(payload);
    } else if (ep === "itinerary") {
      result = await fetchItinerary(payload);
    } else if (ep === "expenses") {
      result = await fetchExpenses(payload);
    } else if (ep === "inclusions") {
      result = await fetchInclusions(payload);
    } else if (ep === "exclusions") {
      result = await fetchExclusions(payload);
    } else if (ep === "detail") {
      result = await getItemDetail(payload);
    } else if (ep === "create") {
      result = await createItem(payload);
    } else if (ep === "deals-packages") {
      result = await fetchPackagesForDeals(payload);
    } else if (ep === "labels-packages") {
      result = await fetchPackagesForLabels(payload);
    } else if (ep === "regions") {
      result = await fetchDestinationsWithPackagesByRegion(payload);
    } else if (ep === "images") {
      result = await fetchImagesMetadata(payload);
    } else if (ep === "search") {
      result = await searchPackages(payload);
    } else if (ep === "package_component") {
      result = await fetchPackageComponent(payload);
    } else {
      return NextResponse.json(
        { status: "error", message: "Unknown endpoint" },
        { status: 404 }
      );
    }

    // Return response with appropriate cache headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': getCacheHeaders(ep),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}