<template>
  <div class="todo-list-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载任务中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">
        重试
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="todos.length === 0" class="empty-state">
      <span class="empty-icon">📝</span>
      <p>还没有任务，添加一个吧！</p>
    </div>

    <!-- 任务列表 -->
    <div v-else class="todo-items">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        :selected="selectedIds.includes(todo.id)"
        @toggle="() => $emit('toggle-todo', todo.id)"
        @delete="() => $emit('delete-todo', todo.id)"
        @update="(updates) => $emit('update-todo', { id: todo.id, updates })"
        @select="() => $emit('select-todo', todo.id)"
      />
    </div>
  </div>
</template>

<script setup>
import TodoItem from './TodoItem.vue'

defineProps({
  todos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle-todo', 'delete-todo', 'update-todo', 'select-todo', 'retry'])
</script>

<style scoped>
.todo-list-container {
  min-height: 300px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.error-state p {
  color: #f56565;
  margin-bottom: 20px;
}

.retry-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-button:hover {
  transform: translateY(-2px);
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 768px) {
  .todo-items {
    gap: 10px;
  }
}
</style>