document.addEventListener("DOMContentLoaded", function () {
  // Khai báo biến
  const listCardProd = document.querySelector("#products-grid");
  const loadMoreBtn = document.querySelector(".load-more__button");

  // Call API bằng XHR
  let skip = 0;
  const limit = 30;

  function send(skip = 0) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const baseUrl = `https://dummyjson.com/products?skip=${skip}`;

      xhr.onload = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
          const type = xhr.getResponseHeader("Content-Type");
          const isJson = type && type.includes("application/json");
          if (isJson) {
            resolve(JSON.parse(xhr.responseText));
          }
        }
      };

      xhr.onerror = () => {
        reject("Error Network");
      };

      xhr.open("GET", baseUrl, true);
      xhr.send();
    });
  }

  // Render lần đầu 8 sản phẩm
  send().then((prodList) => {
    const arrProduct = prodList.products.slice(0, 8);
    const htmlString = arrProduct
      .map((prod) => {
        return renderProduct(prod);
      })
      .join("");
    listCardProd.innerHTML = htmlString;
  });

  // Render thêm
  loadMoreBtn.onclick = () => {
    skip += 8;
    send(skip).then((prodList) => {
      const arrProduct = prodList.products.slice(0, 8);
      const htmlString = arrProduct
        .map((prod) => {
          return renderProduct(prod);
        })
        .join("");
      listCardProd.innerHTML += htmlString;

      // Giới hạn sản phẩm để ẩn nút tải thêm
      if (skip >= limit - 8) {
        loadMoreBtn.style.display = "none";
      }
    });
  };

  // Template Card Product
  function renderProduct(prod) {
    // Xử lý điều kiện hàng tồn kho (số lượng và class)
    const statusStockNum =
      prod.stock >= 10
        ? `Còn hàng (${prod.stock})`
        : `Sắp hết hàng (${prod.stock})`;
    const statusStockClass =
      prod.stock >= 10 ? "stock-status--in-stock" : "stock-status--low-stock";

    // Xử lý tính ra giá gốc
    const originalPrice = (
      prod.price /
      (1 - prod.discountPercentage / 100)
    ).toFixed(2);

    return `<div
                class="product-card"
                data-category="${prod.category}"
                data-price="${prod.price}"
              >
                <div class="product-card__image">
                  <img
                    src="${prod.thumbnail}"
                    alt="${prod.title}"
                  />
                  <div class="product-card__overlay">
                    <a href="detail-prod.html?id=${
                      prod.id
                    }" class="product-card__quick-view">
                      <i class="fas fa-eye"></i>
                    </a>
                    <button class="product-card__wishlist">
                      <i class="fas fa-heart"></i>
                    </button>
                  </div>
                  <div class="product-card__badge product-card__badge--sale">
                    -${prod.discountPercentage.toFixed(0)}%
                  </div>
                </div>
                <div class="product-card__content">
                  <div class="product-card__category">${prod.category}</div>
                  <h3 class="product-card__title">
                    <a href="detail-prod.html?id=${prod.id}"
                      >${prod.title}</a
                    >
                  </h3>
                  <div class="product-card__rating">
                    <div class="stars">
                      ${renderStars(prod.rating)}
                    </div>
                    <span class="rating-text">(${prod.rating})</span>
                  </div>
                  <div class="product-card__price">
                    <span class="current-price">$${prod.price}</span>
                    <span class="original-price">$${originalPrice}</span>
                  </div>
                  <div class="product-card__stock">
                    <span class="stock-status ${statusStockClass}">
                      <i class="fas fa-check-circle"></i>
                      ${statusStockNum}
                    </span>
                  </div>
                </div>
              </div>`;
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
});
