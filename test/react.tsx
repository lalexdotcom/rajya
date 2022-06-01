import { createRoot } from "react-dom/client";
import { createStore, useStore, FullStore } from "../src";

const container = document.getElementById("root");
const root = createRoot(container!);

const store = createStore(
  //
  { foo: 1, bar: "Bar" },
  (set) => ({
    bar: () => {},
    updateFoo: () => set({ foo: 10 }),
    updateBar: () => set({ bar: "Updated bar" }),
  })
);

const o = { a: 1, b: 2 };

const App = () => {
  const { foo, bar, updateFoo, updateBar } = useStore(store, ["foo"]) as FullStore<
    typeof store
  >;
  return (
    <>
      <h1>Rajya test</h1>
      <div>FOO: {foo}</div>
      <div>
        <button onClick={() => store.setState((s) => ({ foo: s.foo + 1 }))}>
          setState foo
        </button>
        <button onClick={updateFoo}>updateFoo</button>
        <button onClick={() => store.setState((s) => ({ bar: s.bar + "+" }))}>
          setState bar
        </button>
        <button onClick={updateBar}>updateBar</button> {/* Won't re-render*/}
      </div>
    </>
  );
};

root.render(<App />);
