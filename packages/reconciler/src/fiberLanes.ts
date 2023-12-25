import { FiberRootNode } from './fiber';

export type Lane = number;
export type Lanes = number;

export const SyncLane = 0b0001;
export const NoLane = 0b0000;
export const NoLanes = 0b0000;

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
	return laneA | laneB;
}

export function requestUpdateLane() {
	return SyncLane;
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
