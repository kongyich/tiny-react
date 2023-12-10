import { FiberNode } from 'reconciler/src/fiber';
import { HostComponent, HostText } from 'reconciler/src/workTags';
import { DOMElement, updateFiberProps } from './SyntheticEvent';
import { Props } from 'shared/ReactTypes';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export function createInstance(type: string, props: Props): Instance {
	// 处理props
	const element = document.createElement(type) as unknown;

	updateFiberProps(element as DOMElement, props);
	return element as DOMElement;
}

export function appendInitialChild(
	parent: Instance | Container,
	child: Instance
) {
	parent.appendChild(child);
}

export function createTextInstance(content: string) {
	return document.createTextNode(content);
}

export const appendChildToContainer = appendInitialChild;

export function commitUpdate(fiber: FiberNode) {
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, text);
		// case HostComponent:
		// 	updateFiberProps()
		default:
			if (__DEV__) {
				console.warn('未实现的Update类型');
			}
			break;
	}
}

export function commitTextUpdate(textInstance: TextInstance, content: string) {
	textInstance.textContent = content;
}

export function removeChild(
	child: Instance | TextInstance,
	container: Container
) {
	container.removeChild(child);
}
