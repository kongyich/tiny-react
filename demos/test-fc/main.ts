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
  unstable_shouldYield as shouldYield
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

function scheduler() {
  // 优先级排序
  const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0];

  // TODO 策略逻辑
  const { priority } = curWork;

  scheduleCallback(priority, perform.bind(null, curWork));
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
  if (!work.count) {
    const workIndex = workList.indexOf(work);
    workList.splice(workIndex, 1);
  }
  scheduler();
}

function insertSpan(content) {
  const span = document.createElement('span');
  span.innerText = content;

  root?.appendChild(span);
}

button &&
  (button.onclick = () => {
    workList.push({
      count: 100
    });
    scheduler();
  });
