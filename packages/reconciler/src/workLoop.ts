import { scheduleMicroTask } from 'hostConfig';
import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import {
	FiberNode,
	FiberRootNode,
	createWorkInProgress,
	PendingPassiveEffects
} from './fiber';
import {
	Flags,
	MutationMask,
	NoFlags,
	PassiveEffect,
	PassiveMask
} from './fiberFlags';
import {
	Lane,
	NoLane,
	SyncLane,
	getHighestPriorityLane,
	markRootfinished,
	mergeLanes
} from './fiberLanes';
import { HostRoot } from './workTags';
import { flushSyncCallbacks, scheduleSyncCallback } from './SyncTaskQueue';
import {
	unstable_scheduleCallback as scheduleCallback,
	unstable_NormalPriority as NormalPriority
} from 'scheduler';
import { Effect } from './fiberHooks';
import { HookHasEffect, Passive } from './hookEffectTags';

// 当前正在执行fiberNode
let workInProgress: FiberNode | null = null;
// 本次更新的lane
let wipRootRenderLane: Lane = NoLane;

let rootDoesHasPassiveEffects = false;

function preparereFreshStack(root: FiberRootNode, lane: Lane) {
	workInProgress = createWorkInProgress(root.current, {});
	wipRootRenderLane = lane;
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
	const root = markUpdateFromFiberToRoot(fiber);
	markRootUpdated(root, lane);
	ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root: FiberRootNode) {
	const updateLane = getHighestPriorityLane(root.pendingLanes);
	if (updateLane === NoLane) {
		return;
	}
	if (updateLane === SyncLane) {
		// 同步优先级 微任务调度
		if (__DEV__) {
			console.warn('微任务调度优先级：', updateLane);
		}
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
		scheduleMicroTask(flushSyncCallbacks);
	} else {
		// 其他优先级，使用宏任务调度
	}
	// renderRoot(root);
}

function markRootUpdated(root: FiberRootNode, lane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
	const nextLane = getHighestPriorityLane(root.pendingLanes);

	if (nextLane !== SyncLane) {
		// 比SyncLane优先级低的
		// NoLane
		ensureRootIsScheduled(root);
		return;
	}

	if (__DEV__) {
		console.warn('render阶段开始');
	}

	// 初始化
	preparereFreshStack(root, lane);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误');
			}
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	root.finishedLane = lane;
	wipRootRenderLane = NoLane;

	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) return;

	if (__DEV__) {
		console.warn('commit阶段开始');
	}

	const lane = root.finishedLane;

	if (lane === NoLane && __DEV__) {
		console.warn('commit阶段finishedLane不应该为NoLane');
	}

	// 重置
	root.finishedWork = null;
	root.finishedLane = NoLane;

	markRootfinished(root, lane);

	if (
		(finishedWork.flags & PassiveMask) !== NoFlags ||
		(finishedWork.subtreeFlags & PassiveMask) !== NoFlags
	) {
		if (!rootDoesHasPassiveEffects) {
			rootDoesHasPassiveEffects = true;
			// 调度副作用
			scheduleCallback(NormalPriority, () => {
				// 执行副作用
				flushPassiveEffect(root.pendingPassiveEffect);
				return;
			});
		}
	}

	// 三个子阶段分别执行的操作
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork, root);

		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}

	rootDoesHasPassiveEffects = false;
	ensureRootIsScheduled(root);
}

function flushPassiveEffect(pendingPassiveEffects: PendingPassiveEffects) {
	pendingPassiveEffects.unmount.forEach((effect) => {
		commitHookEffectListUnmount(Passive, effect);
	});
	pendingPassiveEffects.unmount = [];

	pendingPassiveEffects.update.forEach((effect) => {
		commitHookEffectListDestory(Passive | HookHasEffect, effect);
	});

	pendingPassiveEffects.update.forEach((effect) => {
		commitHookEffectListCreate(Passive | HookHasEffect, effect);
	});

	pendingPassiveEffects.update = [];
	flushSyncCallbacks();
}

function commitHookEffectList(
	flags: Flags,
	lastEffect: Effect,
	callback: (effect: Effect) => void
) {
	let effect = lastEffect.next as Effect;

	do {
		if ((effect.tag & flags) === flags) {
			callback(effect);
		}
		effect = effect.next as Effect;
	} while (effect !== lastEffect.next);
}

export function commitHookEffectListUnmount(flags: Flags, lastEffect: Effect) {
	commitHookEffectList(flags, lastEffect, (effect) => {
		const destory = effect.destory;
		if (typeof destory === 'function') {
			destory();
		}

		effect.tag &= ~HookHasEffect;
	});
}

export function commitHookEffectListDestory(flags: Flags, lastEffect: Effect) {
	commitHookEffectList(flags, lastEffect, (effect) => {
		const destory = effect.destory;
		if (typeof destory === 'function') {
			destory();
		}
	});
}

export function commitHookEffectListCreate(flags: Flags, lastEffect: Effect) {
	commitHookEffectList(flags, lastEffect, (effect) => {
		const create = effect.create;
		if (typeof create === 'function') {
			effect.destory = create();
		}
	});
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber, wipRootRenderLane);
	fiber.memoizedProps = fiber.pendingProps;
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}

		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
