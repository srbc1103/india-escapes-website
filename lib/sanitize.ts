
export const sanitizeGeneric = (doc: any) => ({
  id: doc.$id,
  ...Object.fromEntries(
    Object.entries(doc).filter(([k]) => !k.startsWith("$"))
  ),
});