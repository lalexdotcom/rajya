import React from "react";
import { createRoot } from "react-dom/client";
import { createStore, useStore } from "../src";

const store = createStore({ foo: 0, bar: "value0" }, (get, set) => ({
	incFoo: () => {
		set({ foo: get().foo + 1 });
	},
	incBar: () => {
		set({ bar: get().bar + "-" });
	},
}));

const Test = () => {
	const { foo, bar, incFoo, incBar } = useStore(store);
	return (
		<div>
			<div>foo is {foo}</div>
			<div>bar from store is {store.getState().bar}</div>
			<div>bar is {bar}</div>
			<div>{Math.random()}</div>
			<button onClick={() => store.setState({ foo: foo + 1 })}>Update foo</button>
			<button onClick={() => store.setState((old) => ({ ...old, bar: old.bar + "-" }))}>Update bar</button>
			<button onClick={() => incFoo()}>Inc foo</button>
			<button onClick={() => incBar()}>Inc bar</button>
		</div>
	);
};

createRoot(document.getElementById("root")!).render(<Test />);
