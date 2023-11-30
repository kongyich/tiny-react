import { ReactElementType } from 'shared/ReactTypes';
// @ts-ignore
import { createRoot } from 'dom';

export function renderIntoDocument(element: ReactElementType) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
