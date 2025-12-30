<template>
  <div 
    class="todo-item" 
    :class="{ 
      completed: todo.completed,
      selected: selected,
      [`priority-${todo.priority}`]: true
    }"
    @click="handleSelect"
  >
    <!-- 选择框 -->
    <div class="select-checkbox" @click.stop="handleSelect">
      <input
        type="checkbox"
        :checked="selected"
        @change="handleSelect"
        class="selection-checkbox"
      />
    </div>

    <!-- 完成状态复选框 -->
    <div class="completion-checkbox" @click.stop="handleToggle">
      <div class="checkbox" :class="{ checked: todo.completed }">
        <span v-if="todo.completed">✓</span>
      </div>
    </div>

    <!-- 任务内容 -->
    <div class="todo-content">
      <div class="todo-header">
        <h3 
          class="todo-title"
          :class="{ completed: todo.completed }"
          @dblclick="startEditing"
        >
          <span v-if="!isEditingTitle">{{ todo.title }}</span>
          <input
            v-else
            ref="titleInput"
            v-model="editingTitle"
            @blur="saveTitleEdit"
            @keyup.enter="saveTitleEdit"
            @keyup.escape="cancelTitleEdit"
            type="text"
            class="edit-input"
          />
        </h3>
        <div class="todo-meta">
          <span class="priority-badge" :class="priorityClass">
            {{ priorityText }}
          </span>
          <span class="time">
            {{ formatDate(todo.createdAt) }}
          </span>
        </div>
      </div>

      <!-- 任务描述 -->
      <div 
        v-if="todo.description || isEditingDescription"
        class="todo-description"
        @dblclick="startEditingDescription"
      >
        <span v-if="!isEditingDescription && todo.description">
          {{ todo.description }}
        </span>
        <textarea
          v-else
          ref="descriptionInput"
          v-model="editingDescription"
          @blush="saveDescriptionEdit"
          @keyup.enter="saveDescriptionEdit"
          @keyup.escape="cancelDescriptionEdit"
          class="edit-textarea"
          placeholder="添加描述..."
          rows="2"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="todo-actions">
        <button
          @click.stop="toggleEditDescription"
          class="action-btn edit-btn"
          :title="todo.description ? '编辑描述' : '添加描述'"
        >
          {{ todo.description ? '✏️' : '📝' }}
        </button>
        <button
          @click.stop="handleDelete"
          class="action-btn delete-btn"
          title="删除任务"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'delete', 'update', 'select'])

// 编辑状态
const isEditingTitle = ref(false)
const isEditingDescription = ref(false)
const editingTitle = ref('')
const editingDescription = ref('')

// 输入框引用
const titleInput = ref(null)
const descriptionInput = ref(null)

// 优先级映射
const priorityMap = {
  1: { text: '低', class: 'low' },
  2: { text: '中', class: 'medium' },
  3: { text: '高', class: 'high' }
}

// 计算属性
const priorityText = computed(() => {
  return priorityMap[props.todo.priority]?.text || '中'
})

const priorityClass = computed(() => {
  return priorityMap[props.todo.priority]?.class || 'medium'
})

// 处理完成任务
const handleToggle = () => {
  emit('toggle')
}

// 处理删除任务
const handleDelete = () => {
  emit('delete')
}

// 处理选择任务
const handleSelect = (event) => {
  if (event.target.type === 'checkbox') {
    emit('select')
  } else {
    // 点击整个项目时也触发选择
    emit('select')
  }
}

// 编辑标题
const startEditing = () => {
  if (props.todo.completed) return
  editingTitle.value = props.todo.title
  isEditingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

const saveTitleEdit = async () => {
  if (editingTitle.value.trim() && editingTitle.value !== props.todo.title) {
    emit('update', { title: editingTitle.value.trim() })
  }
  isEditingTitle.value = false
}

const cancelTitleEdit = () => {
  isEditingTitle.value = false
}

// 编辑描述
const toggleEditDescription = () => {
  isEditingDescription.value = !isEditingDescription.value
  editingDescription.value = props.todo.description || ''
  nextTick(() => {
    if (isEditingDescription.value) {
      descriptionInput.value?.focus()
    }
  })
}

const startEditingDescription = () => {
  if (!isEditingDescription.value) {
    toggleEditDescription()
  }
}

const saveDescriptionEdit = async () => {
  emit('update', { description: editingDescription.value.trim() })
  isEditingDescription.value = false
}

const cancelDescriptionEdit = () => {
  isEditingDescription.value = false
}

// 工具函数
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    // 今天
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    // 一周内
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
  } else {
    // 更早
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.todo-item.selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.todo-item.completed {
  opacity: 0.8;
}

.todo-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.todo-item.priority-1::before {
  background: linear-gradient(to bottom, #81e6d9, #4fd1c7);
}

.todo-item.priority-2::before {
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.todo-item.priority-3::before {
  background: linear-gradient(to bottom, #fc8181, #f56565);
}

.select-checkbox {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.selection-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.completion-checkbox {
  margin-right: 15px;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.checkbox.checked {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-color: transparent;
  color: white;
}

.todo-content {
  flex: 1;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.todo-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: text;
  flex: 1;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #999;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
}

.edit-input:focus {
  outline: none;
}

.todo-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.low {
  background: rgba(129, 230, 217, 0.2);
  color: #4fd1c7;
}

.priority-badge.medium {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.priority-badge.high {
  background: rgba(252, 129, 129, 0.2);
  color: #f56565;
}

.time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.todo-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: text;
}

.edit-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
}

.edit-textarea:focus {
  outline: none;
}

.todo-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f8f9fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

@media (max-width: 768px) {
  .todo-item {
    padding: 15px;
  }
  
  .todo-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .todo-meta {
    align-self: flex-start;
  }
}
</style>