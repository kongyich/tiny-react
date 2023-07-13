import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { FiberNode, createFiberFromElement } from './fiber';
import { ReactElementType } from 'shared/ReactTypes';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

function childReconciler(shouldTrackEffects: boolean) {
  function reconcilerSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: REACT_ELEMENT_TYPE
  ) {
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }

  function reconcilerSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }

  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffects && fiber.alternate === null) {
      fiber.flags |= Placement;
    }
    return fiber;
  }

  return function reconcilerChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType
  ) {
    // 判断当前fiber类型
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcilerSingleElement(returnFiber, currentFiber, newChild)
          );
        default:
          if (__DEV__) {
            console.warn('未实现的reconciler类型');
          }
      }
    }

    if (typeof newChild === 'string' && newChild !== null) {
      return placeSingleChild(
        reconcilerSingleTextNode(returnFiber, currentFiber, newChild)
      );
    }

    if (__DEV__) {
      console.warn('未实现的reconciler类型', newChild);
    }

    return null;
  };
}

export const reconcilerChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
