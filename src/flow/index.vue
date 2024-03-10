<template>
  <div class="approve-container">
    <!-- 辅助工具栏 -->
    <Control
      class="control"
      v-if="lf"
      :lf="lf"
    />
    <div class="node-panel">
      <NodePanel :lf="lf" />
    </div>
    <div id="graph" class="viewport" />
    <!-- 属性面板 -->
    <div v-if="showJobPanel">
      <PropertyPanel
        :nodeData="nodeData"
        @update:property="updateProperty"
        @hidePropertyPanel="hidePropertyPanel"
      />
    </div>
    <!-- 判断面板 -->
    <div v-if="showJugementPanel">
      <JudgementPanel
        :nodeData="nodeData"
        @update:property="updateProperty"
        @hidePropertyPanel="hideJugementPanel"
      />
    </div>
  </div>
</template>

<style scoped>
.viewport {
  overflow: hidden;
  position: relative;
  height: 100%;
}

.control{
  position: absolute;
  top: 50px;
  right: 50px;
  z-index: 2;
}
</style>

<script>
import { defineComponent, ref, onMounted, nextTick } from 'vue';
// import { useRoute } from "vue-router"
import { ElMessage } from 'element-plus';
import LogicFlow from '@logicflow/core';
import PropertyPanel from './components/property.vue';
import JudgementPanel from './components/judgement-panel.vue'
import NodePanel from './components/node-panel.vue';
import Control from './components/control.vue'
import RegisteNode from './components/registerNode';
import RegisteMenu from './components/registerMenu'
import { themeApprove, data } from './config';
import './index.css';
import '@logicflow/core/dist/style/index.css'
import format from './utils/format.ts'

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  grid: {
    size: 10,
    visible: true,
    type: 'mesh',
    config: {
      color: '#DCDCDC',
    }
  },
  keyboard: { enabled: true },
  style: themeApprove,
};

export default defineComponent({
  components:{
    PropertyPanel,
    JudgementPanel,
    NodePanel,
    Control
  },
  setup() {
    const lf = ref(null);
    const nodeData = ref();
    const showJobPanel = ref(false);
    const showJugementPanel = ref(false);
    // const route = useRoute();
    const initEvent = (lf) => { 
      lf.on('element:click', ({ data }) => {
        if (data.type === 'job') {
          nodeData.value = data;
          showJobPanel.value = true;
        }
        if (data.type === 'jugement') {
          nodeData.value = data;
          showJugementPanel.value = true;
        }
      });
      lf.on('connection:not-allowed', (data) => {
        ElMessage.error(data.msg);
      });
      lf.on('node:dnd-add', (data) => {
        const graphData = lf.getGraphData()
        const nodes = graphData.nodes
        const hasStart = nodes.filter(k => k.flow_type === 'start').length > 1
        const hasEnd = nodes.filter(k => k.flow_type === 'end').length > 1
        if (hasStart) {
          ElMessage.error('只能有一个开始节点');
          setTimeout(() => {
            lf.undo();
          }, 200);
        }
        if (hasEnd) {
          ElMessage.error('只能有一个结束节点');
          setTimeout(() => {
            lf.undo();
          }, 200);
        }
      });
    }

    const updateProperty = (id, data) => {
      const node = lf.value.graphModel.nodesMap[id];
      const edge = lf.value.graphModel.edgesMap[id];
      if (node) {
        node.model.setProperties(data);
      } else if (edge) {
        edge.model.setProperties(Object.assign(edge.model.properties, data));
      }
    }

    const hidePropertyPanel = () => { 
      showJobPanel.value = false;
    }

    const hideJugementPanel = () => {
      showJugementPanel.value = false;
    }

    onMounted(() => {
      const logicFlow = new LogicFlow({
        ...config,
        container: document.querySelector('#graph')
      });
      lf.value = logicFlow;
      RegisteNode(logicFlow);
      RegisteMenu(logicFlow);
      initEvent(logicFlow);
      format(logicFlow);

      const lfData = {}
      logicFlow.render({});

      // const lfData = route.query.mode ==='add' ? {} : data;
      // const { mode, id } = route.query
      // if (mode === 'edit') {
      //   queryOrganizerList({
      //     page: 1,
			//     page_size: 10,
      //     id: id
      //   }).then(res => {
      //     const result = res.data && res.data.list
      //     const gData = result[0]
      //     const nodes = JSON.parse(gData.nodes)
      //     const edges = JSON.parse(gData.edges)
      //     logicFlow.render({
      //       nodes,
      //       edges
      //     })
      //     //TODO: 需要手动设置下properties,不然properties会丢失
      //     nextTick(() => {
      //       nodes.forEach(l => updateProperty(l.id, l.properties))
      //       edges.forEach(k => updateProperty(k.id, k.properties))
      //     })
      //   })
      // } else {
      //   logicFlow.render(lfData);
      // }
    })

    return {
      lf,
      nodeData,
      updateProperty,
      hidePropertyPanel,
      showJobPanel,
      showJugementPanel,
      hideJugementPanel
    }
  },
})
</script>