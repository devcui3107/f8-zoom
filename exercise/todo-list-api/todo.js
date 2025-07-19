function TodoApp() {
  // Object New Task
  this._objModal = {};
  this._modalAddTask = document.querySelector("#taskModal");

  this._dataAPI = null;
  this._rootTodo = document.querySelector("#todoList");
  this._baseUrl = "http://localhost:3000/tasks/";

  // Biến để track chế độ modal
  this._modalMode = "add"; // "add" hoặc "edit"
  this._editingTaskId = null; // ID của task đang edit

  // Biến để track filter và search
  this._currentFilter = "all"; // "all", "pending", "completed"
  this._searchQuery = ""; // Từ khóa tìm kiếm

  // Khởi tạo
  this.init();
}

TodoApp.prototype.init = function () {
  this.bindEvents();
  this.render();
};

TodoApp.prototype.bindEvents = function () {
  // Close Open Modal Add Task
  const btnAddTask = document.querySelector("#addTaskBtn");
  const modalAddTask = document.querySelector("#taskModal");
  const iconCloseModal = modalAddTask.querySelector("#closeModal");
  const btnCancelModal = modalAddTask.querySelector("#cancelTask");

  btnAddTask.onclick = () => this._openModalAddNewTask();
  iconCloseModal.onclick = () => this._closeModalAddTask();
  btnCancelModal.onclick = () => this._closeModalAddTask();
  modalAddTask.onclick = (e) => {
    if (e.target === modalAddTask) this._closeModalAddTask();
  };

  // FORM
  this._getValueModalTask();

  // FILTERS
  this._bindFilterEvents();

  // SEARCH
  this._bindSearchEvents();

  // TASK
  this._rootTodo.onclick = (e) => {
    const todoItem = e.target.closest(".todo-item");
    if (!todoItem) return;

    const checkboxTask = todoItem.querySelector(".todo-checkbox");
    if (e.target === checkboxTask) {
      const isCompleted = todoItem.classList.toggle("completed");
      const idTask = checkboxTask.dataset.taskId;
      const fullUrl = this._baseUrl + idTask;

      checkboxTask.classList.toggle("checked", isCompleted);

      // Cập nhật dữ liệu local
      const task = this._dataAPI.find((t) => t.id == idTask);
      if (task) task.status = isCompleted ? "Done" : "Doing";

      fetch(fullUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: task.status,
        }),
      });
    }
  };
};

// PHƯƠNG THỨC LẤY GIÁ TRỊ CỦA FORM MODAL ADD TASK
TodoApp.prototype._getValueModalTask = function () {
  const formAddTask = document.querySelector("#taskForm");

  // Set Color By Select Modal Add Task
  const taskColor = formAddTask.querySelector("#taskColor");
  const taskColors = formAddTask.querySelector(".color-presets");
  const listColor = [...taskColors.children];
  listColor.forEach((color) => {
    color.onclick = (e) => (taskColor.value = e.target.dataset.color);
  });

  formAddTask.onsubmit = (e) => {
    e.preventDefault();
    // Khai báo biến
    const title = formAddTask.querySelector("#taskName");
    const description = formAddTask.querySelector("#taskDescription");
    const category = formAddTask.querySelector("#taskCategory");
    const priority = formAddTask.querySelector("#taskPriority");
    const dateFinish = formAddTask.querySelector("#taskDate");
    const startTime = formAddTask.querySelector("#taskStartTime");
    const endTime = formAddTask.querySelector("#taskEndTime");
    const color = formAddTask.querySelector("#taskColor");

    // Get Value By Form Modal
    this._objModal.title = title.value;
    this._objModal.description = description.value;
    this._objModal.category = category.value;
    this._objModal.priority = priority.value;
    this._objModal.dateFinish = dateFinish.value;
    this._objModal.startTime = startTime.value;
    this._objModal.endTime = endTime.value;
    this._objModal.color = color.value;

    // Xử lý theo chế độ modal
    if (this._modalMode === "add") {
      // Chế độ thêm mới
      this._objModal.status = "Doing";
      this._postDataAPI(this._objModal);
    } else if (this._modalMode === "edit") {
      // Chế độ chỉnh sửa
      this._objModal.status = "Doing"; // Giữ nguyên status
      this._updateTaskAPI(this._editingTaskId, this._objModal);
    }

    // Đóng Modal
    this._closeModalAddTask();
  };
};

