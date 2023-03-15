import { Actions, State, Store } from "./vanilla";

type StoreProxy<TState extends State, TActions extends Actions> = TState & Readonly<Omit<TActions, keyof TState>>;

export const proxy = <TState extends State, TActions extends Actions>(store: Store<TState, TActions>) => {
	const actions = store.getActions();
	return new Proxy(
		{},
		{
			get(_, prop) {
				const state = store.getState();
				if (prop in state) {
					return state[prop as keyof TState];
				} else {
					return actions?.[prop as string];
				}
			},
			set(_, prop, value) {
				if (prop in actions) return false;
				store.setState({ [prop]: value } as any);
				return true;
			},
		}
	) as StoreProxy<TState, TActions>;
};
