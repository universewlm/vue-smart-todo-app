<template>
  <div class="todo-input">
    <h3>添加新任务</h3>
    <div class="input-group">
      <input
        type="text"
        v-model="title"
        placeholder="请输入任务标题（必填）"
        class="title-input"
      />
      <textarea
        v-model="description"
        placeholder="请输入任务描述（可选）"
        class="desc-input"
      ></textarea>
      <button @click="handleAdd" class="add-btn">添加任务</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

// 定义事件，向父组件传递新任务
const emit = defineEmits(['addTask']);

// 表单数据
const title = ref('');
const description = ref('');

// 处理添加任务
const handleAdd = () => {
  if (!title.value.trim()) {
    alert('请输入任务标题！');
    return;
  }
  // 生成任务对象（暂用时间戳作为id）
  const newTask = {
    id: Date.now(),
    title: title.value.trim(),
    description: description.value.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  // 触发事件传递任务
  emit('addTask', newTask);
  // 清空表单
  title.value = '';
  description.value = '';
};
</script>

<style scoped>
.todo-input {
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.desc-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 80px;
  resize: vertical;
}

.add-btn {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #359e75;
}
</style>