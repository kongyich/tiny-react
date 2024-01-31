import { Wakeable } from 'shared/ReactTypes';
import { FiberRootNode } from './fiber';
import { Lane } from './fiberLanes';

export function throwException(root: FiberRootNode, value: any, lane: Lane) {
  // thenable
  if (
    value !== null &&
    typeof value === 'object' &&
    typeof value.then === 'function'
  ) {
    const wakeable: Wakeable<any> = value;
    attachPingListener(root, wakeable, lane);
  }
}

function attachPingListener(
  root: FiberRootNode,
  wakeable: Wakeable<any>,
  lane: Lane
) {
  const pingCache = root.pingCache;
  let threadIDs: Set<Lane> | undefined;

  if (pingCache === null) {
    threadIDs = new Set<Lane>();
    pingCache = root.pingCache = new WeakMap<Wakeable<any>, Set<Lane>>();
    pingCache.set(wakeable, threadIDs);
  } else {
    threadIDs = pingCache.get(wakeable);
    if (threadIDs === undefined) {
      threadIDs = new Set<Lane>();
      pingCache.set(wakeable, threadIDs);
    }
  }

  // continue
  if (!threadIDs.has(lane)) {
    // 第一次进入
  }
}
