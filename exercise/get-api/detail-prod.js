document.addEventListener("DOMContentLoaded", function () {
  // Lấy xuống id trên đường dẫn chi tiết sản phẩm
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // Call API bằng XHR
  async function getData() {
    const baseUrl = `https://dummyjson.com/products/${productId}`;
    try {
      const response = await fetch(baseUrl);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const dataAPI = await response.json();

      // Gọi các hàm render:
      renderBreadcrumb(dataAPI);
      renderShowImage(dataAPI);
      renderInfoProduct(dataAPI);
      renderTabInfoProduct(dataAPI);

      // Xử lý Event
      const productTabHeader = document.querySelector(".product-tabs__header");
      const productTabContent = document.querySelector(
        ".product-tabs__content"
      );

      productTabHeader.onclick = (e) => {
        const clickedTab = e.target;
        if (!clickedTab) return;

        // Xử lý Nav
        const listNav = productTabHeader.querySelectorAll(".product-tabs__tab");
        listNav.forEach((tab) => tab.classList.remove("active"));
        clickedTab.classList.add("active");

        // Xử lý Panel
        const idTab = clickedTab.dataset.tab;
        const listPanel = productTabContent.querySelectorAll(
          ".product-tabs__panel"
        );
        listPanel.forEach((panel) => {
          panel.classList.remove("active");
          if (panel.id === idTab) {
            panel.classList.add("active");
          }
        });
      };
    } catch (error) {
      console.error(error.message);
    }
  }

  // Hàm Render Breadcrumb Current
  function renderBreadcrumb(data) {
    const breadcrumbCurrent = document.querySelector(".breadcrumb__current");
    breadcrumbCurrent.textContent = data.title;
  }

  // Hàm Render Hình ảnh của chi tiết sản phẩm
  function renderShowImage(data) {
    const showImageDetail = document.querySelector(".product-images");

    const template = `<div class="product-images__main">
              <img
                src="${data.thumbnail}"
                alt="Essence Mascara"
                class="product-images__main-img"
              />
            </div>
            <div class="product-images__thumbnails">
              <div class="product-images__thumbnail active">
                <img
                  src="${data.thumbnail}"
                  alt="Thumbnail 1"
                />
              </div>
              <div class="product-images__thumbnail">
                <img
                  src="https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/2.webp"
                  alt="Thumbnail 2"
                />
              </div>
              <div class="product-images__thumbnail">
                <img
                  src="https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/3.webp"
                  alt="Thumbnail 3"
                />
              </div>
            </div>`;

    showImageDetail.innerHTML = template;
  }

  // Hàm Render Thông tin sản phẩm
  function renderInfoProduct(data) {
    const productInfo = document.querySelector(".product-info");

    // Xử lý điều kiện hàng tồn kho (số lượng và class)
    const statusStockNum =
      data.stock >= 10
        ? `Còn hàng: (${data.stock})`
        : `Sắp hết hàng: (${data.stock})`;
    const statusStockClass =
      data.stock >= 10 ? "stock-status--in-stock" : "stock-status--low-stock";

    // Xử lý tính ra giá gốc
    const originalPrice = (
      data.price /
      (1 - data.discountPercentage / 100)
    ).toFixed(2);

    // Xử lý Tags
    function handleTags() {
      return data.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
    }

    const template = `
            <div class="product-info__header">
              <div class="product-info__category">${data.category}</div>
              <div class="product-info__badge product-info__badge--sale">
                -${data.discountPercentage.toFixed(0)}%
              </div>
            </div>

            <h1 class="product-info__title">${data.title}</h1>

            <div class="product-info__rating">
              <div class="stars">
              ${renderStars(data.rating)}
              </div>
              <span class="rating-text">(${data.rating})</span>
              <span class="rating-count">${data.reviews.length} đánh giá</span>
            </div>

            <div class="product-info__price">
              <span class="current-price">$${data.price}</span>
              <span class="original-price">$${originalPrice}</span>
              <span class="discount-amount">Tiết kiệm $${(
                originalPrice - data.price
              ).toFixed(2)}</span>
            </div>

            <div class="product-info__stock">
              <span class="stock-status ${statusStockClass}">
                <i class="fas fa-check-circle"></i>
                ${statusStockNum} sản phẩm
              </span>
            </div>

            <div class="product-info__description">
              <p>
                ${data.description}
              </p>
            </div>

            <div class="product-info__actions">
              <div class="quantity-selector">
                <label for="quantity" class="quantity-label">Số lượng:</label>
                <div class="quantity-controls">
                  <button class="quantity-btn" data-action="decrease">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input
                    type="text"
                    id="quantity"
                    class="quantity-input"
                    value="1"
                    min="1"
                    max="99"
                  />
                  <button class="quantity-btn" data-action="increase">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="product-actions">
                <button class="btn btn--primary btn--add-to-cart">
                  <i class="fas fa-shopping-cart"></i>
                  Thêm vào giỏ hàng
                </button>
                <button class="btn btn--secondary btn--wishlist">
                  <i class="fas fa-heart"></i>
                  Yêu thích
                </button>
              </div>
            </div>

            <div class="product-info__meta">
              <div class="meta-item">
                <span class="meta-label">SKU:</span>
                <span class="meta-value">${data.sku}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Tags:</span>
                <div class="meta-tags">
                  ${handleTags()}
                </div>
              </div>
            </div>`;

    productInfo.innerHTML = template;
  }

  // Hàm Render Tab Comment sản phẩm
  function renderTabInfoProduct(data) {
    const productTab = document.querySelector(".product-tabs");

    const template = `
          <div class="product-tabs__header">
            <button class="product-tabs__tab active" data-tab="details">
              <i class="fas fa-info-circle"></i>
              Chi tiết
            </button>
            <button class="product-tabs__tab" data-tab="specifications">
              <i class="fas fa-cogs"></i>
              Thông số
            </button>
            <button class="product-tabs__tab" data-tab="reviews">
              <i class="fas fa-star"></i>
              Đánh giá (${data.reviews.length})
            </button>
            <button class="product-tabs__tab" data-tab="shipping">
              <i class="fas fa-shipping-fast"></i>
              Vận chuyển
            </button>
          </div>

          <div class="product-tabs__content">
            <!-- Details Tab -->
            <div class="product-tabs__panel active" id="details">
              <div class="product-details">
                <h3>Mô tả sản phẩm</h3>
                <p>
                  ${data.description}
                </p>

                <h4>Đặc điểm nổi bật:</h4>
                <ul>
                  <li>Updating...</li>
                  <li>Updating...</li>
                  <li>Updating...</li>
                  <li>Updating...</li>
                </ul>
              </div>
            </div>

            <!-- Specifications Tab -->
            <div class="product-tabs__panel" id="specifications">
              <div class="product-specifications">
                <div class="spec-item">
                  <span class="spec-label">Trọng lượng:</span>
                  <span class="spec-value">${data.weight}g</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Kích thước:</span>
                  <span class="spec-value">${data.dimensions.width} x ${
      data.dimensions.height
    } x ${data.dimensions.depth} cm</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Bảo hành:</span>
                  <span class="spec-value">1 week warranty</span>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div class="product-tabs__panel" id="reviews">
              <div class="product-reviews">
                <div class="reviews-summary">
                  <div class="reviews-average">
                    <div class="average-rating">${data.rating}</div>
                    <div class="stars">
                      ${renderStars(data.rating)}
                    </div>
                    <div class="total-reviews">${
                      data.reviews.length
                    } đánh giá</div>
                  </div>
                </div>

                <div class="reviews-list">
                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-info">
                        <div class="reviewer-name">${
                          data.reviews[0].reviewerName
                        }</div>
                        <div class="review-date">${formatDate(
                          data.reviews[0].date
                        )}</div>
                        <div class="review-date">${
                          data.reviews[0].reviewerEmail
                        }</div>
                      </div>
                      <div class="review-rating">
                        <div class="stars">
                          ${renderStars(data.reviews[0].rating)}
                        </div>
                      </div>
                    </div>
                    <div class="review-comment">${data.reviews[0].comment}</div>
                  </div>

                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-info">
                        <div class="reviewer-name">${
                          data.reviews[1].reviewerName
                        }</div>
                        <div class="review-date">${formatDate(
                          data.reviews[1].date
                        )}</div>
                        <div class="review-date">${
                          data.reviews[1].reviewerEmail
                        }</div>
                      </div>
                      <div class="review-rating">
                        <div class="stars">
                          ${renderStars(data.reviews[1].rating)}
                        </div>
                      </div>
                    </div>
                    <div class="review-comment">${data.reviews[1].comment}</div>
                  </div>

                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-info">
                        <div class="reviewer-name">${
                          data.reviews[2].reviewerName
                        }</div>
                        <div class="review-date">${formatDate(
                          data.reviews[2].date
                        )}</div>
                        <div class="review-date">${
                          data.reviews[2].reviewerEmail
                        }</div>
                      </div>
                      <div class="review-rating">
                        <div class="stars">
                          ${renderStars(data.reviews[2].rating)}
                        </div>
                      </div>
                    </div>
                    <div class="review-comment">${data.reviews[2].comment}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Tab -->
            <div class="product-tabs__panel" id="shipping">
              <div class="product-shipping">
                <div class="shipping-info">
                  <h4>Thông tin vận chuyển</h4>
                  <p>${data.shippingInformation}</p>

                  <h4>Chính sách bảo hành</h4>
                  <p>${data.warrantyInformation}</p>
                </div>
              </div>
            </div>
          </div>`;

    productTab.innerHTML = template;
  }

  // Hàm xử lý tính ra chuỗi html thẻ i theo số sao từng sản phẩm
  function renderStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 >= 0.5 ? 1 : 0;
    let emptyStars = 5 - fullStars - halfStar;

    let htmlString = "";

    for (let i = 0; i < fullStars; i++) {
      htmlString += '<i class="fas fa-star"></i>';
    }

    if (halfStar) {
      htmlString += '<i class="fas fa-star-half-alt"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
      htmlString += '<i class="far fa-star"></i>';
    }

    return htmlString;
  }

  // Hàm chuyển ngày tháng năm về định dạng Vi
  function formatDate(str) {
    const date = new Date(str);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Khởi chạy hàm lấy dữ liệu
  getData();
});
