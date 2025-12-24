<template>
  <div class="todo-list">
    <h3>任务列表（{{ tasks.length }} 项）</h3>
    <div v-if="tasks.length === 0" class="empty提示">
      暂无任务，快去添加吧～
    </div>
    <TodoItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="handleToggle"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import TodoItem from './TodoItem.vue';

// 接收父组件传递的任务列表
const props = defineProps({
  tasks: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 定义事件（传递状态切换/删除操作）
const emit = defineEmits(['toggleTask', 'deleteTask']);

// 处理状态切换
const handleToggle = (id) => {
  emit('toggleTask', id);
};

// 处理删除
const handleDelete = (id) => {
  emit('deleteTask', id);
};
</script>

<style scoped>
.todo-list {
  margin-top: 20px;
}

.empty提示 {
  text-align: center;
  padding: 20px;
  color: #888;
  border: 1px dashed #ddd;
  border-radius: 4px;
}
</style>