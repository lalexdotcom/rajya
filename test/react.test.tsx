import React, { useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import { createStore, proxy, useStore } from "../src";

const store = createStore({ foo: 0, bar: "value0" }, (get, set) => ({
	incFoo: () => {
		set({ foo: get().foo + 1 });
	},
	incBar: () => {
		set({ bar: get().bar + "-" });
	},
}));

const storeProxy = proxy(store);

const dateFormat = new Intl.DateTimeFormat("fr", {
	timeStyle: "full",
});

const Test = () => {
	return (
		<div>
			<h3>With spread</h3>
			<TestWithSpread />
			<h3>With object</h3>
			<TestWithObject />
		</div>
	);
};

const TestWithSpread = () => {
	const { foo, incFoo, incBar } = useStore(store);
	const [rerender, setRerender] = useState(0);

	const forceRender = () => setRerender(rerender + 1);

	const renderDate = new Date();
	return (
		<div>
			<div>foo is {foo}</div>
			<div>bar is {storeProxy.bar}</div>
			<div>
				{`${renderDate.getHours()}`.padStart(2, "0")}:{`${renderDate.getMinutes()}`.padStart(2, "0")}:
				{`${renderDate.getSeconds()}`.padStart(2, "0")}.{`${renderDate.getMilliseconds()}`.padStart(3, "0")}.
			</div>
			<button onClick={() => store.setState({ foo: foo + 1 })}>Update foo</button>
			<button onClick={() => incFoo()}>Inc foo</button>
			<button onClick={() => incBar()}>Inc bar (shouldn't re-render)</button>
			<button onClick={() => forceRender()}>Force render</button>
		</div>
	);
};

const TestWithObject = () => {
	const storeObject = useStore(store);
	const [rerender, setRerender] = useState(0);

	const forceRender = () => setRerender(rerender + 1);

	const renderDate = new Date();
	return (
		<div>
			<div>foo is {storeObject.foo}</div>
			<div>bar is {storeProxy.bar}</div>
			<div>
				{`${renderDate.getHours()}`.padStart(2, "0")}:{`${renderDate.getMinutes()}`.padStart(2, "0")}:
				{`${renderDate.getSeconds()}`.padStart(2, "0")}.{`${renderDate.getMilliseconds()}`.padStart(3, "0")}.
			</div>
			<button onClick={() => store.setState({ foo: storeObject.foo + 1 })}>Update foo</button>
			<button onClick={() => storeObject.incFoo()}>Inc foo</button>
			<button onClick={() => storeObject.incBar()}>Inc bar (shouldn't re-render)</button>
			<button onClick={() => forceRender()}>Force render</button>
		</div>
	);
};

createRoot(document.getElementById("root")!).render(<Test />);
