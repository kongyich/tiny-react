import { Container } from 'dom/src/hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { HostComponent, HostRoot, HostText } from './workTags';

export const completeWork = (wip: FiberNode) => {
	// node
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	console.log(wip, 'wip');
	switch (wip.tag) {
		case HostComponent:
			if (current !== null || wip.stateNode) {
				// update
			} else {
				// mount
				// 构建DOM
				const instance = createInstance(wip.type);
				// 将DOM插入DOM树中
				console.log(instance, 'pppppp');
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null || !wip.stateNode) {
				// update
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
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.log('未被complete处理的节点', wip);
			}
			break;
	}
};

const appendAllChildren = (parent: Container, workInProgress: FiberNode) => {
	// 遍历workInProgress所有子孙 DOM元素，依次挂载
	let node = workInProgress.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === workInProgress) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === workInProgress) {
				return;
			}
			node = node.return;
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
