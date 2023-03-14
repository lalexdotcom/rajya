export type State = Record<string, unknown>;
export type Actions = Record<string, (...args: any[]) => unknown>;

type SetState<TState extends State> = {
	(partialStateOrFunction: Partial<TState> | ((previousState: TState) => Partial<TState>), replace?: false): void;
	(partialStateOrFunction: TState | ((previousState: TState) => TState), replace: true): void;
};

type GetState<TState extends State> = () => TState;

type StateInitFunction<TState extends State> = () => TState;
type ActionsInitFuction<TState extends State, TActions extends Actions> = (
	get: GetState<TState>,
	set: SetState<TState>
) => TActions;

type StateListener<TState extends State> = (state: TState, previousState: TState, properties: (keyof TState)[]) => void;

export type Store<TState extends State, TActions extends Actions = {}> = {
	setState: SetState<TState>;
	getState: GetState<TState>;
	getActions: () => TActions;
	addListener: (listener: StateListener<TState>, keys?: (keyof TState)[]) => () => void;
	clearListeners: () => void;
};

export function createStore<TState extends State>(initState: TState | StateInitFunction<TState>): Store<TState>;
export function createStore<
	TState extends State,
	TActions extends Actions,
	TInitActionFunction extends ActionsInitFuction<TState, TActions>
>(
	initState: TState | StateInitFunction<TState>,
	initActions: TInitActionFunction
): Store<TState, ReturnType<TInitActionFunction>>;
export function createStore<TState extends State, TActions extends Actions>(
	initState: TState | StateInitFunction<TState>,
	initActions?: ActionsInitFuction<TState, TActions>
) {
	let state = typeof initState === "function" ? initState() : { ...initState };
	const listeners: Map<keyof TState | undefined, Set<StateListener<TState>>> = new Map();

	const getState: GetState<TState> = () => state;
	const setState: SetState<TState> = (partialStateOrFunction, replace) => {
		const nextPartialState =
			typeof partialStateOrFunction === "function" ? partialStateOrFunction(state) : partialStateOrFunction;
		if (nextPartialState !== state) {
			const previousState = state;
			state = replace ? <TState>nextPartialState : Object.assign({}, state, nextPartialState);

			if (listeners.size) {
				const updated: Set<keyof TState> = new Set();
				const handlers = new Set<StateListener<TState>>();

				// Get keys from merged previousState and actual state
				Object.keys({ ...previousState, ...state }).forEach((k) => {
					// If key property is updated, add to set
					if (state[k] !== previousState[k]) {
						updated.add(k);
						listeners.get(k)?.forEach((l) => handlers.add(l));
					}
				});
				if (updated.size) listeners.get(undefined)?.forEach((l) => handlers.add(l));
				handlers.forEach((h) => h(state, previousState, [...updated]));
			}
		}
	};

	const addListener = (listener: StateListener<TState>, keys?: (keyof TState)[]) => {
		const addedToSets: Set<any>[] = [];
		if (keys) {
			keys?.forEach((k) => {
				const listenerSet = listeners.get(k) ?? new Set();
				listenerSet.add(listener);
				addedToSets.push(listenerSet);
				listeners.set(k, listenerSet);
			});
		} else {
			const listenerSet = listeners.get(undefined) ?? new Set();
			listenerSet.add(listener);
			addedToSets.push(listenerSet);
			listeners.set(undefined, listenerSet);
		}
		return () => {
			addedToSets.forEach((s) => s.delete(listener));
		};
	};

	const clearListeners = () => {
		listeners.clear();
	};

	const actions = initActions?.(getState, setState) ?? {};

	return {
		setState,
		getState,
		getActions: () => actions,
		addListener,
		clearListeners,
	};
}
