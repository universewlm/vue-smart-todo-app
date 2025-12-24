<template>
  <div class="todo-item" :class="{ completed: task.completed }">
    <div class="task-info">
      <h4 @click="handleToggle">{{ task.title }}</h4>
      <p v-if="task.description">{{ task.description }}</p>
      <span class="time">{{ formatTime(task.createdAt) }}</span>
    </div>
    <div class="task-actions">
      <button @click="handleToggle" class="toggle-btn">
        {{ task.completed ? '未完成' : '完成' }}
      </button>
      <button @click="handleDelete" class="delete-btn">删除</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 接收父组件传递的任务数据
const props = defineProps({
  task: {
    type: Object,
    required: true,
    properties: {
      id: { type: Number },
      title: { type: String },
      description: { type: String },
      completed: { type: Boolean },
      createdAt: { type: String }
    }
  }
});

// 定义事件（切换状态/删除任务）
const emit = defineEmits(['toggle', 'delete']);

// 处理状态切换
const handleToggle = () => {
  emit('toggle', props.task.id);
};

// 处理删除
const handleDelete = () => {
  emit('delete', props.task.id);
};

// 格式化时间显示
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString(); // 本地时间格式（如：2024/5/20 14:30:00）
};
</script>

<style scoped>
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.todo-item.completed .task-info h4 {
  text-decoration: line-through;
  color: #888;
}

.task-info h4 {
  margin-bottom: 5px;
  cursor: pointer;
}

.task-info p {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.time {
  font-size: 12px;
  color: #aaa;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-btn:hover {
  background-color: #e0e0e0;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #cc0000;
}
</style>