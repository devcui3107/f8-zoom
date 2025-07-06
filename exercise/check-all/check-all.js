function CheckZa(option) {
  const wrapper = document.querySelector(option.wrapper);
  this.checkMaster = wrapper.querySelector(option.checkMaster);
  this.listCheckChild = wrapper.querySelectorAll(option.listCheckChild);
  this.totalCheckboxChild = wrapper.querySelector(option.totalCheckboxChild);
  this.selectedCheckbox = wrapper.querySelector(option.selectedCountCheckbox);

  this.updateMasterCheckbox();
  this.updateCountCheckbox();
}

CheckZa.prototype.updateMasterCheckbox = function () {
  const length = this.listCheckChild.length;
  this.listCheckChild.forEach((checkbox) => {
    checkbox.onchange = () => {
      const checkedItems = [...this.listCheckChild].filter((item) => {
        return item.checked;
      });

      // Xử lý các điều kiện quyết định trạng thái của checkbox Master
      if (checkedItems.length === 0) {
        this.checkMaster.indeterminate = false;
        this.checkMaster.checked = false;
      } else if (checkedItems.length === length) {
        this.checkMaster.indeterminate = false;
        this.checkMaster.checked = true;
      } else if (checkedItems.length > 0 && checkedItems.length < length) {
        this.checkMaster.indeterminate = true;
      }

      this.updateCountCheckbox();
    };
  });

  // Xử lý điều kiện khi checkbox Master được check thì các checkboxChild cũng được check full
  this.checkMaster.onchange = () => {
    this.listCheckChild.forEach((checkbox) => {
      checkbox.checked = this.checkMaster.checked;
    });
    this.updateCountCheckbox();
  };
};

CheckZa.prototype.updateCountCheckbox = function () {
  this.totalCheckboxChild.textContent = this.listCheckChild.length;

  const checkedItems = [...this.listCheckChild].filter((item) => {
    return item.checked;
  });

  if (checkedItems.length) {
    this.selectedCheckbox.textContent = checkedItems.length;
  } else {
    this.selectedCheckbox.textContent = 0;
  }
};

// USE
const tableUser = new CheckZa({
  wrapper: "#checkZaUser",
  checkMaster: "#checkZaUserAll",
  listCheckChild: "[data-table='user-table']",
  totalCheckboxChild: "#totalCountUser",
  selectedCountCheckbox: "#selectedCountUser",
});

const tableProduct = new CheckZa({
  wrapper: "#checkZaProduct",
  checkMaster: "#checkZaProductAll",
  listCheckChild: "[data-table='product-table']",
  totalCheckboxChild: "#totalCountProduct",
  selectedCountCheckbox: "#selectedCountProduct",
});
