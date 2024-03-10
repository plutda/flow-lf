type DataNode = {
  parent: any;
  key: string | undefined;
  data: any;
}

type Root = {
  [key: string]: any;
}

export default function cloneDeep(x: any): Root {
  const root: Root = {};
  // 栈
  const loopList: DataNode[] = [
    {
      parent: root,
      key: undefined,
      data: x,
    }
  ];

  while(loopList.length) {
    // 广度优先
    const node: DataNode = loopList.pop()!;
    const parent = node.parent;
    const key = node.key;
    const data = node.data;

    // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
    let res = parent;
    if (typeof key !== 'undefined') {
      res = parent[key] = {};
    }

    for(let k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        if (typeof data[k] === 'object') {
          // 下一次循环
          loopList.push({
            parent: res,
            key: k,
            data: data[k],
          });
        } else {
          res[k] = data[k];
        }
      }
    }
  }

  return root;
}
