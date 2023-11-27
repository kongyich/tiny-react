import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizeState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizeState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;

		if (action instanceof Function) {
			// baseState 1 update (x) => 4x -> memoizeState 4
			result.memoizeState = action(baseState);
		} else {
			// baseState 1 update 2 -> memoizeState 2
			result.memoizeState = action;
		}
	}

	return result;
};
