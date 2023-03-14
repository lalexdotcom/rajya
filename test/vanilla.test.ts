import { describe, expect, test } from "@jest/globals";

import { createStore } from "../src";

describe("Test vanilla rajya store", () => {
	let fooValue = 0;
	const store = createStore({ foo: fooValue, bar: "value0" }, (get, set) => ({
		incFoo: (by: number) => {
			set({ foo: get().foo + by });
		},
	}));

	test("Test setState with partial state", () => {
		store.setState({ foo: ++fooValue });
		expect(store.getState()).toEqual({ foo: fooValue, bar: "value0" });
	});

	test("Test setState with function", () => {
		store.setState((previousState) => {
			const newPartialState = { foo: (fooValue = previousState.foo + 1) };
			return newPartialState;
		});
		expect(store.getState()).toEqual({ foo: fooValue, bar: "value0" });
	});

	test("Test action", () => {
		const by = 2;
		store.getActions().incFoo(by);
		fooValue += by;
		expect(store.getState()).toEqual({ foo: fooValue, bar: "value0" });
	});

	test("Test setState with replace", () => {
		store.setState({ foo: ++fooValue, bar: "value1" }, true);
		expect(store.getState()).toEqual({ foo: fooValue, bar: "value1" });
	});

	test("Test globalListener", () => {
		let listenersDispatched = 0;
		const removeListener = store.addListener((state, oldState) => listenersDispatched++);

		// Value didn't changed, should not have dispatch
		store.setState({ foo: fooValue });
		expect(listenersDispatched).toBe(0);

		// Value changed, should have dispatch
		store.setState({ foo: ++fooValue });
		expect(listenersDispatched).toBe(1);

		// Listener was removed, should not have dispatch
		removeListener();
		store.setState({ foo: ++fooValue });
		expect(listenersDispatched).toBe(1);

		// Add listener then clear all listeners
		// Should not have dispatch
		store.addListener(() => listenersDispatched++);
		store.clearListeners();
		store.setState({ foo: ++fooValue });
		expect(listenersDispatched).toBe(1);
	});

	test("Test key listeners", () => {
		let listenersDispatched = 0;
		const removeListener = store.addListener(() => listenersDispatched++, ["foo"]);

		// Value didn't changed, should not have dispatch
		store.setState({ foo: fooValue });
		expect(listenersDispatched).toBe(0);

		// Value changed, should have dispatch
		store.setState({ foo: ++fooValue });
		expect(listenersDispatched).toBe(1);

		// Value changed only for "bar", should not have dispatch
		store.setState({ bar: "value2" });
		expect(listenersDispatched).toBe(1);

		// Listener was removed, should not have dispatch
		removeListener();
		store.setState({ foo: ++fooValue });
		expect(listenersDispatched).toBe(1);
	});
});
