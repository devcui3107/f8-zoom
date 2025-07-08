function TodoApp() {
  this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  this.currentFilter = "all";

  this.currentPriority = "medium";
  this.editingTaskId = null;
  this.taskToDelete = null;

  // Khởi tạo
  this.currentSearch = "";
  this.init();
}

TodoApp.prototype.init = function () {
  this.bindEvents();
  this.addTaskEventListeners();
  this.initSearch();
  this.renderTasks();
  this.updateEmptyState();
};

TodoApp.prototype.bindEvents = function () {
  // Add Task
  const addTaskBtn = document.querySelector("#addTaskBtn");
  addTaskBtn.addEventListener("click", () => this.openModal());

  // Filters
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      this.currentFilter = e.target.dataset.filter;
      this.renderTasks();
    });
  });

  // Modal Event
  const closeModalBtn = document.querySelector("#closeModal");
  const cancelTaskBtn = document.querySelector("#cancelTask");
  const taskForm = document.querySelector("#taskForm");
  closeModalBtn.addEventListener("click", () => this.closeModal());
  cancelTaskBtn.addEventListener("click", () => this.closeModal());
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    this.saveTask();
  });

  // Color
  const colorPresets = document.querySelectorAll(".color-preset");
  colorPresets.forEach((preset) => {
    preset.addEventListener("click", (e) => {
      const color = e.target.dataset.color;
      document.querySelector("#taskColor").value = color;

      colorPresets.forEach((p) => p.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // Đòng Modal khi click vào overlay
  const taskModal = document.querySelector("#taskModal");
  taskModal.addEventListener("click", (e) => {
    if (e.target.id === "taskModal") {
      this.closeModal();
    }
  });

  // Xác nhận Modal Event
  const closeConfirmModalBtn = document.querySelector("#closeConfirmModal");
  const cancelDeleteBtn = document.querySelector("#cancelDelete");
  const confirmDeleteBtn = document.querySelector("#confirmDelete");
  const confirmModal = document.querySelector("#confirmModal");

  closeConfirmModalBtn.addEventListener("click", () =>
    this.closeConfirmModal()
  );
  cancelDeleteBtn.addEventListener("click", () => this.closeConfirmModal());
  confirmDeleteBtn.addEventListener("click", () => this.executeDelete());
  confirmModal.addEventListener("click", (e) => {
    if (e.target.id === "confirmModal") {
      this.closeConfirmModal();
    }
  });
};

TodoApp.prototype.openModal = function (taskId = null) {
  this.editingTaskId = taskId;
  const modal = document.querySelector("#taskModal");
  const modalTitle = document.querySelector("#modalTitle");
  const form = document.querySelector("#taskForm");

  // Reset form
  form.reset();

  if (taskId) {
    // Edit mode
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      modalTitle.textContent = "Chỉnh sửa công việc";
      this.fillFormWithTask(task);
    }
  } else {
    // Add mode
    modalTitle.textContent = "Thêm công việc mới";
    this.setDefaultValues();
  }

  modal.classList.add("active");
  document.querySelector("#taskName").focus();
};

TodoApp.prototype.closeModal = function () {
  const modal = document.querySelector("#taskModal");
  modal.classList.remove("active");
  this.editingTaskId = null;
};

TodoApp.prototype.fillFormWithTask = function (task) {
  document.querySelector("#taskName").value = task.text || "";
  document.querySelector("#taskDescription").value = task.description || "";
  document.querySelector("#taskCategory").value = task.category || "";
  document.querySelector("#taskPriority").value = task.priority || "medium";
  document.querySelector("#taskColor").value = task.color || "#667eea";

  if (task.startDate) {
    document.querySelector("#taskStartDate").value =
      this.formatDateTimeForInput(task.startDate);
  }
  if (task.endDate) {
    document.querySelector("#taskEndDate").value = this.formatDateTimeForInput(
      task.endDate
    );
  }

  // Update color
  document
    .querySelectorAll(".color-preset")
    .forEach((p) => p.classList.remove("active"));
  const activePreset = document.querySelector(
    `[data-color="${task.color || "#667eea"}"]`
  );
  if (activePreset) activePreset.classList.add("active");
};

TodoApp.prototype.setDefaultValues = function () {
  document.querySelector("#taskPriority").value = this.currentPriority;
  document.querySelector("#taskColor").value = "#667eea";

  // Set current date as default
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  document.querySelector("#taskStartDate").value =
    this.formatDateTimeForInput(now);
  document.querySelector("#taskEndDate").value =
    this.formatDateTimeForInput(tomorrow);

  // Set default color preset
  document
    .querySelectorAll(".color-preset")
    .forEach((p) => p.classList.remove("active"));
  document.querySelector('[data-color="#667eea"]').classList.add("active");
};

TodoApp.prototype.saveTask = function () {
  const formData = this.getFormData();

  if (!formData.text.trim()) {
    this.showToast("Lỗi", "Vui lòng nhập tên công việc!", "error");
    return;
  }

  if (this.editingTaskId) {
    // Update existing task
    const taskIndex = this.tasks.findIndex((t) => t.id === this.editingTaskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...formData };
      this.showToast("Thành công", "Công việc đã được cập nhật!", "success");
    }
  } else {
    // Add new task
    const task = {
      id: Date.now(),
      ...formData,
      completed: false,
      createdAt: new Date().toISOString(),
      selected: false,
    };
    this.tasks.unshift(task);
    this.showToast("Thành công", "Công việc mới đã được thêm!", "success");
  }

  this.saveTasks();
  this.renderTasks();
  this.updateEmptyState();
  this.closeModal();
};

TodoApp.prototype.getFormData = function () {
  return {
    text: document.querySelector("#taskName").value.trim(),
    description: document.querySelector("#taskDescription").value.trim(),
    category: document.querySelector("#taskCategory").value,
    priority: document.querySelector("#taskPriority").value,
    color: document.querySelector("#taskColor").value,
    startDate: document.querySelector("#taskStartDate").value
      ? new Date(document.querySelector("#taskStartDate").value).toISOString()
      : null,
    endDate: document.querySelector("#taskEndDate").value
      ? new Date(document.querySelector("#taskEndDate").value).toISOString()
      : null,
  };
};

TodoApp.prototype.formatDateTimeForInput = function (dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

TodoApp.prototype.toggleTask = function (id) {
  const task = this.tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    this.saveTasks();
    this.renderTasks();
  }
};

TodoApp.prototype.deleteTask = function (id) {
  const task = this.tasks.find((t) => t.id === id);
  if (task) {
    this.taskToDelete = task;
    this.showConfirmModal(task);
  }
};

TodoApp.prototype.showConfirmModal = function (task) {
  const modal = document.querySelector("#confirmModal");
  const taskText = document.querySelector("#confirmTaskText");

  taskText.textContent = `"${task.text}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`;

  modal.classList.add("active");
};

TodoApp.prototype.closeConfirmModal = function () {
  const modal = document.querySelector("#confirmModal");
  modal.classList.remove("active");
  this.taskToDelete = null;
};

TodoApp.prototype.executeDelete = function () {
  if (this.taskToDelete) {
    const taskName = this.taskToDelete.text;
    this.tasks = this.tasks.filter((t) => t.id !== this.taskToDelete.id);
    this.saveTasks();
    this.renderTasks();
    this.updateEmptyState();

    this.showToast(
      "Đã xóa",
      `"${taskName}" đã được xóa thành công!`,
      "success"
    );
    this.closeConfirmModal();
  }
};

TodoApp.prototype.editTask = function (id) {
  this.openModal(id);
};

TodoApp.prototype.getFilteredTasks = function () {
  let filtered = this.tasks;

  // Lọc với Search
  if (this.currentSearch) {
    filtered = filtered.filter((task) => {
      const searchTerm = this.currentSearch.toLowerCase();
      return (
        task.text.toLowerCase().includes(searchTerm) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm)) ||
        (task.category && task.category.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Lọc với trạng thái của Task
  switch (this.currentFilter) {
    case "pending":
      filtered = filtered.filter((t) => !t.completed);
      break;
    case "completed":
      filtered = filtered.filter((t) => t.completed);
      break;
    default:
      break;
  }

  // Sắp xếp theo thời gian tạo Task
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filtered;
};

TodoApp.prototype.renderTasks = function () {
  const todoList = document.querySelector("#todoList");
  const filteredTasks = this.getFilteredTasks();

  if (filteredTasks.length === 0) {
    todoList.style.display = "none";
    document.querySelector("#emptyState").style.display = "block";
  } else {
    todoList.style.display = "grid";
    document.querySelector("#emptyState").style.display = "none";

    todoList.innerHTML = filteredTasks
      .map((task) => this.createTaskHTML(task))
      .join("");
  }
};

TodoApp.prototype.createTaskHTML = function (task) {
  const priorityLabels = {
    low: "Thấp",
    medium: "Bình thường",
    high: "Cao",
    urgent: "Khẩn cấp",
  };

  const categoryLabels = {
    work: "Công việc",
    personal: "Cá nhân",
    study: "Học tập",
    health: "Sức khoẻ",
    shopping: "Mua sắm",
    other: "Khác",
  };

  const taskColor = task.color || "#667eea";
  const hasDescription = task.description && task.description.trim();
  const hasTimeRange = task.startDate && task.endDate;

  return `
    <div class="todo-item ${task.completed ? "completed" : ""}" 
         data-id="${task.id}" style="border-left: 4px solid ${taskColor}">
      <div class="todo-checkbox ${
        task.completed ? "checked" : ""
      }" data-task-id="${task.id}">
        ${task.completed ? '<i class="fas fa-check"></i>' : ""}
      </div>
      <div class="todo-content">
        <p class="todo-text">${this.escapeHtml(task.text)}</p>
        ${
          hasDescription
            ? `<p class="todo-description">${this.escapeHtml(
                task.description
              )}</p>`
            : ""
        }
        <div class="todo-meta">
          <div class="todo-meta-row">
            <span class="todo-date">
              <i class="fas fa-calendar"></i>
              ${this.formatDate(task.createdAt)}
            </span>
            <span class="priority-badge ${task.priority}">${
    priorityLabels[task.priority]
  }</span>
          </div>
          ${
            task.category
              ? `<div class="todo-meta-row">
                  <span class="category-badge">${
                    categoryLabels[task.category] || task.category
                  }</span>
                </div>`
              : ""
          }
          ${
            hasTimeRange
              ? `<div class="todo-meta-row">
                  <span class="time-range">
                    <i class="fas fa-clock"></i>
                    ${this.formatTimeRange(task.startDate, task.endDate)}
                  </span>
                </div>`
              : ""
          }
        </div>
      </div>
      <div class="todo-actions">
        <button class="action-btn edit-btn" data-task-id="${
          task.id
        }" title="Chỉnh sửa">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" data-task-id="${
          task.id
        }" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
};

TodoApp.prototype.addTaskEventListeners = function () {
  const todoList = document.querySelector("#todoList");

  // Lắng nghe sự kiện ở phần tử cha - Áp dụng sự kiện nổi bọt
  todoList.addEventListener("click", (e) => {
    // Hoàn thành Task
    if (e.target.closest(".todo-checkbox")) {
      e.stopPropagation();
      const taskId = parseInt(
        e.target.closest(".todo-checkbox").dataset.taskId
      );
      this.toggleTask(taskId);
      return;
    }

    // Sửa Task
    if (e.target.closest(".edit-btn")) {
      const taskId = parseInt(e.target.closest(".edit-btn").dataset.taskId);
      this.editTask(taskId);
      return;
    }

    // Xoá Task
    if (e.target.closest(".delete-btn")) {
      const taskId = parseInt(e.target.closest(".delete-btn").dataset.taskId);
      this.deleteTask(taskId);
      return;
    }
  });
};

TodoApp.prototype.initSearch = function () {
  const searchInput = document.querySelector("#searchInput");
  searchInput.addEventListener("input", (e) => {
    this.currentSearch = e.target.value.toLowerCase();
    this.renderTasks();
  });
};

TodoApp.prototype.updateEmptyState = function () {
  const emptyState = document.querySelector("#emptyState");
  const todoList = document.querySelector("#todoList");

  if (this.getFilteredTasks().length === 0) {
    emptyState.style.display = "block";
    todoList.style.display = "none";
  } else {
    emptyState.style.display = "none";
    todoList.style.display = "grid";
  }
};

TodoApp.prototype.saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(this.tasks));
};

TodoApp.prototype.formatDate = function (dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Hôm nay";
  if (diffDays === 2) return "Hôm qua";
  if (diffDays <= 7) return `${diffDays - 1} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

TodoApp.prototype.formatTimeRange = function (startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endStr = end.toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startStr} - ${endStr}`;
};

TodoApp.prototype.showToast = function (title, message, type = "info") {
  const toastContainer = document.querySelector("#toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="${icons[type]}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
    <div class="toast-progress"></div>
  `;

  toastContainer.appendChild(toast);

  // Tự động ẩn Toast
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("removing");
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, 3000);
};

TodoApp.prototype.escapeHtml = function (text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// USE
const todoApp = new TodoApp();
