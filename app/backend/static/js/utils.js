// utils.js
import { fetchProjectsAndRoles } from "./api.js";

export { showNotification, resetInput, enableInputFields, disableInputFields, populateSelects };

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

  // Funzione helper per svuotare un select
  const clearOptions = (select) => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  };

  // Funzione helper per popolare un select
  const populateSelect = (select, items, defaultValue) => {
    const fragment = document.createDocumentFragment(); // Evita reflow creando un frammento

    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;

      if (item === defaultValue) {
        option.selected = true; // Imposta il valore predefinito
      }

      fragment.appendChild(option);
    });

    select.appendChild(fragment); // Appendi tutte le opzioni in un'unica operazione
  };

  // Svuota le selezioni
  clearOptions(projectSelect);
  clearOptions(roleSelect);

  // Recupera i progetti e i ruoli e popola i select
  return fetchProjectsAndRoles()
    .then(({ projects, roles }) => {
      populateSelect(projectSelect, projects, defaultProject);
      populateSelect(roleSelect, roles, defaultRole);
    })
    .catch(error => {
      console.error("Error populating selects:", error);
    });
}

