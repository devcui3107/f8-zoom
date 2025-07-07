function TinderApp(containerSelector, options = {}) {
  this.options = {
    swipeThreshold: 150,
    animationDuration: 300,
    easingFunction: "ease-out",
    ...options,
  };

  // Khai báo biến
  this.container = document.querySelector(containerSelector);
  this.cards = [];
  this.cardWidth = 0;
  this.cardHeight = 0;

  // State
  this.currentIndex = 0;
  this.isDragging = false;
  this.isAnimating = false;
  this.startX = 0;
  this.startY = 0;
  this.lastDeltaX = 0;
  this.lastDeltaY = 0;

  // Khởi tạo
  this._init();
}

TinderApp.prototype._init = function () {
  if (!this.container) {
    console.error("Container not found");
    return;
  }

  this._setupCards();
  this._setupEventListeners();
  this._setupInitialState();
};

TinderApp.prototype._setupCards = function () {
  this.cards = Array.from(this.container.querySelectorAll(".profile-card"));

  if (this.cards.length === 0) {
    console.error("No cards found");
    return;
  }

  // Lấy kích thước card
  const firstCard = this.cards[0];
  const rect = firstCard.getBoundingClientRect();
  this.cardWidth = rect.width;
  this.cardHeight = rect.height;
};

TinderApp.prototype._setupEventListeners = function () {
  this.cards.forEach((card) => {
    // Mouse events - chỉ thêm mousedown cho từng card
    card.addEventListener("mousedown", (e) => this._handleMouseDown(e));

    // Touch events cho mobile
    card.addEventListener("touchstart", (e) => this._handleTouchStart(e));
  });

  // Thêm mousemove và mouseup cho document (chỉ khi cần)
  document.addEventListener("mousemove", (e) => this._handleMouseMove(e));
  document.addEventListener("mouseup", (e) => this._handleMouseUp(e));
  document.addEventListener("touchmove", (e) => this._handleTouchMove(e));
  document.addEventListener("touchend", (e) => this._handleTouchEnd(e));
};

TinderApp.prototype._setupInitialState = function () {
  this._updateCardVisibility();
};

TinderApp.prototype._handleTouchStart = function (e) {
  if (this.isAnimating) return;

  const touch = e.touches[0];
  this.startX = touch.clientX;
  this.startY = touch.clientY;
  this.isDragging = true;

  // Tắt transition khi bắt đầu drag
  const currentCard = this._getCurrentCard();
  if (currentCard) {
    currentCard.style.transition = "none";
  }

  // Ẩn overlay khi bắt đầu drag
  this._hideActionOverlays();
};

TinderApp.prototype._handleTouchMove = function (e) {
  if (!this.isDragging || this.isAnimating) return;

  e.preventDefault();
  e.stopPropagation();
  const touch = e.touches[0];
  const deltaX = touch.clientX - this.startX;
  const deltaY = touch.clientY - this.startY;

  // Cập nhật vị trí card với easing
  this._updateCardPosition(deltaX, deltaY);

  // Hiển thị overlay dựa trên hướng swipe
  this._showActionOverlay(deltaX);
  console.log("Touch move - deltaX:", deltaX);
};

TinderApp.prototype._handleTouchEnd = function (e) {
  if (!this.isDragging || this.isAnimating) return;

  this.isDragging = false;
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - this.startX;
  const deltaY = touch.clientY - this.startY;

  // Kiểm tra xem có swipe đủ xa không
  if (Math.abs(deltaX) > this.options.swipeThreshold) {
    // Swipe đủ xa - thực hiện swipe
    const direction = deltaX > 0 ? "right" : "left";
    this.swipe(direction);
  } else {
    // Không swipe đủ xa - trở về vị trí ban đầu
    this._resetCardPosition();
  }

  // Ẩn overlay
  this._hideActionOverlays();
};

TinderApp.prototype._handleMouseDown = function (e) {
  if (this.isAnimating) return;

  console.log("Mouse down detected");
  this.startX = e.clientX;
  this.startY = e.clientY;
  this.isDragging = true;

  // Tắt transition khi bắt đầu drag
  const currentCard = this._getCurrentCard();
  if (currentCard) {
    currentCard.style.transition = "none";
    console.log("Current card found");
  } else {
    console.log("No current card found");
  }

  // Ẩn overlay khi bắt đầu drag
  this._hideActionOverlays();
};

