<template>
  <div>
     <el-button-group>
      <el-button size="small" @click="zoomIn">放大</el-button>
      <el-button size="small" @click="zoomOut">缩小</el-button>
      <el-button size="small" @click="zoomReset">大小适应</el-button>
      <el-button size="small" @click="translateReset">定位还原</el-button>
      <el-button size="small" @click="undo" :disabled="undoDisable">上一步(ctrl+z)</el-button>
      <el-button size="small" @click="redo" :disabled="redoDisable">下一步(ctrl+y)</el-button>
      <el-button size="small" @click="download">下载图片</el-button>
      <el-button type="primary" size="small" :disabled="submitDisable" @click="submit">提交</el-button>
    </el-button-group>
  </div>
</template>
<script lang="jsx">
import { onMounted, ref, defineComponent, reactive } from 'vue';
import { ElMessageBox, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'

export default defineComponent({
  name: 'Control',
  props: {
    lf: Object || String,
    catTurboData: Boolean
  },
  setup(props, { emit }) {
    const undoDisable = ref(true);
    const redoDisable = ref(true);
    const submitDisable = ref(true);

    onMounted(() => {
      props.lf && props.lf.on('history:change', ({ data: { undoAble, redoAble } }) => {
        undoDisable.value = !undoAble;
        redoDisable.value = !redoAble;
        const graphData = props.lf.getGraphData()
        const nodes = graphData.nodes
        const hasStart = nodes.filter(k => k.flow_type === 'start').length > 0
        const hasEnd = nodes.filter(k => k.flow_type === 'end').length > 0
        submitDisable.value = !(hasStart && hasEnd)
      });
    });

    const zoomIn = () => {
      props.lf.zoom(true);
    };

    const zoomOut = () => {
      props.lf.zoom(false);
    };

    const zoomReset = () => {
      props.lf.resetZoom();
    };

    const translateReset = () => {
      props.lf.resetTranslate();
    };

    const reset = () => {
      props.lf.resetZoom();
      props.lf.resetTranslate();
    };

    const undo = () => {
      props.lf.undo();
    };

    const redo = () => {
      props.lf.redo();
    };

    const download = () => {
      props.lf.getSnapshot();
    };

    const catData = () => {
      emit('catData');
    };

    const catTurboData = () => {
      emit('catTurboData');
    };

    const showMiniMap = () => {
      const { lf } = props;
      lf.extension.miniMap.show(lf.graphModel.width - 150, 40)
    };

    const submit = () => {
      const formRef = ref(null)
      const form = reactive({ name: '', info: '' })
      const rules = reactive({
        name: {
          required: true,
          trigger: 'blur',
          message: '名称为必填项'
        },
        info: {
          required: true,
          trigger: 'blur',
          message: '描述为必填项'
        }
      })
      const data = props.lf.getGraphData()
      
      ElMessageBox({
        title: '提交信息',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        message: () =>
          <ElForm
            ref={formRef}
            model={form}
            rules={rules}
            labelWidth={60}
          >
            <ElFormItem label="名称" prop="name">
              <ElInput v-model={form.name}></ElInput>
            </ElFormItem>
            <ElFormItem label="描述" prop="info">
              <ElInput v-model={form.info}></ElInput>
            </ElFormItem>
          </ElForm>
        ,
        beforeClose: (action, instance, done) => {
          formRef.value && formRef.value.validate(status => {
            if (status || action==='cancel') done()
            if (status && action==='confirm') {
              console.log('提交的data:', data)
            }
          })
        }
      })
    }

    return {
      undoDisable,
      redoDisable,
      zoomIn,
      zoomOut,
      zoomReset,
      translateReset,
      reset,
      undo,
      redo,
      download,
      catData,
      catTurboData,
      showMiniMap,
      submit,
      submitDisable
    };
  }
})
</script>
<style scoped>
</style>