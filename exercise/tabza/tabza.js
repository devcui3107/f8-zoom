export function Tabza(selector, option) {
  this.tabzaWrapper = document.querySelector(selector);
  const tabzaNavigation = this.tabzaWrapper.children[0];
  const tabzaContent = this.tabzaWrapper.children[1];
  this.listNavigation = [...tabzaNavigation.children];
  this.listPanel = [...tabzaContent.children];
  this.currentIndex = null;

  // Kiểm tra lỗi:
  if (!this.tabzaWrapper) {
    console.error(`Tabza: Không tìm thấy phần tử có id: ${selector}`);
  }

  this.opt = Object.assign({}, option);

  this._handleActiveTab();

  this._handleKeyboard();
}

Tabza.prototype._handleActiveTab = function () {
  // Lấy index tab từ option
  let defaultTabIndex = this.opt.tabActive || 0;

  this.listNavigation.forEach((item, index) => {
    item.onclick = () => {
      this._goToTabByIndex(index);
      this.currentIndex = index;
    };
  });

  this._goToTabByIndex(defaultTabIndex);
};

Tabza.prototype._goToTabByIndex = function (index) {
  if (index < 0 || index >= this.listNavigation.length) {
    console.error("Tabza: Index Tab Active không hợp lệ");
    return;
  }

  this.currentIndex = index;

  // Xoá các active cũ
  this.listNavigation.forEach((nav) => nav.classList.remove("active"));
  this.listPanel.forEach((item) => item.classList.remove("active"));

  // Active tab và panel hiện tại
  const nav = this.listNavigation[index];
  const idItem = nav.dataset.tab;
  nav.classList.add("active");

  const panel = this.listPanel.find((panel) => panel.id === idItem);
  if (panel) panel.classList.add("active");
};

Tabza.prototype._handleKeyboard = function () {
  if (this.opt.keyboardNavigation) {
    this.tabzaWrapper.onmouseenter = () => {
      document.onkeyup = (e) => {
        if (e.key === "ArrowRight") {
          this._goToTabByIndex(this.currentIndex + 1);
        } else if (e.key === "ArrowLeft") {
          this._goToTabByIndex(this.currentIndex - 1);
        }

        if (e.key >= "1" && e.key <= String(this.listNavigation.length)) {
          const index = parseInt(e.key, 10) - 1; // Xử lý chuyển key ép thành số index
          this._goToTabByIndex(index);
        }
      };
    };
    this.tabzaWrapper.onmouseleave = () => {
      document.onkeyup = null; // remove event
    };
  }
};

// USE:
const tabza1 = new Tabza("#tabza1", {
  tabActive: 0, // Theo index
  keyboardNavigation: true, // Cho phép dùng bàn phím (số hoặc phím mũi tên) để chuyển tab
  saveLocalStorage: true, // True nếu muốn lưu trạng thái active vào localStorage
});

const tabza2 = new Tabza("#tabza2", {
  tabActive: 1,
  keyboardNavigation: true,
  saveLocalStorage: true,
});
