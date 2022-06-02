export type State = Record<string, unknown>;
export type Actions = Record<string, (...args: unknown[]) => unknown>;

type SetState<TState extends State> = {
  (
    partialStateOrFunction:
      | Partial<TState>
      | ((previousState: TState) => Partial<TState>),
    replace?: false
  ): void;
  (
    partialStateOrFunction: TState | ((previousState: TState) => TState),
    replace: true
  ): void;
};

type GetState<TState extends State> = () => TState;
type GetActions<TActions extends Actions> = () => TActions;

type StateListener<TState extends State> = (
  state: TState,
  previousState: TState
) => void;

type PropertiesStateListener<TState extends State> = StateListener<TState> & {
  properties?: Set<keyof TState>;
};

type AddListener<TState extends State> = (
  listener: StateListener<TState>,
  properties?: (keyof TState)[]
) => () => void;

export type Store<TState extends State, TActions extends Actions = {}> = {
  setState: SetState<TState>;
  getState: GetState<TState>;
  getActions: GetActions<TActions>;
  addListener: AddListener<TState>;
  clearListeners: () => void;
};

type StateInitializer<TState extends State> = () => TState;

type ActionsInitializer<TState extends State, TActions extends Actions> = (
  set: SetState<TState>,
  get: GetState<TState>
) => TActions;

export function createStore<TState extends State>(
  initialState: TState | StateInitializer<TState>
): Store<TState>;
export function createStore<
  TState extends State,
  TActions extends Actions,
  TActionsInitializer extends ActionsInitializer<TState, TActions>
>(
  initialState: TState | StateInitializer<TState>,
  actionsInitializer: TActionsInitializer
): Store<TState, ReturnType<TActionsInitializer>>;
export function createStore<TState extends State, TActions extends Actions>(
  initialState: TState | StateInitializer<TState>,
  actionsInitializer?: ActionsInitializer<TState, TActions>
) {
  let state: TState =
    typeof initialState === "function" ? initialState() : initialState;

  const listeners = new Set<PropertiesStateListener<TState>>();

  const getState: GetState<TState> = () => state;
  const setState: SetState<TState> = (partialStateOrFunction, replace) => {
    const nextPartialState =
      typeof partialStateOrFunction === "function"
        ? partialStateOrFunction(state)
        : partialStateOrFunction || {};
    if (nextPartialState !== state) {
      const previousState = state;

      for (const p in nextPartialState) {
        if (state[p] == nextPartialState[p]) {
          delete nextPartialState[p];
        }
      }
      const updatedProps = Object.keys(nextPartialState);
      // console.log("** Updated props", updatedProps);

      state = replace
        ? (nextPartialState as TState)
        : Object.assign({}, state, nextPartialState);

      if (updatedProps.length) {
        [...listeners]
          .filter((l) => {
            if (!l.properties?.size) return true;
            for (const updatedProp of updatedProps) {
              if (l.properties.has(updatedProp)) return true;
            }
            return false;
          })
          .forEach((l) => l(state, previousState));
      }
    }
  };
  const actions = actionsInitializer?.(setState, getState);
  const getActions: GetActions<TActions> = () => (actions || {}) as TActions;

  const addListener: AddListener<TState> = (listener, properties) => {
    let stateListener: PropertiesStateListener<TState> = listener;
    if (properties?.length) {
      stateListener = function (state, previousState) {
        listener(state, previousState);
      };
      stateListener.properties = new Set(properties);
    }
    listeners.add(stateListener);
    return () => {
      listeners.delete(stateListener);
    };
  };
  const clearListeners = () => listeners.clear();

  const store = {
    setState,
    getState,
    getActions,
    addListener,
    clearListeners,
  };

  return store;
}