// PHƯƠNG THỨC RENDER
TodoApp.prototype.render = async function () {
  this._dataAPI = await this._getDataAPI();

  // === ÁP DỤNG FILTER VÀ SEARCH ===
  let filteredData = this._applyFiltersAndSearch(this._dataAPI);

  const emptyState = document.querySelector("#emptyState");

  // Kiểm tra nếu có task thì ẩn #emptyState và xử lý chiều cao của rootTodo
  if (filteredData.length > 0) {
    emptyState.style.display = "none";
  } else {
    emptyState.style.display = "block";
    this._rootTodo.style.minHeight = 0;
  }

  // Hiển thị số lượng kết quả
  this._updateResultsCount(filteredData.length, this._dataAPI.length);

  // Obj Name để kiểm tra priority:
  const arrayPriority = {
    low: "Thấp",
    medium: "Bình thường",
    high: "Quan trọng",
    urgent: "Khẩn cấp",
  };

  // Obj Category để kiểm tra:
  const arrayCategory = {
    work: "Công việc",
    personal: "Cá nhân",
    study: "Học tập",
    health: "Sức khoẻ",
    shopping: "Mua sắm",
    other: "Khác",
  };

  const HtmlString = filteredData
    .map((item) => {
      // Xử lý trạng thái Task
      const isChecked = item.status !== "Doing" ? "checked" : "";

      const isCompleted = isChecked ? "completed" : "";

      return `<style>
    .todo-item[data-id="${item.id}"]:hover {
      border-color: ${item.color};
    }
  </style>
            <div
              class="todo-item ${isCompleted}"
              data-id="${item.id}"
              style="border-left: 4px solid ${item.color}"
            >
              <div class="todo-checkbox ${isChecked}" data-task-id="${item.id}">
                <i class="fas fa-check"></i>
              </div>
              <div class="todo-content">
                <p class="todo-text">${this._escapeHTML(item.title)}</p>
                <p class="todo-description">${
                  this._escapeHTML(item.description) || "Chưa nhập"
                }</p>
                <div class="todo-meta">
                  <div class="todo-meta-row">
                    <span class="todo-date">
                      <i class="fas fa-calendar"></i>
                      ${this._formatDate(item.dateFinish)}
                    </span>
                    <span class="priority-badge ${item.priority}">${
        arrayPriority[item.priority]
      }</span>
                  </div>
                  <div class="todo-meta-row">
                    <span class="category-badge">${
                      arrayCategory[item.category] || "Chưa chọn"
                    }</span>
                  </div>
                  <div class="todo-meta-row">
                    <span class="time-range">
                      <i class="fas fa-clock"></i>
                      ${item.startTime} - ${item.endTime}
                    </span>
                  </div>
                </div>
              </div>
              <div class="todo-actions">
                <button
                  class="action-btn edit-btn"
                  data-task-id="${item.id}"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="action-btn delete-btn"
                  data-task-id="${item.id}"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>`;
    })
    .join("");

  this._rootTodo.innerHTML = HtmlString;

  this._deleteTask();
  this._editTask();
};

// PHƯƠNG THỨC ÁP DỤNG FILTER VÀ SEARCH
TodoApp.prototype._applyFiltersAndSearch = function (data) {
  let filteredData = [...data];

  // === ÁP DỤNG FILTER THEO TRẠNG THÁI ===
  if (this._currentFilter === "pending") {
    filteredData = filteredData.filter((task) => task.status === "Doing");
  } else if (this._currentFilter === "completed") {
    filteredData = filteredData.filter((task) => task.status === "Done");
  }
  // Nếu "all" thì không filter gì cả

  // === ÁP DỤNG SEARCH ===
  if (this._searchQuery) {
    filteredData = filteredData.filter((task) => {
      const searchLower = this._searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower)) ||
        task.category.toLowerCase().includes(searchLower) ||
        task.priority.toLowerCase().includes(searchLower)
      );
    });
  }

  return filteredData;
};

// PHƯƠNG THỨC CẬP NHẬT SỐ LƯỢNG KẾT QUẢ
TodoApp.prototype._updateResultsCount = function (filteredCount, totalCount) {
  // Tạo hoặc cập nhật element hiển thị số lượng
  let resultsCount = document.querySelector(".results-count");

  if (!resultsCount) {
    resultsCount = document.createElement("div");
    resultsCount.className = "results-count";
    resultsCount.style.cssText = `
      padding: 10px 30px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    `;

    // Chèn vào sau filters
    const filters = document.querySelector(".todo-filters");
    if (filters) {
      filters.parentNode.insertBefore(resultsCount, filters.nextSibling);
    }
  }

  // Cập nhật nội dung
  if (this._searchQuery || this._currentFilter !== "all") {
    resultsCount.textContent = `Hiển thị ${filteredCount} trong tổng số ${totalCount} công việc`;
  } else {
    resultsCount.textContent = `Tổng cộng ${totalCount} công việc`;
  }
};

