import {
  // 同步更新
  unstable_ImmediatePriority as ImmediatePriority,
  // 例如点击事件
  unstable_UserBlockingPriority as UserBlockingPriority,
  // 正常优先级
  unstable_NormalPriority as NormalPriority,
  // 低优先级
  unstable_LowPriority as LowPriority,
  // 空闲优先级
  unstable_IdlePriority as IdlePriority,
  // 调度函数
  unstable_scheduleCallback as scheduleCallback,
  // 是否用尽
  unstable_shouldYield as shouldYield,
  CallbackNode,
  unstable_getFirstCallbackNode as getFirstCallbackNode,
  unstable_cancelCallback as cancelCallback
} from 'scheduler';

const button = document.querySelector('button');
const root = document.querySelector('#root');

type Priority =
  | typeof IdlePriority
  | typeof LowPriority
  | typeof NormalPriority
  | typeof UserBlockingPriority
  | typeof ImmediatePriority;

interface Work {
  count: number;
  priority: Priority;
}
const workList: Work[] = [];
let prevPriority: Priority = IdlePriority;
let curCallback: CallbackNode | null = null;

function scheduler() {
  const cbNode = getFirstCallbackNode();

  // 优先级排序
  const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0];

  if (!curWork) {
    curCallback = null;
    cbNode && cancelCallback(cbNode);
    return;
  }

  // TODO 策略逻辑
  const { priority: curPriority } = curWork;

  if (curPriority === prevPriority) {
    return;
  }

  // 更高优先级
  cbNode && cancelCallback(cbNode);

  curCallback = scheduleCallback(curPriority, perform.bind(null, curWork));
}

function perform(work: Work, didTimeout?: boolean) {
  /**
   * 中断之行的条件
   * 1. work.priority 同步，不可中断的
   * 2. 饥饿问题
   * 3. 时间切片
   */

  const needSync = work.priority == ImmediatePriority || didTimeout;
  // 当前同步 || 没有用尽 && 还有任务
  while ((needSync || !shouldYield()) && work.count) {
    work.count--;
    insertSpan('0');
  }

  // 执行完 || 终端执行
  prevPriority = work.priority;
  if (!work.count) {
    const workIndex = workList.indexOf(work);
    workList.splice(workIndex, 1);
    prevPriority = IdlePriority;
  }

  const prevCb = curCallback;
  scheduler();
  const curCb = curCallback;

  if (curCb && prevCb === curCb) {
    return perform.bind(null, work);
  }
}

function insertSpan(content) {
  const span = document.createElement('span');
  span.innerText = content;

  root?.appendChild(span);
}

[LowPriority, NormalPriority, UserBlockingPriority, ImmediatePriority].forEach(
  (priority) => {
    const button = document.createElement('button');
    root?.appendChild(button);
    button.innerText = [
      '',
      'ImmediatePriority',
      'UserBlockingPriority',
      'NormalPriority',
      'LowPriority'
    ][priority];

    button &&
      (button.onclick = () => {
        workList.unshift({
          count: 100,
          priority: priority as Priority
        });
        scheduler();
      });
  }
);
