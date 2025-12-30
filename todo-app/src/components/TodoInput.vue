<template>
  <form @submit.prevent="handleSubmit" class="todo-input-form">
    <div class="input-group">
      <input
        v-model="title"
        type="text"
        placeholder="添加新的任务..."
        class="title-input"
        required
        :disabled="loading"
        ref="titleInput"
      />
      <button 
        type="submit" 
        class="add-button"
        :disabled="!title.trim() || loading"
      >
        <span v-if="loading">添加中...</span>
        <span v-else>+ 添加</span>
      </button>
    </div>

    <div class="advanced-options" :class="{ expanded: showAdvanced }">
      <div class="option-row">
        <textarea
          v-model="description"
          placeholder="任务描述（可选）"
          class="description-input"
          rows="2"
          :disabled="loading"
        />
      </div>

      <div class="option-row">
        <div class="priority-selector">
          <span class="option-label">优先级：</span>
          <div class="priority-options">
            <button
              type="button"
              v-for="level in priorityLevels"
              :key="level.value"
              @click="priority = level.value"
              :class="{
                'priority-btn': true,
                'selected': priority === level.value,
                [level.class]: true
              }"
              :disabled="loading"
            >
              {{ level.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      @click="toggleAdvanced"
      class="toggle-advanced"
    >
      {{ showAdvanced ? '收起选项' : '更多选项' }}
    </button>
  </form>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const emit = defineEmits(['add-todo'])
const props = defineProps({
  loading: Boolean
})

// 表单数据
const title = ref('')
const description = ref('')
const priority = ref(2) // 默认中等优先级
const showAdvanced = ref(false)

// 优先级选项
const priorityLevels = [
  { value: 1, label: '低', class: 'priority-low' },
  { value: 2, label: '中', class: 'priority-medium' },
  { value: 3, label: '高', class: 'priority-high' }
]

// 输入框引用
const titleInput = ref(null)

// 提交表单
const handleSubmit = async () => {
  if (!title.value.trim()) return
  
  try {
    const todoData = {
      title: title.value.trim(),
      description: description.value.trim(),
      priority: priority.value
    }
    
    emit('add-todo', todoData)
    
    // 重置表单
    resetForm()
    
    // 聚焦到输入框
    await nextTick()
    titleInput.value?.focus()
  } catch (error) {
    console.error('添加任务失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  title.value = ''
  description.value = ''
  priority.value = 2
  showAdvanced.value = false
}

// 切换高级选项
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}
</script>

<style scoped>
.todo-input-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.title-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background: white;
}

.title-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.title-input::placeholder {
  color: #9e9e9e;
}

.add-button {
  padding: 0 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.25);
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.advanced-options {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  margin-bottom: 10px;
}

.advanced-options.expanded {
  max-height: 200px;
}

.option-row {
  margin-bottom: 15px;
}

.description-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s;
  background: white;
}

.description-input:focus {
  outline: none;
  border-color: #667eea;
}

.option-label {
  color: #666;
  font-size: 14px;
  margin-right: 10px;
}

.priority-options {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.priority-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.priority-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.priority-btn.selected {
  border-color: transparent;
  color: white;
  font-weight: 600;
}

.priority-low.selected {
  background: linear-gradient(135deg, #81e6d9 0%, #4fd1c7 100%);
}

.priority-medium.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.priority-high.selected {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.toggle-advanced {
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-advanced:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  .add-button {
    padding: 15px;
  }
}
</style>