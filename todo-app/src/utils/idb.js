/**
 * IndexedDB操作封装
 * 提供Promise风格的CRUD接口
 */
class TodoDB {
  constructor() {
    this.db = null;
    this.dbName = 'TodoAppDB';
    this.storeName = 'todos';
    this.version = 1;
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('无法打开数据库'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('数据库连接成功');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建存储对象
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          
          // 创建索引以便查询
          store.createIndex('completed', 'completed', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  // 获取所有任务
  async getAllTodos() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('获取数据失败'));
      };
    });
  }

  // 添加任务
  async addTodo(todo) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }

      // 添加时间戳
      const todoWithTimestamp = {
        ...todo,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(todoWithTimestamp);

      request.onsuccess = (event) => {
        resolve({
          ...todoWithTimestamp,
          id: event.target.result
        });
      };

      request.onerror = () => {
        reject(new Error('添加任务失败'));
      };
    });
  }

  // 更新任务
  async updateTodo(id, updates) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // 先获取原始数据
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const todo = getRequest.result;
        if (!todo) {
          reject(new Error('任务不存在'));
          return;
        }

        // 合并更新并添加更新时间
        const updatedTodo = {
          ...todo,
          ...updates,
          updatedAt: new Date().getTime()
        };

        const putRequest = store.put(updatedTodo);

        putRequest.onsuccess = () => {
          resolve(updatedTodo);
        };

        putRequest.onerror = () => {
          reject(new Error('更新任务失败'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('获取任务失败'));
      };
    });
  }

  // 删除任务
  async deleteTodo(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('删除任务失败'));
      };
    });
  }

  // 批量操作
  async batchDelete(ids) {
    return Promise.all(ids.map(id => this.deleteTodo(id)));
  }

  async batchUpdate(updates) {
    return Promise.all(
      updates.map(({ id, ...data }) => this.updateTodo(id, data))
    );
  }

  // 清空所有任务
  async clearAll() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('清空数据失败'));
      };
    });
  }
}

// 创建单例实例
const todoDB = new TodoDB();

export default todoDB;