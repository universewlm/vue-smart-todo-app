<template>
  <div class="container">
    <h1>TODO List</h1>
    <TodoInput @addTask="addTask" />
    <TodoList
      :tasks="tasks"
      @toggleTask="toggleTask"
      @deleteTask="deleteTask"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TodoInput from './components/TodoInput.vue';
import TodoList from './components/TodoList.vue';
// 后续会引入IndexedDB工具：import { getTasks, saveTask, updateTask, deleteTask } from './utils/idb';

// 临时用内存存储（后续替换为IndexedDB）
const tasks = ref([]);

// 初始化：从存储加载任务（暂用空数组）
onMounted(() => {
  // 后续替换为：getTasks().then(data => tasks.value = data);
});

// 添加任务
const addTask = (newTask) => {
  tasks.value.push(newTask);
  // 后续添加：saveTask(newTask);
};

// 切换任务状态
const toggleTask = (id) => {
  const task = tasks.value.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    // 后续添加：updateTask(task);
  }
};

// 删除任务
const deleteTask = (id) => {
  tasks.value = tasks.value.filter(t => t.id !== id);
  // 后续添加：deleteTask(id);
};
</script>