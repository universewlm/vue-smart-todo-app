<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📝 Todo List</h1>
      <p class="subtitle">简洁高效的待办事项管理工具</p>
    </header>

    <main class="main-content">
      <TodoInput 
        @add-todo="addTodo"
        :loading="isAdding"
      />

      <div class="controls">
        <div class="filter-controls">
          <select v-model="filter" class="filter-select">
            <option value="all">全部任务 ({{ stats.total }})</option>
            <option value="active">进行中 ({{ stats.active }})</option>
            <option value="completed">已完成 ({{ stats.completed }})</option>
          </select>

          <select v-model="sortBy" class="sort-select">
            <option value="createdAt">创建时间 (最新优先)</option>
            <option value="priority">优先级 (高到低)</option>
            <option value="title">标题 (A-Z)</option>
          </select>
        </div>

        <div class="bulk-actions" v-if="selectedIds.length > 0">
          <span class="selected-count">已选择 {{ selectedIds.length }} 项</span>
          <button @click="batchComplete" class="btn btn-secondary btn-sm">
            ✅ 标记完成
          </button>
          <button @click="batchDelete" class="btn btn-danger btn-sm">
            🗑️ 批量删除
          </button>
        </div>
      </div>

      <TodoList
        :todos="filteredTodos"
        :loading="isLoading"
        :error="error"
        @toggle-todo="toggleTodo"
        @delete-todo="deleteTodo"
        @update-todo="updateTodo"
        @select-todo="toggleSelectTodo"
        :selected-ids="selectedIds"
      />

      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">总计</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中</span>
          <span class="stat-value">{{ stats.active }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ stats.completed }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">完成率</span>
          <span class="stat-value">{{ stats.completionRate }}%</span>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>使用 Vue 3 + IndexedDB 构建 | 数据存储在本地浏览器中</p>
    </footer>

    <transition name="fade">
      <div v-if="showToast" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import todoDB from './utils/idb.js'

// 响应式状态
const todos = ref([])
const isLoading = ref(false)
const isAdding = ref(false)
const error = ref(null)
const filter = ref('all')
const sortBy = ref('createdAt')
const selectedIds = ref([])

// Toast 提示
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 初始化数据库
onMounted(async () => {
  try {
    await todoDB.init()
    await loadTodos()
  } catch (err) {
    showError('初始化数据库失败：' + err.message)
  }
})

// 加载任务列表
const loadTodos = async () => {
  isLoading.value = true
  try {
    todos.value = await todoDB.getAllTodos()
    selectedIds.value = []
  } catch (err) {
    showError('加载任务失败：' + err.message)
  } finally {
    isLoading.value = false
  }
}

// 添加任务
const addTodo = async (todoData) => {
  isAdding.value = true
  try {
    const newTodo = await todoDB.addTodo({
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 2 // 默认中等优先级
    })
    todos.value.unshift(newTodo)
    showToastMessage('任务添加成功！', 'success')
  } catch (err) {
    showError('添加任务失败：' + err.message)
  } finally {
    isAdding.value = false
  }
}

// 切换任务完成状态
const toggleTodo = async (id) => {
  try {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      const updated = await todoDB.updateTodo(id, { 
        completed: !todo.completed 
      })
      Object.assign(todo, updated)
      showToastMessage('任务状态已更新', 'success')
    }
  } catch (err) {
    showError('更新任务失败：' + err.message)
  }
}

// 删除任务
const deleteTodo = async (id) => {
  if (!confirm('确定要删除这个任务吗？')) return
  
  try {
    await todoDB.deleteTodo(id)
    todos.value = todos.value.filter(todo => todo.id !== id)
    selectedIds.value = selectedIds.value.filter(selectedId => selectedId !== id)
    showToastMessage('任务已删除', 'success')
  } catch (err) {
    showError('删除任务失败：' + err.message)
  }
}

// 更新任务
const updateTodo = async ({ id, updates }) => {
  try {
    const updated = await todoDB.updateTodo(id, updates)
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value[index] = updated
    }
    showToastMessage('任务已更新', 'success')
  } catch (err) {
    showError('更新任务失败：' + err.message)
  }
}

// 批量操作
const batchComplete = async () => {
  try {
    await todoDB.batchUpdate(
      selectedIds.value.map(id => ({ id, completed: true }))
    )
    // 更新本地数据
    todos.value = todos.value.map(todo => 
      selectedIds.value.includes(todo.id) 
        ? { ...todo, completed: true }
        : todo
    )
    selectedIds.value = []
    showToastMessage('批量标记完成成功', 'success')
  } catch (err) {
    showError('批量操作失败：' + err.message)
  }
}

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 个任务吗？`)) return
  
  try {
    await todoDB.batchDelete(selectedIds.value)
    todos.value = todos.value.filter(todo => 
      !selectedIds.value.includes(todo.id)
    )
    selectedIds.value = []
    showToastMessage('批量删除成功', 'success')
  } catch (err) {
    showError('批量删除失败：' + err.message)
  }
}

// 选择/取消选择任务
const toggleSelectTodo = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

// 计算属性
const filteredTodos = computed(() => {
  let filtered = [...todos.value]
  
  // 筛选
  switch (filter.value) {
    case 'active':
      filtered = filtered.filter(todo => !todo.completed)
      break
    case 'completed':
      filtered = filtered.filter(todo => todo.completed)
      break
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return b.createdAt - a.createdAt // 最新优先
      case 'priority':
        return b.priority - a.priority // 优先级高到低
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return b.createdAt - a.createdAt
    }
  })
  
  return filtered
})

const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(todo => todo.completed).length
  const active = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return {
    total,
    active,
    completed,
    completionRate
  }
})

// Toast 消息工具
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const showError = (message) => {
  showToastMessage(message, 'error')
  console.error(message)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.controls {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.filter-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-select,
.sort-select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.filter-select:focus,
.sort-select:focus {
  outline: none;
  border-color: #667eea;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.selected-count {
  color: #667eea;
  font-weight: 500;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.app-footer {
  text-align: center;
  color: white;
  margin-top: 40px;
  padding: 20px;
  opacity: 0.8;
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.toast.error {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn-sm {
  font-size: 12px;
  padding: 6px 12px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-controls {
    flex-direction: column;
  }
}
</style>