TinderApp.prototype._handleMouseMove = function (e) {
  if (!this.isDragging || this.isAnimating) return;

  e.preventDefault();
  e.stopPropagation();
  const deltaX = e.clientX - this.startX;
  const deltaY = e.clientY - this.startY;

  // Cập nhật vị trí card với easing
  this._updateCardPosition(deltaX, deltaY);

  // Hiển thị overlay dựa trên hướng swipe
  this._showActionOverlay(deltaX);
  console.log("Mouse move - deltaX:", deltaX);
};

TinderApp.prototype._handleMouseUp = function (e) {
  if (!this.isDragging || this.isAnimating) return;

  console.log("Mouse up detected");
  this.isDragging = false;
  const deltaX = e.clientX - this.startX;
  const deltaY = e.clientY - this.startY;

  // Kiểm tra xem có swipe đủ xa không
  if (Math.abs(deltaX) > this.options.swipeThreshold) {
    // Swipe đủ xa - thực hiện swipe
    const direction = deltaX > 0 ? "right" : "left";
    this.swipe(direction);
  } else {
    // Không swipe đủ xa - trở về vị trí ban đầu
    this._resetCardPosition();
  }

  // Ẩn overlay
  this._hideActionOverlays();
};

TinderApp.prototype._updateCardPosition = function (deltaX, deltaY) {
  const currentCard = this._getCurrentCard();
  if (!currentCard) return;

  // Thêm easing cho movement
  const easedDeltaX = deltaX * 0.8;
  const easedDeltaY = deltaY * 0.6;

  // Bỏ scale effect, chỉ giữ nguyên kích thước
  currentCard.style.transform = `translate(${easedDeltaX}px, ${easedDeltaY}px) rotate(${this._calculateRotation(
    deltaX,
    deltaY
  )}deg)`;

  // Cập nhật opacity của card tiếp theo dựa trên khoảng cách swipe
  this._updateNextCardOpacity(deltaX);

  this.lastDeltaX = deltaX;
  this.lastDeltaY = deltaY;
};

TinderApp.prototype._updateNextCardOpacity = function (deltaX) {
  const nextCard = this.cards[this.currentIndex + 1];
  if (!nextCard) return;

  // Tính toán opacity dựa trên khoảng cách swipe
  const swipeProgress = Math.abs(deltaX) / this.options.swipeThreshold;
  const clampedProgress = Math.min(swipeProgress, 1);

  // Opacity tăng từ 0.9 đến 1 khi swipe
  const newOpacity = 0.9 + 0.1 * clampedProgress;
  nextCard.style.opacity = newOpacity;

  // Bỏ scale effect, chỉ giữ nguyên kích thước
  nextCard.style.transform = "translate(0, 0) rotate(0deg)";
};

TinderApp.prototype._calculateRotation = function (deltaX, deltaY) {
  const currentCard = this._getCurrentCard();
  if (!currentCard) return 0;

  // Tính toán vị trí touch tương đối trên card
  const cardRect = currentCard.getBoundingClientRect();
  const relativeX = (this.startX - cardRect.left) / this.cardWidth;
  const relativeY = (this.startY - cardRect.top) / this.cardHeight;

  // Sửa lỗi rotation - dựa trên hướng swipe thay vì vị trí touch
  let baseRotation = 0;

  if (deltaX > 0) {
    baseRotation = 15;
  } else {
    baseRotation = -15;
  }

  // Thêm rotation dựa trên vị trí touch để tự nhiên hơn
  const touchRotation = (relativeX - 0.5) * 10;
  const intensity = Math.min(Math.abs(deltaX) / this.cardWidth, 1);

  return (baseRotation + touchRotation) * intensity;
};

TinderApp.prototype._resetCardPosition = function () {
  const currentCard = this._getCurrentCard();
  if (!currentCard) return;

  // Bật lại transition với easing (bỏ scale)
  currentCard.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
  currentCard.style.transform = "translate(0, 0) rotate(0deg)";
  currentCard.style.opacity = "1";
  currentCard.style.visibility = "visible";

  setTimeout(() => {
    currentCard.style.transition = "";
  }, this.options.animationDuration);
};