// PHƯƠNG THỨC EDIT TASK
TodoApp.prototype._editTask = function () {
  const listTask = this._rootTodo.querySelectorAll(".todo-item");

  listTask.forEach((item) => {
    const idTask = item.dataset.id;
    const btnEditTask = item.querySelector(".edit-btn");

    if (btnEditTask) {
      btnEditTask.onclick = (e) => {
        e.stopPropagation();

        // === CHUYỂN SANG CHẾ ĐỘ EDIT ===
        this._setModalEditMode(idTask);

        // === ĐIỀN DỮ LIỆU VÀO MODAL ===
        this._populateModalWithTaskData(idTask);

        // === MỞ MODAL ===
        this._openModalAddTask();
      };
    }
  });
};

// PHƯƠNG THỨC SET CHẾ ĐỘ EDIT CHO MODAL
TodoApp.prototype._setModalEditMode = function (taskId) {
  this._modalMode = "edit";
  this._editingTaskId = taskId;

  // Cập nhật tiêu đề modal
  const modalTitle = document.querySelector("#modalTitle");
  modalTitle.textContent = "Chỉnh sửa công việc";

  // Cập nhật text button
  const saveBtn = document.querySelector("#saveTask");
  saveBtn.textContent = "Cập nhật công việc";
};

// PHƯƠNG THỨC SET CHẾ ĐỘ ADD CHO MODAL
TodoApp.prototype._setModalAddMode = function () {
  this._modalMode = "add";
  this._editingTaskId = null;

  // Cập nhật tiêu đề modal
  const modalTitle = document.querySelector("#modalTitle");
  modalTitle.textContent = "Thêm công việc mới";

  // Cập nhật text button
  const saveBtn = document.querySelector("#saveTask");
  saveBtn.textContent = "Lưu công việc";
};

// PHƯƠNG THỨC ĐIỀN DỮ LIỆU TASK VÀO MODAL
TodoApp.prototype._populateModalWithTaskData = function (taskId) {
  // Tìm task trong data API
  const task = this._dataAPI.find((t) => t.id == taskId);
  if (!task) return;

  // Lấy form elements
  const form = document.querySelector("#taskForm");
  const titleInput = form.querySelector("#taskName");
  const descriptionInput = form.querySelector("#taskDescription");
  const categorySelect = form.querySelector("#taskCategory");
  const prioritySelect = form.querySelector("#taskPriority");
  const dateInput = form.querySelector("#taskDate");
  const startTimeInput = form.querySelector("#taskStartTime");
  const endTimeInput = form.querySelector("#taskEndTime");
  const colorInput = form.querySelector("#taskColor");

  // Điền dữ liệu vào form
  titleInput.value = task.title || "";
  descriptionInput.value = task.description || "";
  categorySelect.value = task.category || "";
  prioritySelect.value = task.priority || "medium";
  dateInput.value = task.dateFinish || "";
  startTimeInput.value = task.startTime || "";
  endTimeInput.value = task.endTime || "";
  colorInput.value = task.color || "#667eea";

  // Cập nhật màu preset nếu có
  this._updateColorPreset(task.color);
};

// PHƯƠNG THỨC CẬP NHẬT MÀU PRESET
TodoApp.prototype._updateColorPreset = function (color) {
  const colorPresets = document.querySelectorAll(".color-preset");
  colorPresets.forEach((preset) => {
    if (preset.dataset.color === color) {
      preset.classList.add("active");
    } else {
      preset.classList.remove("active");
    }
  });
};

// PHƯƠNG THỨC RESET FORM MODAL
TodoApp.prototype._resetModalForm = function () {
  const form = document.querySelector("#taskForm");
  form.reset();

  // Reset màu về mặc định
  const colorInput = form.querySelector("#taskColor");
  colorInput.value = "#667eea";

  // Reset color presets
  const colorPresets = document.querySelectorAll(".color-preset");
  colorPresets.forEach((preset) => {
    preset.classList.remove("active");
  });

  // Kích hoạt preset đầu tiên
  if (colorPresets[0]) {
    colorPresets[0].classList.add("active");
  }
};

