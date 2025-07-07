function Lopza(selector, option) {
  this._sliderWrapper = document.querySelector(selector);
  this._sliderInner = this._sliderWrapper.querySelector(".slider-inner");
  this._sliderList = this._sliderInner.querySelector(".slider-list"); // Điều khiển trượt bằng transform
  this._sliderArray = [...this._sliderList.children];

  this.opt = Object.assign({}, option);

  this.currentIndex = 0;

  // Button
  const btnPrev = this._sliderWrapper.querySelector(".slider-btn--prev");
  const btnNext = this._sliderWrapper.querySelector(".slider-btn--next");

  // Dots & Event
  const dots = this._sliderWrapper.querySelector(".slider-dots");
  this._dotArray = [...dots.children];
  this._dotArray.forEach((dot, index) => {
    dot.onclick = () => {
      this.currentIndex = index;
      this.goToSliderByIndex(index);
      this._updateDotActive();
    };
  });

  // Event
  btnNext.onclick = () => {
    this.currentIndex += 1;
    this.goToSliderByIndex(this.currentIndex);
    this._updateDotActive();
  };
  btnPrev.onclick = () => {
    this.currentIndex -= 1;
    this.goToSliderByIndex(this.currentIndex);
    this._updateDotActive();
  };

  // Xử lý Auto trượt cho Slider
  if (this.opt.auto) {
    this.autoSlider = setInterval(() => {
      btnNext.click();
    }, 3000);

    // Dừng auto khi hover
    this._sliderList.onmouseenter = () => {
      clearInterval(this.autoSlider);
    };

    // Bật lại auto khi rời chuột
    this._sliderList.onmouseleave = () => {
      this.autoSlider = setInterval(() => {
        btnNext.click();
      }, 3000);
    };
  }

  this.goToSliderByIndex(this.currentIndex);
  this._updateNumberSlider();
}

Lopza.prototype.goToSliderByIndex = function (index) {
  index = parseInt(index);
  if (index >= this._sliderArray.length) {
    index = 0;
    this.currentIndex = index;
  } else if (index < 0) {
    index = this._sliderArray.length - 1;
    this.currentIndex = index;
  }
  this._sliderList.style.transform = `translateX(-${index * 100}%)`;
  this._updateNumberSlider();
};

Lopza.prototype._updateDotActive = function () {
  this._dotArray.forEach((dot) => dot.classList.remove("active"));
  this._dotArray[this.currentIndex].classList.add("active");
};

Lopza.prototype._updateNumberSlider = function () {
  const totalNumberSlider = this._sliderWrapper.querySelector(".total-slides");
  const currentNumberSlider =
    this._sliderWrapper.querySelector(".current-slide");
  totalNumberSlider.textContent = `/ ${this._sliderArray.length}`;
  currentNumberSlider.textContent = `${this.currentIndex + 1}`;
};

// USE:
const slider1 = new Lopza("#slider-1", {
  auto: true,
});
const slider2 = new Lopza("#slider-2", {
  auto: false,
});
