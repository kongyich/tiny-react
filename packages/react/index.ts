import { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import { jsx, isValidElement as isValidElementFn } from './src/jsx';
import currentDispatcher from './src/currentDispatcher';
import currentBatchConfig from './src/currentBatchConfig';

export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

export const useTransition: Dispatcher['useTransition'] = () => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useTransition();
};

export const useEffect: Dispatcher['useEffect'] = (create, deps) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useEffect(create, deps);
};

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher,
	currentBatchConfig
};

export const version = '0.0.1';
export const createElement = jsx;
export const isValidElement = isValidElementFn;
