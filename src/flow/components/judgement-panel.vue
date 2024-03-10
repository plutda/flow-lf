<template>
  <el-drawer
    :modelValue="true"
    @close="hide"
    title="判断条件"
    size="40%"
		destroy-on-close
  >
    <el-form
      :key="nodeData.id"
      :model="model"
      v-bind="$attrs"
      label-position="left"
      label-width="80px"
    >
      <el-form-item label-width="0px" prop="condition">
        <el-row :gutter="2" v-for="(k, index) in model.condition" :key="index" style="margin-bottom: 10px">
          <el-col :span="2">
            <span>{{ k.name }}</span>
          </el-col>
          <el-col :span="3">
            <el-select v-model="k.source" placeholder="数据来源">
              <el-option
                v-for="k in fromOptions"
                :key="k.value"
                :label="k.label"
                :value="k.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-input v-model="k.builder.source_data.val" placeholder="数据值"></el-input>
          </el-col>
          <el-col :span="4" style="margin-left:10px;">
            <el-select v-model="k.label" placeholder="操作符">
              <el-option label=">" value=">"></el-option>
              <el-option label="<" value="<"></el-option>
              <el-option label="<=" value="<="></el-option>
              <el-option label="in" value="in"></el-option>
              <el-option label="contain" value="contain"></el-option>
            </el-select>
          </el-col>
          <el-col :span="3" style="margin-left:10px;">
            <el-select v-model="k.builder.target_data.data_from" placeholder="数据来源">
              <el-option
                v-for="k in jobOptions"
                :key="k.id"
                :label="k.name"
                :value="k.id"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-input v-model="k.builder.target_data.val" placeholder="数据值"></el-input>
          </el-col>
          <el-col :span="2" v-if="index === 0">
            <el-button link type="primary" @click="handleAddCondition">新增</el-button>
          </el-col>
          <el-col :span="2" v-if="index !== 0">
            <el-button link type="primary" @click="handleDelCondition(index)">删除</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

		<el-tabs v-model="condition">
			<el-tab-pane
				label="并且"
				:name="1"
			>
        <el-input type="textarea" v-model="conditionAdd" />
      </el-tab-pane>
			<el-tab-pane
				label="或者"
				:name="2"
			>
        <el-input type="textarea" v-model="conditionOr" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { approveUser } from '../config';
import cloneDeep from "../utils/clone-deep"

export default defineComponent({
  name: 'JudgementPanel',
  props: {
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
          data_from: 'node_exit_code',
          data_type: '',
          val: ''
        },
        op: 'in',
        op_compute_type: 'all',
        target_data: {
          data_from: 'custom',
          data_type: '',
          val: [1,0]
        }
      },
      expr: ''
    }
    const condition = ref(1)
    const conditionAdd = ref('')
    const conditionOr = ref('')
    const defaultProperties = {
      condition: [cloneDeep({ ...itemSource, name: `C1`})],
    }
    const newProperties = {}
    Object.keys(defaultProperties).forEach(k => {
      newProperties[k] = oldProperties[k] ? oldProperties[k] : defaultProperties[k]
    })
    const model = ref(newProperties)
    calcResult()
    
    const update = () => {
      const result = {
        ...model.value
      }
      emit("update:property", props.nodeData.id, result)
    }
    const hide = () => {
      emit("hidePropertyPanel")
      update()
    }
    const fromOptions = ref([{
      label: 'node_exit_code',
      value: 'node_exit_code'
    },{
      label: 'node_output',
      value: 'node_output'
    },
    {
      label: 'user_variables',
      value: 'user_variables'
    },
    {
      label: 'custom',
      value: 'custom'
    }
    ])
    const jobOptions = ref([]);
    const jobLoading = ref(false);

    const nodeOptions = ref([])
    const value = ref([])

    onMounted(() => {
      init()
    })

    function init() {

    }

    function calcResult() {
      const names = model.value.condition.map(m => m.name)
      if (names.length === 1) {
        conditionAdd.value = names[0]
        conditionOr.value = names[0]
        return
      }
      conditionAdd.value = names.join(' && ')
      conditionOr.value = names.join(' || ')
    }

    function handleAddCondition() {
      const length = model.value.condition.length
      model.value.condition.push({ ...itemSource, name: `C${length + 1}`})
      calcResult()
    }
    function handleDelCondition(index) {
      model.value.condition.splice(index, 1)
    }
    
    function handleJobChange(id) {
      const job = jobOptions.value.find(k => k.id === id)
    }

    function handleTabChange(panel) {
      if (panel === 'job') {
        model.value.job = ''
        model.value.env = [{ key: '', value: '' }]
        model.value.args = [{ key: '', value: '' }]
        model.value.node = []
        model.value.euid = ''
      }
      if (panel === 'other') {
        model.value.script = ''
        model.value.retry = ''
        model.value.code = ''
        model.value.env = [{ key: '', value: '' }]
        model.value.args = [{ key: '', value: '' }]
        model.value.node = []
        model.value.euid = ''
      }
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
      handleTabChange,
      fromOptions,
      condition,
      conditionAdd,
      conditionOr
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

.property-panz-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.property-panz-footer-hide {
  margin-bottom: 20px;
}
.mt {
  margin-top: 20px;
}
</style>