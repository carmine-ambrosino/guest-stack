// utils.js
import { fetchProjectsAndRoles } from "./api.js";

export {
  showNotification,
  enableInputFields,
  disableInputFields,
  populateSelects,
  setCurrentDate
};

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

// Disable input fields
function disableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.disabled = true;
      field.classList.add("bg-gray-100", "text-gray-400");
    }
  });
}

// enable input fields
function enableInputFields(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.disabled = false;
      field.classList.remove("bg-gray-100", "text-gray-400");
    }
  });
}

//populate selects
async function populateSelects(defaultProject = "", defaultRole = "") {
  const projectSelect = document.getElementById("project");
  const roleSelect = document.getElementById("role");

  // helper to clear select
  const clearOptions = (select) => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  };

  // helper for populate select
  const populateSelect = (select, items, defaultValue) => {
    const fragment = document.createDocumentFragment(); // no reflow

    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;

      if (item === defaultValue) {
        option.selected = true; // default value
      }

      fragment.appendChild(option);
    });

    select.appendChild(fragment);
  };

  clearOptions(projectSelect);
  clearOptions(roleSelect);

  // fetch projects and roles
  return fetchProjectsAndRoles()
    .then(({ projects, roles }) => {
      populateSelect(projectSelect, projects, defaultProject);
      populateSelect(roleSelect, roles, defaultRole);
    })
    .catch((error) => {
      console.error("Error populating selects:", error);
    });
}

// Function to set the current date in ISO format (YYYY-MM-DD) in a given input field
function setCurrentDate(inputId) {
  // Get the current date
  const today = new Date();
  
  // Format the date to ISO format (YYYY-MM-DD), excluding the time
  const formattedDate = today.toISOString().split('T')[0]; // Split by 'T' and take the date part
  
  // Set the formatted date in the input field with the given inputId
  document.getElementById(inputId).value = formattedDate;
}
