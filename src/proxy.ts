import { Actions, State, Store } from "./vanilla";

type StoreProxy<TState extends State, TActions extends Actions> = TState & Readonly<Omit<TActions, keyof TState>>;

export const proxy = <TState extends State, TActions extends Actions>(
	store: Store<TState, TActions>
): TState & Omit<TActions, keyof TState> => {
	return new Proxy(
		{},
		{
			get(_, prop) {
				const state = store.getState();
				if (prop in store) {
					return (store as any)[prop];
				} else if (prop in state) {
					return state[prop as keyof TState];
				} else {
					return store.getActions()?.[prop as string];
				}
			},
			set(_, prop, value) {
				if (prop in store.getActions()) return false;
				store.setState({ [prop]: value } as any);
				return true;
			},
		}
	) as TState & Readonly<Omit<TActions, keyof TState>>;
};
