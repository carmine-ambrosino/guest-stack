import { showNotification } from "./utils.js";

export function createUserElement(user, onEdit, onDelete, onProject) {
  const li = document.createElement("li");
  li.className =
    "p-4 bg-gray-100 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center";

  // Sezione sinistra: informazioni dell'utente
  const leftDiv = document.createElement("div");
  leftDiv.className = "flex flex-col items-start";

  const username = createTextElement(
    "p",
    user.username,
    "text-2xl font-bold text-gray-800"
  );
  leftDiv.appendChild(username);

  const email = createTextElement("p", user.email, "text-sm text-gray-600");
  const project = createTextElement(
    "p",
    `📂 ${user.project_name}`,
    "text-base font-bold text-gray-500"
  );
  const roleBadge = createRoleBadge(user.role);

  leftDiv.appendChild(email);
  leftDiv.appendChild(project);
  leftDiv.appendChild(roleBadge);

  // Sezione destra: stato e pulsanti
  const rightDiv = document.createElement("div");
  rightDiv.className = "flex flex-col items-end";

  const statusDiv = createStatusDiv(user);
  rightDiv.appendChild(statusDiv);

  const expiryDate = createTextElement(
    "p",
    new Date(user.expiry_time).toLocaleDateString("it-IT"),
    "text-base font-bold text-gray-800"
  );
  const expiryTime = createTextElement(
    "p",
    new Date(user.expiry_time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    "text-xs text-gray-500"
  );

  rightDiv.appendChild(expiryDate);
  rightDiv.appendChild(expiryTime);

  // Div per i pulsanti
  const buttonDiv = createButtonDiv(user.id, user, onEdit, onDelete, onProject);
  rightDiv.appendChild(buttonDiv);

  li.appendChild(leftDiv);
  li.appendChild(rightDiv);

  return li;
}

// Funzione per creare il badge del ruolo
function createRoleBadge(role) {
  const roleBadge = document.createElement("span");
  roleBadge.className = `mt-1 text-xs font-bold px-3 py-1 rounded-full inline-block ${
    role === "admin"
      ? "bg-blue-100 text-blue-700"
      : role === "member"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700"
  }`;
  roleBadge.textContent = role;
  return roleBadge;
}

// Funzione per creare lo stato
function createStatusDiv(user) {
  const statusDiv = document.createElement("div");
  statusDiv.className = `text-xs font-bold px-3 py-1 rounded-lg mb-2 ${
    user.status === "active"
      ? "bg-green-100 text-green-700"
      : user.status === "expiring soon"
      ? "bg-yellow-100 text-yellow-700"
      : user.status === "expired"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700" // Valore di default
  }`;

  statusDiv.textContent =
    user.status === "active"
      ? "Active"
      : user.status === "expiring soon"
      ? "Expiring Soon"
      : user.status === "expired"
      ? "Expired"
      : "Unknown Status";
  return statusDiv;
}

// Funzione per creare il div dei pulsanti
function createButtonDiv(userId, user, onEdit, onDelete, onProject) {
  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flex gap-2 mt-2";

  // Pulsante per modificare (🖊)
  const updateButton = createButton("🖊", "text-blue-500 hover:text-blue-600");
  updateButton.addEventListener("click", async () => {
    try {
      await onEdit(user);
    } catch (error) {
      showNotification("Failed to update user: " + error.message, "error");
    }
  });

  // Pulsante per un nuovo progetto (🆕📁)
  const projectButton = createButton(
    "🆕📁",
    "text-green-500 hover:text-green-600"
  );
  projectButton.addEventListener("click", async () => {
    try {
      await onProject(userId);
    } catch (error) {
      showNotification("Failed to update project: " + error.message, "error");
    }
  });

  // Pulsante per eliminare (❌)
  const deleteButton = createButton("❌", "text-red-500 hover:text-red-600");
  deleteButton.addEventListener("click", async () => {
    try {
      await onDelete(userId);
    } catch (error) {
      showNotification("Failed to delete user: " + error.message, "error");
    }
  });

  buttonDiv.appendChild(projectButton);
  buttonDiv.appendChild(updateButton);
  buttonDiv.appendChild(deleteButton);

  return buttonDiv;
}

// Funzione per creare un pulsante
function createButton(text, className) {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = text;
  return button;
}

// Funzione per creare un elemento di testo
function createTextElement(tag, textContent, className) {
  const element = document.createElement(tag);
  element.textContent = textContent;
  element.className = className;
  return element;
}
