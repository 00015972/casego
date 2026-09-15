import assert from "node:assert/strict";
import test from "node:test";

import { getCartProductState } from "../src/lib/cart/product-state.ts";

test("a one-in-stock product becomes finished while showing its cart quantity", () => {
  assert.deepEqual(getCartProductState(1, 1), {
    inCart: true,
    atLimit: true,
    quantity: 1,
  });
});

test("removing the only item restores the add-to-cart state", () => {
  assert.deepEqual(getCartProductState(0, 1), {
    inCart: false,
    atLimit: false,
    quantity: 0,
  });
});

test("unlimited products never report a finished state", () => {
  assert.deepEqual(getCartProductState(4, 9999), {
    inCart: true,
    atLimit: false,
    quantity: 4,
  });
});

test("zero stock without a cart line is not treated as a cart-finished product", () => {
  assert.deepEqual(getCartProductState(0, 0), {
    inCart: false,
    atLimit: false,
    quantity: 0,
  });
});
