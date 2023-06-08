import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTags } from './workTags';

export class FiberNode {
  type: any
  tag: WorkTags
  pendingProps: Props
  key: Key
  stateNode: any
  ref: Ref

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null

  constructor(tag: WorkTags, pendingProps: Props, key: Key) {
    // 实例
    this.tag = tag;
    this.key = key;
    // <div></div> div的dom
    this.stateNode = null
    this.type = null

    // 节点间的关系 树状结构
    // 指向父fiberNode
    this.return = null
    // 兄弟
    this.sibling = null
    // 子节点
    this.child = null
    this.index = 0

    this.ref = null

    // 作为工作单元
    this.pendingProps = pendingProps
    this.memoizedProps = null
  }
}
