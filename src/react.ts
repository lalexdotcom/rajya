import { Actions, State, Store } from "./vanilla";
import { useSyncExternalStore } from "react";

export function useStore<TState extends State, TActions extends Actions>(store: Store<TState, TActions>) {
	const accessed = new Set<keyof TState>();
	const slice = useSyncExternalStore((listener) => store.addListener(listener, [...accessed]), store.getState);
	const actions = store.getActions();
	const sliceProxy = new Proxy(slice, {
		get(st, prop) {
			if (typeof prop !== "string") return undefined;
			if (prop in slice) {
				accessed.add(prop);
				return st[prop];
			} else {
				return actions[prop];
			}
		},
	});
	return sliceProxy as TState & Readonly<Omit<TActions, keyof TState>>;
}
