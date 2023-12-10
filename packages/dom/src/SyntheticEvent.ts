import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];

type EventCallback = (e: Event) => void;

interface Paths {
  capture: EventCallback[];
  bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
  __stopPropagation: boolean;
}

export interface DOMElement extends Element {
  [elementPropsKey]: Props;
}

export function updateFiberProps(node: DOMElement, props: Props) {
  node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn('当前不支持此事件' + eventType);
    return;
  }

  if (__DEV__) {
    console.log('初始化事件：', eventType);
  }

  container.addEventListener(eventType, (e) => {
    dispatchEvent(container, eventType, e);
  });
}

function createSyntheticEvent(e: Event) {
  const syntheticEvent = e as SyntheticEvent;
  syntheticEvent.__stopPropagation = false;
  const originStopPropagation = e.stopPropagation;

  syntheticEvent.stopPropagation = function () {
    syntheticEvent.__stopPropagation = true;
    if (originStopPropagation) {
      originStopPropagation();
    }
  };

  return syntheticEvent;
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
  const targetElement = e.target;

  if (targetElement === null) {
    console.log('事件不存在', targetElement);
    return;
  }
  // 1. 收集沿途的事件
  const { bubble, capture } = collectPaths(
    targetElement as DOMElement,
    container,
    eventType
  );
  // 2. 构造合成事件
  const se = createSyntheticEvent(e);
  // 3. 遍历capture

  triggerEventFlow(capture, se);

  if (!se.__stopPropagation) {
    // 4. 遍历bubble
    triggerEventFlow(bubble, se);
  }
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i];
    callback.call(null, se);

    if (se.__stopPropagation) {
      //阻止事件继续传播
      break;
    }
  }
}

function getEventCallbackNameFromEventType(
  eventType: string
): string[] | undefined {
  return {
    click: ['onClickCapture', 'onClick']
  }[eventType];
}

function collectPaths(
  targetElement: DOMElement,
  container: Container,
  eventType: string
) {
  const paths: Paths = {
    capture: [],
    bubble: []
  };

  while (targetElement && targetElement !== container) {
    // 收集
    const elementProps = targetElement[elementPropsKey];
    if (elementProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName];
          if (eventCallback) {
            if (i == 0) {
              // 捕获
              paths.capture.unshift(eventCallback);
            } else {
              paths.bubble.push(eventCallback);
            }
          }
        });
      }
    }

    targetElement = targetElement.parent as DOMElement;
  }

  return paths;
}
