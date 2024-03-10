<template>
  <el-drawer
    :modelValue="true"
    @close="hide"
    title="详情"
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
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          type="text"
          v-model="model.name"
        ></el-input>
      </el-form-item>
      <el-tabs
        class="el-tabs"
        v-model="model.task_type"
        @tab-change="handleTabChange"
      >
        <el-tab-pane
          label="作业"
          name="job"
        >
          <el-form-item label="作业名" prop="job">
            <el-select
              v-model="model.job"
              @change="handleJobChange"
              filterable
              remote
              reserve-keyword
              :loading="jobLoading"
            >
              <el-option
                v-for="k in jobOptions"
                :key="k.id"
                :label="k.name"
                :value="k.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="参数" prop="args">
            <div>
              <div>env:</div>
              <el-row :gutter="4" v-for="(k, index) in model.env" :key="index">
                <el-col :span="6">
                  <el-input v-model="k.key"></el-input>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="k.value"></el-input>
                </el-col>
                <el-col :span="4" v-if="index === 0">
                  <el-button link type="primary" @click="handleAddEnv">新增</el-button>
                </el-col>
                <el-col :span="4" v-if="index !== 0">
                  <el-button link type="primary" @click="handleDelEnv(index)">删除</el-button>
                </el-col>
              </el-row>
              <div>args:</div>
              <el-row :gutter="4" v-for="(k, index) in model.args" :key="index">
                <el-col :span="6">
                  <el-input v-model="k.key"></el-input>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="k.value"></el-input>
                </el-col>
                <el-col :span="4" v-if="index === 0">
                  <el-button link type="primary" @click="handleAddArgs">新增</el-button>
                </el-col>
                <el-col :span="4" v-if="index !== 0">
                  <el-button link type="primary" @click="handleDelArgs(index)">删除</el-button>
                </el-col>
              </el-row>
            </div>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane
          label="自定义"
          name="custom"
        >
          <el-card title="基础信息">
            <el-form-item label="脚本类型" prop="params">
              <el-select v-model="model.script">
                <el-option label="bash" :value="1"></el-option>
                <el-option label="shell" :value="2"></el-option>
                <el-option label="python" :value="3"></el-option>
                <el-option label="lua" :value="4"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="euid" prop="euid">
              <el-input v-model="model.euid"></el-input>
            </el-form-item> -->
            <el-form-item label="执行目录" prop="dir">
              <el-row :gutter="4">
                <el-col :span="8">
                  <el-input placeholder="执行目录"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-input placeholder="超时时间(秒)"></el-input>
                </el-col>
              </el-row>
              <el-row :gutter="2">
                <el-col :span="8">
                  <el-input placeholder="执行用户"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-input placeholder="失败执行"></el-input>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="重试次数" prop="retry">
              <el-input-number v-model="model.retry" />
            </el-form-item>
            <el-form-item label="代码" prop="code">
              <el-input type="textarea" />
            </el-form-item>
          </el-card>
          <el-card title="参数" class="mt">
            <el-form-item label="参数" prop="args">
              <div>
                <div>env:</div>
                <el-row :gutter="4" v-for="(k, index) in model.env" :key="index">
                  <el-col :span="6">
                    <el-input v-model="k.key"></el-input>
                  </el-col>
                  <el-col :span="6">
                    <el-input v-model="k.value"></el-input>
                  </el-col>
                  <el-col :span="4" v-if="index === 0">
                    <el-button link type="primary" @click="handleAddEnv">新增</el-button>
                  </el-col>
                  <el-col :span="4" v-if="index !== 0">
                    <el-button link type="primary" @click="handleDelEnv(index)">删除</el-button>
                  </el-col>
                </el-row>
                <div>args:</div>
                <el-row :gutter="4" v-for="(k, index) in model.args" :key="index">
                  <el-col :span="6">
                    <el-input v-model="k.key"></el-input>
                  </el-col>
                  <el-col :span="6">
                    <el-input v-model="k.value"></el-input>
                  </el-col>
                  <el-col :span="4" v-if="index === 0">
                    <el-button link type="primary" @click="handleAddArgs">新增</el-button>
                  </el-col>
                  <el-col :span="4" v-if="index !== 0">
                    <el-button link type="primary" @click="handleDelArgs(index)">删除</el-button>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    
    <template #footer>
      <div>
        <el-button type="primary" @click="makeSure">暂存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
// import { useRoute } from 'vue-router';
import { approveUser } from '../config';
import { nanoid } from 'nanoid'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'PropertyPanel',
  props: {
    nodeData: Object,
    updateproperty: Function,
    hidePropertyPanel: Function,
  },
  setup(props, { emit }) {
    const showTaskPanel = ref(true)
    const oldProperties = props.nodeData.properties
    const defaultProperties = {
      task_type: 'job',
      name: '',
      job: '',
      env: [{ key: '', value: '' }],
      args: [{ key: '', value: '' }],
      node: [],
      euid: '',
      script: '',
      retry: 0,
      code: ''
    }
    // const route = useRoute()
    // const mode = route.query.mode
    // const newProperties = mode === 'edit' ? oldProperties : {}
    const newProperties = {}
    
    Object.keys(defaultProperties).forEach(k => {
      newProperties[k] = !!oldProperties[k] ? oldProperties[k] : defaultProperties[k]
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
      ElMessage.success('暂存成功')
    }
    const jobOptions = ref([]);
    const jobLoading = ref(false);

    const nodeOptions = ref([])
    const value = ref([])

    onMounted(() => {
      init()
    })

    function init() {
      
    }

    function handleAddEnv() {
      model.value.env.push({ key: '', value: '' })
    }
    function handleDelEnv(index) {
      model.value.env.splice(index, 1)
    }

    function handleAddArgs() {
      model.value.args.push({ key: '', value: '' })
    }
    function handleDelArgs(index) {
      model.value.args.splice(index, 1)
    }
    
    function handleJobChange(id) {
      const job = jobOptions.value.find(k => k.id === id)
      model.value.euid = job.euid
    }

    function handleTabChange(panel) {
      if (panel === 'job') {
        model.value.job = ''
        model.value.env = [{ key: '', value: '' }]
        model.value.args = [{ key: '', value: '' }]
        model.value.node = []
        model.value.euid = ''
      }
      if (panel === 'custom') {
        model.value.script = ''
        model.value.retry = 0
        model.value.code = ''
        model.value.env = [{ key: '', value: '' }]
        model.value.args = [{ key: '', value: '' }]
        model.value.node = []
        // 为新增时，生成euid
        if([mode !== 'edit' && mode !== 'view']) {
          model.value.euid = 'j-' + nanoid(22)
        }
      }
    }

    return {
      approveUser,
      hide,
      showTaskPanel,
      model,
      value,
      handleAddEnv,
      handleDelEnv,
      jobOptions,
      jobLoading,
      handleJobChange,
      nodeOptions,
      handleTabChange,
      handleAddArgs,
      handleDelArgs,
      makeSure
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