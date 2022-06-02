# rajya

Minimalistic state management for React and vanillaJS

> :warning: This package is a way for the me to experiment Opensource projects and NPM package publishing...  
> Anymawy, this way of handling global state is provinding me the personal DX experience I was waiting for (easy render optimisation in React, native propertiy change listeners, type safety without too much code, ...). Let's hope be useful to the community!

> You may notice this library is very simimar to [zustand](https://github.com/pmndrs/zustand). Actually, it's heavily inspired from it.
> Actually I'm a huge fan of @dai-shi work on [zustand](https://github.com/pmndrs/zustand) and [valtio](https://github.com/pmndrs/valtio) :pray:

## Install
Use any package manager
```shell
# NPM
npm install rajya

# YARN
yarn add rajya

# PNPM
pnpm add rajya
```

## Use

```typescript
import { createStore } from "rajya";

// Parameters are the initial state value
// and actions initializer.
// The actions initializer gets the setState and getState functions
// as parameters
const store = createStore(
  {
    foo: 1,
    bar: "BAR",
  },
  (set, get) => ({
    updateFoo: () => set((state) => ({ foo: state.foo + 1 })),
    updateBar: () => set({ bar: "BOO" }),
    addPlusToBar: () => set({ bar: get().bar + "+" }),
  })
);

// Add listener for every state property
const removeGlobalListener = store.addListener((state, previousState) =>
  console.log("State changed", previousState, "=>", state)
);

// Add listener only for 'foo' property
const removeFooListener = store.addListener(
  (state, previousState) => {
    console.log("Foo changed", previousState, "=>", state);
  },
  ["foo"]
);

store.getActions().addPlusToBar();
// State changed { foo: 1, bar: 'BAR' } => { foo: 1, bar: 'BAR+' }

store.getActions().updateFoo();
// State changed { foo: 1, bar: 'BAR+' } => { foo: 2, bar: 'BAR+' }
// Foo changed { foo: 1, bar: 'BAR+' } => { foo: 2, bar: 'BAR+' }

store.setState({ foo: 2 });
// [no output]

store.setState({ foo: 10, bar: "BRAND NEW" }, true);
// State changed { foo: 2, bar: 'BAR+' } => { foo: 10, bar: 'BRAND NEW' }
// Foo changed { foo: 2, bar: 'BAR+' } => { foo: 10, bar: 'BRAND NEW' }

store.setState({ foo: 10, bar: "BRAND NEW" }, true);
// [no output]

removeFooListener();
removeGlobalListener();
// or store.clearListeners();
```

A `useStore` hook is provided for use with React 18+, returning the state and actions.  
Actions having the same name as a property are overriden (and safely typed in TS).

```typescript
import { createRoot } from "react-dom/client";
import { createStore, useStore } from "rajya";

const container = document.getElementById("root");
const root = createRoot(container!);

const store = createStore(
  { foo: 1, bar: "Bar" },
  (set) => ({
    bar: () => {}, // Won't be returned by the hook
    updateFoo: () => set({ foo: 10 }),
    updateBar: () => set({ bar: "Updated bar" }),
  })
);

const o = { a: 1, b: 2 };

const App = () => {
  const { foo, bar, updateFoo, updateBar } = useStore(store); // bar is string, not function
  return (
    <>
      <h1>Rajya test</h1>
      <div>FOO: {foo}</div>
      <div>BAR: {bar}</div>
      <div>
        <button onClick={() => store.setState((s) => ({ foo: s.foo + 1 }))}>
          setState foo
        </button>
        <button onClick={updateFoo}>updateFoo</button>

        <button onClick={() => store.setState((s) => ({ bar: s.bar + "+" }))}>
          setState bar
        </button>
        <button onClick={updateBar}>updateBar</button>
      </div>
    </>
  );
};

root.render(<App />);
```

You can add the fields which will trigger re-render.  
The TS types prevent from using the untracked fields, but for performances reason, the full snapshot is returned.  
A FullStore utility type is provided allowing to use untracked properties.

```typescript
import { createRoot } from "react-dom/client";
import { createStore, useStore, FullStore } from "rajya";

const container = document.getElementById("root");
const root = createRoot(container!);

const store = createStore(
  { foo: 1, bar: "Bar" },
  (set) => ({
    bar: () => {},
    updateFoo: () => set({ foo: 10 }),
    updateBar: () => set({ bar: "Updated bar" }),
  })
);

const o = { a: 1, b: 2 };

const App = () => {
  const { foo, updateFoo, updateBar } = useStore(store, ["foo"]);
  {/* const { foo, bar, updateFoo, updateBar } = useStore(store, ["foo"]) as FullStore<typeof store> */}
  return (
    <>
      <h1>Rajya test</h1>
      <div>FOO: {foo}</div>
      <div>
        <button onClick={() => store.setState((s) => ({ foo: s.foo + 1 }))}>
          setState foo
        </button>
        <button onClick={updateFoo}>updateFoo</button>
        <button onClick={() => store.setState((s) => ({ bar: s.bar + "+" }))}> {/* Won't re-render*/}
          setState bar
        </button>
        <button onClick={updateBar}>updateBar</button> {/* Won't re-render*/}
      </div>
    </>
  );
};

root.render(<App />);
```
