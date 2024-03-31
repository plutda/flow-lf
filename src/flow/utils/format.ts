import { GraphModel } from '@logicflow/core/types'
import LogicFlow from '@logicflow/core';
import { nanoid } from 'nanoid'

interface Node {
  id: string,
  name: string,
  type: string,
  task_type: string,
  flow_type: string,
  euid?: string, // 当task_type=job时，必填
  code?: string, // 当task_type != custom时，必填
  bind_ip?: Array<string>  // 当task_type != none时，必填
}

export default function (lf: LogicFlow) {
  // lf.adapterIn = function (userData) {
  //   // 这里把userData转换为LogicFlow支持的格式
  //   return userData;
  // };
  lf.adapterOut = function (logicFlowData: GraphModel) {
    const nodes = logicFlowData.nodes.map(m => {
      let node:any = { ...m }
      if (m.type === 'start') {
        node.type = 'start'
        node.task_type = 'none'
        node.flow_type = 'start'
      }
      if (m.type === 'job') {
        node.type = 'job'
        node.task_type = 'job'
        node.flow_type = 'process'
        node.euid = m.properties.euid
        node.code = m.properties.code
        node.bind_ip = m.properties.bind_ip && m.properties.bind_ip.split(',')
      }
      if (m.type === 'end') {
        node.type = 'end'
        node.task_type = 'none'
        node.flow_type = 'end'
      }
      if (m.type === 'jugement') {
        node.task_type = 'none'
        node.flow_type = 'condition'
        node.condition = {
          rules: [],
          expr: ''
        }
      }
      node.rawId = m.id //原id
      // node.id = 'nid-' + nanoid(6) //新id
      node.name = m.text && m.text.value
      
      return node
    })
    // 这里把LogicFlow生成的数据转换为用户需要的格式
    const edges = logicFlowData.edges.map(k => {
      const sourceNode = nodes.find(l => l.rawId === k.sourceNodeId)
      const targetNode = nodes.find(l => l.rawId === k.targetNodeId)
      return {
        ...k,
        id: 'nid-' + nanoid(6),
        source_node_id: sourceNode.id,
        target_node_id: targetNode.id,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        val: k.text && k.text.value === '是' ? 'true' : 'false'
      }
    })
    return {
      nodes,
      edges
    }
  };
}