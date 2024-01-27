export type Type = any;
export type Ref = { current: any } | ((instance: any) => void);
export type Props = any;
export type Key = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	props: Props;
	ref: Ref;
	__mark: string;
}

export type Action<State> = State | ((preveState: State) => State);

export type ReactContext<T> = {
	$$typeof: symbol | number;
	Provider: ReactProviderType<T> | null;
	_currentValue: T;
};

export type ReactProviderType<T> = {
	$$typeof: symbol | number;
	_context: ReactContext<T> | null;
};

export type Usable<T> = Thenable<T> | ReactContext<T>;

// untract
// pending
// fulfilled -> resolve
// rejected -> reject
// export type Thenable =

export type Wakeable<Result> = {
	then(
		onFulfilled: () => Result,
		onRejected: () => Result
	): void | Wakeable<Result>;
};

export type ThenableImpl<T, Result, Err> = {
	then(
		onFulfilled: (value: T) => Result,
		onRejected: (error: Err) => Result
	): void | Wakeable<Result>;
};

interface UntrackedThenable<T, Result, Err>
	extends ThenableImpl<T, Result, Err> {
	status?: void;
}

export interface FulfilledThenable<T, Result, Err>
	extends ThenableImpl<T, Result, Err> {
	status: 'fulfilled';
	value: T;
}

export interface PendingThenable<T, Result, Err>
	extends ThenableImpl<T, Result, Err> {
	status: 'pending';
}

export interface RejectedThenable<T, Result, Err>
	extends ThenableImpl<T, Result, Err> {
	status: 'rejected';
	reason: Err;
}

export type Thenable<T, Result = void, Err = any> =
	| UntrackedThenable<T, Result, Err>
	| FulfilledThenable<T, Result, Err>
	| RejectedThenable<T, Result, Err>;
