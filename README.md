# rajya

Keep your state simple

rajya is an unoptionated, vanilla, dependency-free state management library, widely inspired by zustand, with a bit of valtio...

A react hook is provided and every user of other frameworks are welcome to PR an adaptater.

Nothing really new, the point is to provide type safety, good DX and readability.
...and auto render optimization for React.

## Install

`pnpm add rajya`

## Usage

### Basic store

```typescript
const store = createStore(
	{
		foo: 10,
		bar: "barValue",
	},
	(get, set) => ({
		incFoo: () => set({ foo: get().foo + 1 }),
	})
);

// Get state, get actions
const state = store.getState();
const { incFoo } = store.getActions();

// With partial state
store.setState({ foo: 25 });

// With previous state
store.setState((previousState) => ({ foo: previousState + 1 }));

// You can listen any state change
store.addListener((state, oldState) => {
	console.log("State changed from", oldState, "to", state);
});

// Or change only on selected properties
// with optional second parameter
store.addListener(
	(state, oldState) => {
		console.log("State 'foo' changed from", oldState, "to", state);
	},
	["foo"]
);
```

### Proxy

The `proxy` function create a proxy containing properties and actions for better DX (state overrides actions if same name is used)

```typescript
const store = proxy(
	createStore(
		{
			foo: 10,
			bar: "barValue",
		},
		(get, set) => ({
			incFoo: () => set({ foo: get().foo + 1 }),
		})
	)
);

store.foo += 10;
store.incFoo();
```

### React

The `useStore` hook provides auto re-render optimization

```tsx
const store = createStore({ foo: 0, bar: "barValue" }, (get, set) => ({
	incFoo: () => {
		set({ foo: get().foo + 1 });
	},
	incBar: () => {
		set({ bar: get().bar + "-" });
	},
}));

const Test = () => {
	const { foo, incFoo, incBar } = useStore(store);
	return (
		<div>
			<div>foo is {foo}</div>
			<div>bar from store is {store.getState().bar}</div>
			<div>{Math.random()}</div>
			// Will re-render
			<button onClick={() => store.setState({ foo: foo + 1 })}>Update foo</button>
			// Will not re-render as 'bar' isn't read from the hook but from the store
			<button onClick={() => store.setState((old) => ({ ...old, bar: old.bar + "-" }))}>Update bar</button>
			// Will re-render
			<button onClick={() => incFoo()}>Inc foo</button>
			// Will not re-render
			<button onClick={() => incBar()}>Inc bar</button>
		</div>
	);
};
```
