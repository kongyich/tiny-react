import { FiberRootNode } from './fiber';
import {
	unstable_getCurrentPriorityLevel,
	unstable_ImmediatePriority,
	unstable_UserBlockingPriority,
	unstable_NormalPriority,
	unstable_IdlePriority
} from 'scheduler';

export type Lane = number;
export type Lanes = number;

export const SyncLane = 0b0001;
export const NoLane = 0b0000;
export const NoLanes = 0b0000;
// 连续的输入
export const InputContinuousLane = 0b0010;
// 默认
export const DefaultLane = 0b0100;
// 空闲
export const IdleLane = 0b1000;

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
	return laneA | laneB;
}

export function requestUpdateLane() {
	// 从上下文环境中获取优先级
	const currentSchedulerPriority = unstable_getCurrentPriorityLevel();

	const lane = schedulerPriorityToLane(currentSchedulerPriority);
	return lane;
}

// 越小，优先级越高，始终返回最靠右的那一位
// pendingLans = 0b0011
// 返回           0b0001
export function getHighestPriorityLane(lanes: Lanes): Lane {
	return lanes & -lanes;
}

export function markRootfinished(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}

export function lanesToSchedulerPriority(lans: Lanes) {
	const lane = getHighestPriorityLane(lans);

	if (lane === SyncLane) {
		return unstable_ImmediatePriority;
	}

	if (lane === InputContinuousLane) {
		return unstable_UserBlockingPriority;
	}

	if (lane === DefaultLane) {
		return unstable_NormalPriority;
	}
	return unstable_IdlePriority;
}

export function schedulerPriorityToLane(schedulerPriority: number) {
	if (schedulerPriority === unstable_ImmediatePriority) {
		return SyncLane;
	}
	if (schedulerPriority === unstable_UserBlockingPriority) {
		return InputContinuousLane;
	}
	if (schedulerPriority === unstable_NormalPriority) {
		return DefaultLane;
	}
	return NoLane;
}
