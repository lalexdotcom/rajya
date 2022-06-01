import { createStore } from "../src";

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
    bar: () => {},
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
