<template>
  <div v-for="(item, key) in approveNodes" :key="key" class="approve-node">
    <div class="node-shape" :class="'node-' + item.type" :style="item.style" @mousedown="dragNode(item)"></div>
    <div class="node-label">{{ item.label }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { approveNodes } from '../config';

export default defineComponent({
  props: {
    lf: Object
  },
  setup(props: any) {
    const dragNode = (item: any) => {
      props.lf.dnd.startDrag({
        type: item.type,
        text: item.label,
      });
    };
    const getNodePanel = () => {
      const nodeList: any = [];
      approveNodes.forEach((item) => {
        nodeList.push({
          type: item.type,
          label: item.label,
          style: item.style,
        });
      });
      return nodeList;
    };
    const state = reactive({
      approveNodes: getNodePanel(),
    });
    return {
      state,
      dragNode,
      approveNodes
    };
  },
});
</script>

<style scoped>
.approve-node {
  display: inline-block;
  box-sizing: border-box;
  padding: 10px;
  margin: 5px;
  color: #fff;
}

.approve-node .node-shape {
  width: 64px;
  height: 64px;
  cursor: pointer;
  /* border-radius: 50%; */
  /* background-color: #1890ff; */
}

.approve-node .node-label {
  user-select: none;
  font-size: 14px;
  color: #000000;
  margin-top: 8px;
  text-align: center;
}
.node-end {
  position: relative;
}
.node-end:after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  background: red;
  top: 7.5px;
  left: 7.5px;
  cursor: pointer;
}
</style>