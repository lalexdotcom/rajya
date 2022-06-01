import { useSyncExternalStore } from "react";
import { Actions, State, Store } from ".";

export type FullStore<TStore> = TStore extends Store<
  infer TState,
  infer TActions
>
  ? TState & Omit<TActions, keyof TState>
  : never;

export const useStore = <
  TState extends State,
  TFields extends keyof TState,
  TActions extends Actions
>(
  store: Store<TState, TActions>,
  fields?: TFields[],
  full?: true
) => {
  const slice = useSyncExternalStore(
    (listener) => store.addListener(listener, fields),
    store.getState
  );
  return { ...store.getActions(), ...slice } as Pick<TState, TFields> &
    Omit<TActions, TFields | keyof TState>;
};