// PHƯƠNG THỨC BIND EVENTS CHO FILTERS
TodoApp.prototype._bindFilterEvents = function () {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.onclick = (e) => {
      const filterType = e.target.dataset.filter;

      // Cập nhật active state
      filterButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      // Cập nhật filter hiện tại
      this._currentFilter = filterType;

      // Re-render với filter mới
      this.render();
    };
  });
};

// PHƯƠNG THỨC BIND EVENTS CHO SEARCH
TodoApp.prototype._bindSearchEvents = function () {
  const searchInput = document.querySelector("#searchInput");

  // Xử lý input event với debounce
  let searchTimeout;
  searchInput.oninput = (e) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      this._searchQuery = e.target.value.toLowerCase().trim();
      this.render();
    }, 300); // Debounce 300ms
  };

  // Xử lý clear search
  searchInput.onkeydown = (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      this._searchQuery = "";
      this.render();
    }
  };
};

// PHƯƠNG THỨC UPDATE TASK
TodoApp.prototype._deleteTask = function () {
  const listTask = this._rootTodo.querySelectorAll(".todo-item");

  listTask.forEach((item) => {
    const idTask = item.dataset.id;
    const titleTask = item.querySelector(".todo-text").textContent;
    const deleteBtn = item.querySelector(".delete-btn");

    if (deleteBtn) {
      deleteBtn.onclick = (e) => {
        e.stopPropagation();

        const confirmDelete = confirm(
          `Bạn có chắc chắn muốn xoá Task "${titleTask}" không?`
        );
        if (!confirmDelete) return;

        fetch(this._baseUrl + idTask, {
          method: "DELETE",
        }).then((res) => {
          if (res.ok) {
            // Re-render sau khi xóa thành công
            this.render();
          }
        });
      };
    }
  });
};

// PHƯƠNG THỨC POST DATA LÊN API
TodoApp.prototype._postDataAPI = async function (dataPOST) {
  const res = await fetch("http://localhost:3000/tasks/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataPOST),
  });

  const result = await res.json();

  // Cập nhật lại UI sau khi thêm thành công
  if (res.ok) {
    // Re-render để áp dụng filter và search
    this.render();
  }

  return result;
};

// PHƯƠNG THỨC UPDATE TASK LÊN API
TodoApp.prototype._updateTaskAPI = async function (taskId, dataUpdate) {
  const res = await fetch(`${this._baseUrl}${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataUpdate),
  });

  const result = await res.json();

  // Cập nhật lại UI sau khi update thành công
  if (res.ok) {
    // Cập nhật data local
    const updatedTaskIndex = this._dataAPI.findIndex((t) => t.id == taskId);
    if (updatedTaskIndex !== -1) {
      this._dataAPI[updatedTaskIndex] = {
        ...this._dataAPI[updatedTaskIndex],
        ...dataUpdate,
      };
    }

    // Re-render để áp dụng filter và search
    this.render();
  }

  return result;
};

// PHƯƠNG THỨC GET DATA TỪ API
TodoApp.prototype._getDataAPI = async function () {
  const res = await fetch("http://localhost:3000/tasks/");
  const data = await res.json();

  return data;
};

// PHƯƠNG THỨC ĐÓNG MODAL ADD TASK
TodoApp.prototype._closeModalAddTask = function () {
  this._modalAddTask.classList.remove("active");

  // Reset về chế độ add sau khi đóng modal
  this._setModalAddMode();
};

// PHƯƠNG THỨC MỞ MODAL ADD TASK
TodoApp.prototype._openModalAddTask = function () {
  this._modalAddTask.classList.add("active");
};

// PHƯƠNG THỨC MỞ MODAL ADD TASK (CHO BUTTON ADD MỚI)
TodoApp.prototype._openModalAddNewTask = function () {
  // Set chế độ add
  this._setModalAddMode();

  // Reset form về trống
  this._resetModalForm();

  // Mở modal
  this._modalAddTask.classList.add("active");
};

// PHƯƠNG THỨC FORMAT DATE
TodoApp.prototype._formatDate = function (iosString) {
  const date = new Date(iosString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth()).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

// PHƯƠNG THỨC FORMAT TIME
TodoApp.prototype._formatTime = function (iosString) {
  const minute = Number(date.getMinutes()).padStart(2, "0");
  const hours = Number(date.getHours()).padStart(2, "0");

  return `${hours}:${minute}`;
};

// PHƯƠNG THỨC ESCAPE HTML
TodoApp.prototype._escapeHTML = function (input) {
  const temp = document.createElement("div");
  temp.textContent = input;

  return temp.innerHTML;
};

// ===============================

// USE
const todoApp = new TodoApp();
