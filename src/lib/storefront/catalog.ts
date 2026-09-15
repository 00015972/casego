import type { CatalogResponse, Category, Product } from "./types";

/**
 * The API returns no category tree — each product just carries its category
 * and that category's parent. The tree is rebuilt here from the product rows.
 */
export function buildCategoryTree(catalog: CatalogResponse): Category[] {
  const images = new Map(catalog.category_images.map((c) => [c.id, c.image]));
  const nodes = new Map<number, Category>();

  const ensure = (id: number, name: string, parentId: number | null) => {
    const existing = nodes.get(id);
    if (existing) {
      // A leaf seen before its parent was known still needs the link.
      if (existing.parentId === null && parentId !== null) existing.parentId = parentId;
      return existing;
    }
    const node: Category = {
      id,
      name,
      parentId,
      image: images.get(id),
      children: [],
      count: 0,
    };
    nodes.set(id, node);
    return node;
  };

  for (const product of catalog.results) {
    if (product.category_id && product.category_name) {
      ensure(product.category_id, product.category_name, product.category_parent_id).count++;
    }
    if (product.category_parent_id && product.category_parent_name) {
      ensure(product.category_parent_id, product.category_parent_name, null);
    }
  }

  const roots: Category[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId !== null ? nodes.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
      parent.count += node.count;
    } else {
      roots.push(node);
    }
  }

  // Map preserves insertion order, so roots and children now follow the first
  // order in which the ERP sends them instead of being re-sorted by name.
  return roots;
}

export interface CategoryProductGroup {
  category: Category;
  products: Product[];
}

/** Groups the catalog by top-level category while preserving ERP product order. */
export function groupProductsByCategory(
  categories: Category[],
  products: Product[],
): CategoryProductGroup[] {
  const rootForCategory = new Map<number, number>();

  const indexCategory = (category: Category, rootId: number) => {
    rootForCategory.set(category.id, rootId);
    category.children.forEach((child) => indexCategory(child, rootId));
  };

  categories.forEach((category) => indexCategory(category, category.id));

  const grouped = new Map<number, Product[]>(
    categories.map((category) => [category.id, []]),
  );

  for (const product of products) {
    if (product.category_id === null) continue;
    const rootId = rootForCategory.get(product.category_id);
    if (rootId !== undefined) grouped.get(rootId)?.push(product);
  }

  return categories
    .map((category) => ({
      category,
      products: grouped.get(category.id) ?? [],
    }))
    .filter((group) => group.products.length > 0);
}

/** Matches best-seller IDs against the loaded catalog, preserving API order. */
export function productsByIds(ids: number[], products: Product[]): Product[] {
  const byId = new Map(products.map((p) => [String(p.id), p]));
  return ids
    .map((id) => byId.get(String(id)))
    .filter((p): p is Product => Boolean(p));
}

/** Lowest price across units and variants, in the store's own currency. */
export function startingPrice(product: Product): number {
  const candidates = [
    ...product.units.map((u) => u.price),
    ...product.variants.map((v) => v.price),
  ].filter((n) => typeof n === "number" && n > 0);

  return candidates.length ? Math.min(...candidates) : 0;
}

export function isOutOfStock(product: Product): boolean {
  if (product.has_variants && product.variants.length > 0) return !product.in_stock;
  return product.stock_type === "tracked" && (product.stock ?? 0) <= 0;
}

/** Products in the same category, nearest in price first. No API call. */
export function similarProducts(
  product: Product,
  all: Product[],
  limit = 10,
): Product[] {
  const sameCategory: Product[] = [];
  const sameParent: Product[] = [];

  for (const other of all) {
    if (other.id === product.id) continue;
    if (product.category_id && other.category_id === product.category_id) {
      sameCategory.push(other);
    } else if (
      product.category_parent_id &&
      other.category_parent_id === product.category_parent_id
    ) {
      sameParent.push(other);
    }
  }

  const base = startingPrice(product);
  const byCloseness = (list: Product[]) =>
    [...list].sort(
      (a, b) => Math.abs(startingPrice(a) - base) - Math.abs(startingPrice(b) - base),
    );

  return [...byCloseness(sameCategory), ...byCloseness(sameParent)].slice(0, limit);
}

/** Search text for a product — name, SKU and both category levels. */
function haystack(product: Product): string {
  return [
    product.name,
    product.sku,
    product.category_name,
    product.category_parent_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Word-overlap search, ranked by how many query words match. */
export function searchProducts(query: string, products: Product[], limit?: number): Product[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored: [Product, number][] = [];
  for (const product of products) {
    const text = haystack(product);
    const score = words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
    if (score > 0) scored.push([product, score]);
  }

  scored.sort((a, b) => b[1] - a[1]);
  const ranked = scored.map(([product]) => product);
  return limit ? ranked.slice(0, limit) : ranked;
}

function bigrams(value: string): Set<string> {
  const normalized = value.toLowerCase().replace(/[^a-z0-9а-яёўқғҳ]+/gi, " ").trim();
  const pairs = new Set<string>();
  for (let index = 0; index < normalized.length - 1; index++) {
    pairs.add(normalized.slice(index, index + 2));
  }
  return pairs;
}

/** Fuzzy fallback for misspelled searches that produced no direct matches. */
export function suggestProducts(
  query: string,
  products: Product[],
  limit = 8,
): Product[] {
  const queryPairs = bigrams(query);
  if (queryPairs.size === 0) return [];

  return products
    .map((product) => {
      const productPairs = bigrams(haystack(product));
      let overlap = 0;
      queryPairs.forEach((pair) => {
        if (productPairs.has(pair)) overlap++;
      });
      return { product, score: overlap / queryPairs.size };
    })
    .filter(({ score }) => score >= 0.22)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}

/** All descendant category IDs, so a parent category shows its children too. */
export function categoryWithDescendants(tree: Category[], id: number): Set<number> {
  const ids = new Set<number>();
  const find = (nodes: Category[]): Category | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const hit = find(node.children);
      if (hit) return hit;
    }
  };
  const collect = (node: Category) => {
    ids.add(node.id);
    node.children.forEach(collect);
  };
  const root = find(tree);
  if (root) collect(root);
  return ids;
}