TinderApp.prototype.swipe = function (direction) {
  const currentCard = this._getCurrentCard();
  if (!currentCard) return;

  // Tính toán vị trí cuối cùng với easing
  const screenWidth = window.innerWidth;
  const finalX = direction === "right" ? screenWidth + 200 : -screenWidth - 200;
  const rotation = direction === "right" ? 25 : -25;

  // Animation swipe với easing (bỏ scale)
  currentCard.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
  currentCard.style.transform = `translate(${finalX}px, 0) rotate(${rotation}deg)`;

  // Ẩn card hoàn toàn sau khi swipe
  setTimeout(() => {
    currentCard.style.opacity = "0";
    currentCard.style.visibility = "hidden";
  }, this.options.animationDuration / 2);

  // Thêm class để hiển thị overlay
  currentCard.classList.add(
    direction === "right" ? "swiped-right" : "swiped-left"
  );

  // Chuyển sang card tiếp theo
  setTimeout(() => {
    this._nextCard();
  }, this.options.animationDuration);

  console.log(`Swiped ${direction} for card ${this.currentIndex}`);
};

TinderApp.prototype._nextCard = function () {
  this.currentIndex++;

  // Loop vô hạn
  if (this.currentIndex >= this.cards.length) {
    this.currentIndex = 0;
    this._resetAllCards();
  }

  this._updateCardVisibility();
};

TinderApp.prototype._updateCardVisibility = function () {
  this.cards.forEach((card, index) => {
    if (index === this.currentIndex) {
      // Card hiện tại - active
      card.classList.add("active");
      card.style.zIndex = this.cards.length - index;
      card.style.opacity = "1";
      card.style.transform = "translate(0, 0) rotate(0deg)";
      card.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
    } else if (index === this.currentIndex + 1) {
      // Card tiếp theo - hiện rõ
      card.classList.remove("active");
      card.style.zIndex = this.cards.length - index;
      card.style.opacity = "0.9";
      card.style.transform = "translate(0, 0) rotate(0deg)";
      card.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
    } else if (index === this.currentIndex + 2) {
      // Card thứ 3 - hiện mờ
      card.classList.remove("active");
      card.style.zIndex = this.cards.length - index;
      card.style.opacity = "0.7";
      card.style.transform = "translate(0, 0) rotate(0deg)";
      card.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
    } else {
      // Các card còn lại - ẩn
      card.classList.remove("active");
      card.style.zIndex = this.cards.length - index;
      card.style.opacity = "0.4";
      card.style.transform = "translate(0, 0) rotate(0deg)";
      card.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
    }
  });
};

TinderApp.prototype._getCurrentCard = function () {
  return this.cards[this.currentIndex] || null;
};

TinderApp.prototype._showActionOverlay = function (deltaX) {
  // Tìm nút trong toàn bộ document vì nút nằm ngoài card-container
  const nopeBtn = document.querySelector(".nope-btn");
  const likeBtn = document.querySelector(".like-btn");

  if (!nopeBtn || !likeBtn) {
    console.log("Không tìm thấy nút action");
    return;
  }

  // Ẩn tất cả overlay trước
  this._hideActionOverlays();

  if (deltaX < -50) {
    // Swipe trái - hiển thị nút X
    nopeBtn.classList.add("overlay-active");
    console.log("Hiển thị nút X");
  } else if (deltaX > 50) {
    // Swipe phải - hiển thị nút tim
    likeBtn.classList.add("overlay-active");
    console.log("Hiển thị nút tim");
  }
};

TinderApp.prototype._hideActionOverlays = function () {
  const nopeBtn = document.querySelector(".nope-btn");
  const likeBtn = document.querySelector(".like-btn");

  if (nopeBtn) {
    nopeBtn.classList.remove("overlay-active");
  }

  if (likeBtn) {
    likeBtn.classList.remove("overlay-active");
  }
};

TinderApp.prototype._resetAllCards = function () {
  this.cards.forEach((card) => {
    card.style.visibility = "visible";
    card.style.transition = `all ${this.options.animationDuration}ms ${this.options.easingFunction}`;
    card.style.transform = "translate(0, 0) rotate(0deg)";
    card.style.opacity = "1";
    card.classList.remove("swiped-left", "swiped-right", "super-liked");

    setTimeout(() => {
      card.style.transition = "";
    }, this.options.animationDuration);
  });
};

// USE
const tinder = new TinderApp(".card-container");
