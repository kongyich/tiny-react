import { ReactContext } from 'shared/ReactTypes';

let prevContextValue: any = null;
const prevContextValueStack: any[] = [];

function pushProvider<T>(context: ReactContext<T>, newValue: T) {
  prevContextValueStack.push(prevContextValue);

  prevContextValue = context._currentValue;
  context._currentValue = newValue;
}

function popProvider<T>(context: ReactContext<T>) {
  // 上一个_currentValue
  context._currentValue = prevContextValue;

  prevContextValue = prevContextValue.pop();
}
