import { Container } from 'dom/src/hostConfig';
import { FiberNode } from './fiber';
import { NoFlags, Ref, Update } from './fiberFlags';
import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import {
	ContextProvider,
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { updateFiberProps } from 'dom/src/SyntheticEvent';
import { popProvider } from './fiberContext';

function markRef(fiber: FiberNode) {
	fiber.flags |= Ref;
}

function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}

export const completeWork = (wip: FiberNode) => {
	// node
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
				// 1. props是否变化
				// 2. 变化？update flag
				updateFiberProps(wip.stateNode, newProps);

				if (current.ref !== wip.ref) {
					markRef(wip);
				}
			} else {
				// mount
				// 构建DOM
				const instance = createInstance(wip.type, newProps);
				// 将DOM插入DOM树中
				wip.stateNode = instance;
				appendAllChildren(instance, wip);
				// 标记ref
				if (wip.ref !== null) {
					markRef(wip);
				}
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null || wip.stateNode) {
				// update
				const oldText = current?.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// mount
				// 构建DOM
				const instance = createTextInstance(newProps.content);
				// 将DOM插入DOM树中
				// appendAllChildren(instance, wip)
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
		case FunctionComponent:
		case Fragment:
			bubbleProperties(wip);
			return null;
		case ContextProvider:
			const context = wip.type._context;
			popProvider(context);
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.log('未被complete处理的节点', wip);
			}
			break;
	}
};

const appendAllChildren = (parent: Container, wip: FiberNode) => {
	let node = wip.child;

	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
};

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
}
