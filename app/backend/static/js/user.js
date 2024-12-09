// user.js
export function createUserElement(user) {
  const li = document.createElement("li");
  li.className =
    "p-4 bg-gray-100 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center";

  // Colonna Sinistra
  const leftDiv = document.createElement("div");
  leftDiv.className = "flex flex-col items-start";

  // Username
  const username = createTextElement(
    "p",
    user.username,
    "text-2xl font-bold text-gray-800"
  );
  leftDiv.appendChild(username);

  // Email, Progetto, ruolo
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


  // Colonna Destra
  const rightDiv = document.createElement("div");
  rightDiv.className = "flex flex-col items-end";

  // Stato
  const statusDiv = createStatusDiv(user);
  rightDiv.appendChild(statusDiv);

  // Data e Ora di Scadenza
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

  // Pulsanti sotto l'ora di scadenza
  const buttonDiv = createButtonDiv();
  rightDiv.appendChild(buttonDiv);

  // Aggiungi div sinistro e destro al contenitore principale
  li.appendChild(leftDiv);
  li.appendChild(rightDiv);

  return li;
}

function createRoleBadge(role) {
  const roleBadge = document.createElement("span");
  roleBadge.className = `mt-1 text-xs font-bold px-3 py-1 rounded-full inline-block ${
    role === "admin"
      ? "bg-blue-100 text-blue-700"
      : role === "member"
      ? "bg-green-100 text-green-700"
      : role === "reader"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700"
  }`;
  roleBadge.textContent = role;
  return roleBadge;
}

function createStatusDiv(user) {
  const statusDiv = document.createElement("div");
  statusDiv.className = `text-xs font-bold px-3 py-1 rounded-lg mb-2 ${
    user.status === "active"
      ? "bg-green-100 text-green-700"
      : user.status === "expiring_soon"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`;
  statusDiv.textContent =
    user.status === "active"
      ? "Active"
      : user.status === "expiring_soon"
      ? "Expiring Soon"
      : "Expired";
  return statusDiv;
}

function createButtonDiv() {
  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flex gap-2 mt-2"; // Stile per i pulsanti

  const updateButton = createButton(
    "🖊",
    "text-lg font-bold text-blue-500 hover:text-blue-600 mr-3"
  );
  const deleteButton = createButton(
    "❌",
    "text-lg font-bold text-red-500 hover:text-red-600"
  );

  buttonDiv.appendChild(updateButton);
  buttonDiv.appendChild(deleteButton);

  return buttonDiv;
}

function createButton(text, className) {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = text;
  return button;
}

function createTextElement(tag, textContent, className) {
  const element = document.createElement(tag);
  element.textContent = textContent;
  element.className = className;
  return element;
}
