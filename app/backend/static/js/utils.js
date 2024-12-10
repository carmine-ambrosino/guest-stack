// utils.js

// show notification
function showNotification(message, type = "info") {
  const notificationContainer = document.getElementById(
    "notificationContainer"
  );

  const notification = document.createElement("div");
  notification.textContent = message;

  notification.className = `p-4 rounded-lg shadow-lg text-white font-bold transition-transform duration-300 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;

  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // timout notification
  setTimeout(() => {
    notification.classList.add("opacity-0");
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Reset input
function resetInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    input.classList.remove("focus:ring-2", "focus:ring-gray-400");
    input.classList.add("border-gray-300");
  }
}

function enableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    field.disabled = false;
    field.classList.remove("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  });
}

function disableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    field.disabled = true;
    field.classList.add("bg-gray-50", "text-gray-400", "cursor-not-allowed");
  });
}

export { showNotification, resetInput, enableInputFields, disableInputFields };
