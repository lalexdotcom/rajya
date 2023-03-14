import { describe, expect, test } from "@jest/globals";

import { createStore, proxy } from "../src";

describe("Test vanilla rajya store", () => {
	let fooValue = 0;
	const store = createStore({ foo: fooValue, bar: "value0" });
	const prox = proxy(store);
	test("Test proxy getter", () => {
		expect(prox.foo).toBe(store.getState().foo);
	});
	test("Test proxy setter", () => {
		prox.foo = ++fooValue;
		expect(store.getState().foo).toBe(fooValue);
	});
});
