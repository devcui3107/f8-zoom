// Khai báo biến
const codeEditor = document.getElementById("codeEditor");
const previewBody = document.getElementById("previewBody");

// Function để cập nhật preview
function updatePreview() {
  const code = codeEditor.value;

  try {
    // Tạo iframe
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "width: 100%; height: 100%; border: none; background: white;";

    // Xóa nội dung cũ và thêm iframe
    previewBody.innerHTML = "";
    previewBody.appendChild(iframe);

    // Đưa code vào iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
  } catch (error) {
    previewBody.innerHTML = `
      <div style="padding: 20px; color: #666; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ff6b6b; margin-bottom: 10px;"></i>
        <p>Lỗi khi render code. Vui lòng kiểm tra lại syntax.</p>
      </div>
    `;
  }
}

// Event
codeEditor.addEventListener("input", updatePreview);
codeEditor.addEventListener("keyup", updatePreview);

// Buttons
document
  .querySelector('.control-btn[title="Run Code"]')
  .addEventListener("click", updatePreview);
document
  .querySelector('.control-btn[title="Clear"]')
  .addEventListener("click", () => {
    codeEditor.value = "";
    updatePreview();
  });
