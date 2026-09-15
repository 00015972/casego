import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCategoryTree,
  groupProductsByCategory,
} from "../src/lib/storefront/catalog.ts";
import type { CatalogResponse, Product } from "../src/lib/storefront/types.ts";

function product(
  id: number,
  categoryId: number,
  categoryName: string,
  parentId: number | null = null,
  parentName: string | null = null,
): Product {
  return {
    id,
    name: `Product ${id}`,
    sku: String(id),
    description: "",
    category_id: categoryId,
    category_name: categoryName,
    category_parent_id: parentId,
    category_parent_name: parentName,
    image: "",
    stock_type: "tracked",
    stock: 1,
    in_stock: true,
    has_variants: false,
    variants: [],
    units: [],
    discount_percent: 0,
    product_type: "",
    attributes: {},
  };
}

test("category tree preserves ERP encounter order instead of alphabetizing", () => {
  const catalog: CatalogResponse = {
    store: "casego",
    results: [
      product(1, 20, "Second"),
      product(2, 32, "Child B", 30, "First"),
      product(3, 31, "Child A", 30, "First"),
    ],
    show_stock: true,
    show_images: true,
    category_images: [],
  };

  const tree = buildCategoryTree(catalog);

  assert.deepEqual(tree.map((category) => category.name), ["Second", "First"]);
  assert.deepEqual(tree[1]?.children.map((category) => category.name), [
    "Child B",
    "Child A",
  ]);
});

test("products are grouped by top-level category without changing row order", () => {
  const products = [
    product(1, 20, "Second"),
    product(2, 32, "Child B", 30, "First"),
    product(3, 31, "Child A", 30, "First"),
    product(4, 32, "Child B", 30, "First"),
  ];
  const tree = buildCategoryTree({
    store: "casego",
    results: products,
    show_stock: true,
    show_images: true,
    category_images: [],
  });

  assert.deepEqual(
    groupProductsByCategory(tree, products).map((group) => ({
      category: group.category.name,
      products: group.products.map((item) => item.id),
    })),
    [
      { category: "Second", products: [1] },
      { category: "First", products: [2, 3, 4] },
    ],
  );
});
