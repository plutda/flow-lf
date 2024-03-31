<template>
  <el-drawer
    :modelValue="true"
    @close="hide"
    title="判断条件"
    size="50%"
		destroy-on-close
  >
    <el-form
      :key="nodeData.id"
      :model="model"
      v-bind="$attrs"
      label-position="left"
      label-width="80px"
    >
      <el-form-item label-width="0px" prop="condition.rules">
        <el-row :gutter="1" v-for="(k, index) in model.condition.rules" :key="index" style="margin-bottom: 10px">
          <el-col :span="2">
            <span>{{ k.name }}</span>
          </el-col>
          <el-col :span="4">
            <el-select v-model="k.builder.source_data.data_from" placeholder="数据来源" @change="handleSourceChange(k)">
              <el-option
                v-for="k in fromOptions"
                :key="k.value"
                :label="k.label"
                :value="k.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col v-if="['node_exit_code', 'node_output'].includes(k.builder.source_data.data_from)" :span="3">
            <el-select v-model="k.builder.source_data.val" placeholder="数据值">
              <el-option v-for="k in lfNodes" :key="k.id" :label="k.name" :value="k.id">{{ k.name }}</el-option>
            </el-select>
          </el-col>
          <el-col v-else :span="3">
            <el-input v-model="k.builder.source_data.val" placeholder="数据值"></el-input>
          </el-col>
          <el-col :span="3" style="margin-left:10px;">
            <el-select v-model="k.label" placeholder="操作符">
              <el-option label=">" value=">"></el-option>
              <el-option label="<" value="<"></el-option>
              <el-option label="<=" value="<="></el-option>
              <el-option label=">=" value=">="></el-option>
              <el-option label="in" value="in"></el-option>
              <el-option label="contain" value="contain"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4" style="margin-left:10px;">
            <el-select v-model="k.builder.target_data.data_from" placeholder="数据来源">
              <el-option
                v-for="k in fromOptions"
                :key="k.value"
                :label="k.label"
                :value="k.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col v-if="['node_exit_code', 'node_output'].includes(k.builder.target_data.data_from)" :span="3">
            <el-select v-model="k.builder.target_data.val" placeholder="数据值">
              <el-option v-for="k in lfNodes" :key="k.id" :label="k.name" :value="k.id">{{ k.name }}</el-option>
            </el-select>
          </el-col>
          <el-col v-else :span="3">
            <el-input v-model="k.builder.target_data.val" placeholder="数据值"></el-input>
          </el-col>
          <el-col :span="3" style="margin-left: 2px">
            <div style="display: flex; align-items: center;">
              <el-checkbox
                v-model="k.builder.op_compute_type"
                true-value="all"
                false-value="any"
                >全匹配</el-checkbox
              >
              <el-button v-if="index === 0" link type="primary" @click="handleAddCondition" style="margin-left: 10px;">新增</el-button>
              <el-button v-if="index !== 0" link type="danger" @click="handleDelCondition(index)" style="margin-left: 10px;">删除</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

		<el-tabs v-model="model.condition.type">
			<el-tab-pane
				label="并且"
				:name="1"
			>
        <el-input disabled type="textarea" v-model="model.condition.expr" />
      </el-tab-pane>
			<el-tab-pane
				label="或者"
				:name="2"
			>
        <el-input disabled type="textarea" v-model="model.condition.expr" />
      </el-tab-pane>
			<el-tab-pane
				label="自定义"
				:name="3"
			>
        <el-input type="textarea" v-model="model.condition.expr" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div>
        <el-button type="primary" @click="makeSure">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import { approveUser } from '../config';
import cloneDeep from "../utils/clone-deep"

export default defineComponent({
  name: 'JudgementPanel',
  props: {
    lfNodes: Object,
    nodeData: Object,
    updateproperty: Function,
    hidePropertyPanel: Function,
  },
  setup(props, { emit }) {
    const showTaskPanel = ref(true)
    const oldProperties = props.nodeData.properties
    const itemSource = {
      name: '',
      builder: {
        source_data: {
          data_from: '', // 数据来源, node_output 节点输出, node_exit_code 节点退出码,  user_variables 用户变量,  custom 自定义
          data_type: '',
          val: ''
        },
        op: 'in',
        op_compute_type: 'all',
        target_data: {
          data_from: '',
          data_type: '',
          val: ''
        }
      },
      expr: ''
    }
    const defaultProperties = {
      condition: {
        rules: [cloneDeep({ ...itemSource, name: `C1`})],
        expr: '',
        type: 1
      }
    }
    const newProperties = {}
    Object.keys(defaultProperties).forEach(k => {
      newProperties[k] = oldProperties[k] ? oldProperties[k] : defaultProperties[k]
    })
    const model = ref(newProperties)
    
    const update = () => {
      const result = {
        ...model.value
      }
      emit("update:property", props.nodeData.id, result)
    }
    const hide = () => {
      emit("hidePropertyPanel")
    }
    const makeSure = () => {
      update()
      hide()
    }
    const fromOptions = ref([{
      label: '节点退出码',
      value: 'node_exit_code'
    },{
      label: '节点输出',
      value: 'node_output'
    },
    {
      label: '用户变量',
      value: 'user_variables'
    },
    {
      label: '自定义',
      value: 'custom'
    }
    ])
    const jobOptions = ref([]);
    const jobLoading = ref(false);

    const nodeOptions = ref([])
    const value = ref([])

    watch(() => model.value.condition, () => {
      calcResult()
    }, {
      deep: true
    })

    onMounted(() => {
      init()
    })

    function init() {
      queryJobs()
      queryNodes()
    }

    function queryJobs(name) {

    }
    function queryNodes() {
      
    }

    function calcResult() {
      const type = model.value.condition.type
      const names = model.value.condition.rules.map(m => m.name)
      if (type === 3) {
        model.value.condition.expr = ''
        return
      }
      if (names.length === 1) {
        model.value.condition.expr = names[0]
        return
      }
      if (type=== 1) {
        model.value.condition.expr = names.join(' && ')
      } else if (type === 2) {
        model.value.condition.expr = names.join(' || ')
      }
    }

    function handleAddCondition() {
      const length = model.value.condition.rules.length
      model.value.condition.rules.push(cloneDeep({ ...itemSource, name: `C${length + 1}`}))
      calcResult()
    }
    function handleDelCondition(index) {
      model.value.condition.rules.splice(index, 1)
    }
    
    function handleJobChange(id) {
      const job = jobOptions.value.find(k => k.id === id)
    }

    function handleSourceChange(item) {
      item.builder.source_data.val = ''
    }

    return {
      approveUser,
      hide,
      showTaskPanel,
      model,
      value,
      handleAddCondition,
      handleDelCondition,
      jobOptions,
      jobLoading,
      handleJobChange,
      nodeOptions,
      queryJobs,
      fromOptions,
      makeSure,
      handleSourceChange
    };
  },
});
</script>

<style scoped>
.form-property {
  margin-right: 20px;
  margin-bottom: 20px;
}

.form-property span {
  font-weight: bold;
}

.property-panel-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.property-panel-footer-hide {
  margin-bottom: 20px;
}
.mt {
  margin-top: 20px;
}
:deep(.el-row) {
  width: 100%;
}
</style>