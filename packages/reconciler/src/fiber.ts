import { Props, Key } from 'shared/ReactTypes';
import { WorkTags } from './workTags';

export class FiberNode {
  constructor(tag: WorkTags, pendingProps: Props, key: Key) {
    this.tag = tag
    this.key = key
  }
}
