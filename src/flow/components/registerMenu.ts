import { Menu } from "@logicflow/extension";
import LogicFlow from '@logicflow/core';
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Menu)

export default function(lf: LogicFlow) {
  const menuConfig = {
    nodeMenu: [],
    edgeMenu: [
      {
        text: '属性',
        callback(edge: any) {
          alert(`
            边id：${edge.id}
            边类型：${edge.type}
            边坐标：(x: ${edge.x}, y: ${edge.y})
            源节点id：${edge.sourceNodeId}
            目标节点id：${edge.targetNodeId}`
          );
        },
      },
    ],
    graphMenu: [],
  };
  
  lf.extension.menu.addMenuConfig(menuConfig);
}