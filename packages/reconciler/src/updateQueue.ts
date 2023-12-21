import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
	next: Update<any> | null;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action,
		next: null
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
	const pending = updateQueue.shared.pending;

	// 环形链表
	if (pending === null) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;

		if (action instanceof Function) {
			// baseState 1 update (x) => 4x -> memoizeState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 -> memoizeState 2
			result.memoizedState = action;
		}
	}

	return result;
};
