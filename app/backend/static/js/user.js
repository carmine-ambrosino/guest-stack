// user.js

// Crea un elemento della lista utente
export function createUserElement(user, onEdit, onDelete, onProjectChange) {
  const li = document.createElement("li");
  li.className = "user-item flex items-start py-4 px-4 border-b border-gray-100 bg-gray-100 rounded-xl"; // Usa margini più ampi per una disposizione chiara

  // Crea l'avatar dell'utente
  const avatar = document.createElement("div");
  avatar.className = "avatar w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl";
  avatar.textContent = user.username.charAt(0).toUpperCase(); // Prende la prima lettera del nome utente

  // Crea il contenitore delle informazioni dell'utente
  const userInfo = document.createElement("div");
  userInfo.className = "flex-1 pl-4"; 

  // Nome utente
  const userName = document.createElement("div");
  userName.className = "font-bold";
  userName.textContent = user.username;

  // Email dell'utente
  const userEmail = document.createElement("div");
  userEmail.className = "text-gray-600 text-sm";
  userEmail.textContent = user.email;

  // Progetto dell'utente
  const userProject = document.createElement("div");
  userProject.className = "font-semibold text-gray-600 text-sm";
  userProject.textContent = `📂 ${user.project_name}`;

  // Ruolo dell'utente
  const userRole = document.createElement("div");

  // Mappa dei ruoli con colori di sfondo e testo
  const roleStyles = {
    admin: { background: "bg-red-100", text: "text-red-500" },
    member: { background: "bg-blue-100", text: "text-blue-500" },
    reader: { background: "bg-yellow-100", text: "text-yellow-500" },
    default: { background: "bg-black-100", text: "text-white" }, // Colore di default
  };
  
  // Imposta le classi in base al ruolo
  const { background, text } = roleStyles[user.role] || roleStyles.default; // Usa il ruolo o il default
  
  userRole.className = `text-sm font-bold rounded ${background} ${text} inline-block px-2 py-1`;
  userRole.textContent = `${user.role}`;
    

  userInfo.appendChild(userName);
  userInfo.appendChild(userEmail);
  userInfo.appendChild(userProject);
  userInfo.appendChild(userRole);

  li.appendChild(avatar); // Aggiungi l'avatar a sinistra
  li.appendChild(userInfo); // Aggiungi le informazioni dell'utente accanto all'avatar

  // Crea il contenitore per lo stato dell'utente (attivo, scaduto, in scadenza)
  const statusContainer = document.createElement("div");
  statusContainer.className = "flex flex-col status-container items-start"; // Allinea il contenuto a destra

  const status = document.createElement("span");
  status.className = "status text-sm rounded px-2 py-1 mb-4 ml-auto"; // Aggiungi margine inferiore per distanziare
  if (user.status === "active") {
    status.textContent = "🟢 Active";
    status.classList.add("bg-green-200", "text-green-800", "font-bold");
  } else if (user.status === "expiring soon") {
    status.textContent = "🟡 Expiring Soon";
    status.classList.add("bg-yellow-200", "text-yellow-800", "font-bold");
  } else {
    status.textContent = "🔴 Expired";
    status.classList.add("bg-red-200", "text-red-800", "font-bold");
  }

  statusContainer.appendChild(status); // Aggiungi lo stato in cima

  // Crea il contenitore per i pulsanti (Modifica, Elimina, Cambia progetto)
  const actions = document.createElement("div");
  actions.className = "py-1 mt-2 ml-24 space-x-4"; // Disposizione verticale dei pulsanti

  // Pulsante per modificare
  const editButton = document.createElement("button");
  editButton.className = "edit-button text-blue-500 hover:text-blue-700";
  editButton.textContent = "✏️";
  editButton.addEventListener("click", () => onEdit(user));

  // Pulsante per eliminare
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button text-red-500 hover:text-red-700 ml-4";
  deleteButton.textContent = "❌";
  deleteButton.addEventListener("click", () => onDelete(user.id));

  // Pulsante per cambiare progetto
  const projectButton = document.createElement("button");
  projectButton.className = "project-button text-yellow-500 hover:text-yellow-700";
  projectButton.textContent = " 🆕📁";
  projectButton.addEventListener("click", () => onProjectChange(user.id));

  actions.appendChild(projectButton);
  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  // Estrai la data e l'orario
  const expiry_date = new Date(user.expiry_time);
  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit'};  

  const date = expiry_date.toLocaleDateString([], optionsDate);
  const time = expiry_date.toLocaleTimeString([], optionsTime);
  
  const date_p = document.createElement("p");
  date_p.className = "font-bold";
  date_p.textContent = `${date}`;
  
  const time_p = document.createElement("p");
  time_p.textContent = `${time}`;
  
  const expiry_time = document.createElement("div");
  expiry_time.className = "flex flex-col ml-auto items-end text-sm text-gray-500";
  
  expiry_time.appendChild(date_p);
  expiry_time.appendChild(time_p);

  statusContainer.appendChild(expiry_time);


  statusContainer.appendChild(actions); // Aggiungi i pulsanti sotto lo status

  li.appendChild(statusContainer); // Aggiungi il contenitore dello stato e dei pulsanti a destra

  return li;
}
