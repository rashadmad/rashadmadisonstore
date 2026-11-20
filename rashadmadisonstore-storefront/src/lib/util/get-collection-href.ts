export const getCollectionHref = (handle: string) =>
  handle === "apparel" ? "/apparel" : `/collections/${handle}`
