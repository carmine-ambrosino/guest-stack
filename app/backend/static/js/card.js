// card.js

export function createUserElement(user, onEdit, onDelete) {
  const li = document.createElement("li");
  li.className =
    "user-item flex items-start py-4 px-4 border-b border-gray-100 bg-gray-100 rounded-xl";

  
  const avatar = createAvatar(user);
  const userInfo = createUserInfo(user);
  const statusContainer = createStatusContainer(
    user,
    onEdit,
    onDelete,
  );

  li.appendChild(avatar);
  li.appendChild(userInfo);
  li.appendChild(statusContainer);

  return li;
}

function createAvatar(user) {
  const avatar = document.createElement("div");
  avatar.className =
    "avatar w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl";
  avatar.textContent = user.username.charAt(0).toUpperCase();
  return avatar;
}

function createUserInfo(user) {
  const userInfo = document.createElement("div");
  userInfo.className = "flex-1 pl-4";

  const userName = document.createElement("div");
  userName.className = "font-bold";
  userName.textContent = user.username;

  const userEmail = document.createElement("div");
  userEmail.className = "text-gray-600 text-sm";
  userEmail.textContent = user.email;

  const userProject = document.createElement("div");
  userProject.className = "font-semibold text-gray-600 text-sm";
  userProject.textContent = `📂 ${user.project_name}`;

  const userRole = createUserRole(user.role);

  userInfo.appendChild(userName);
  userInfo.appendChild(userEmail);
  userInfo.appendChild(userProject);
  userInfo.appendChild(userRole);

  return userInfo;
}

function createUserRole(role) {
  const userRole = document.createElement("div");

  const roleStyles = {
    admin: { background: "bg-red-100", text: "text-red-500" },
    member: { background: "bg-blue-100", text: "text-blue-500" },
    reader: { background: "bg-yellow-100", text: "text-yellow-500" },
    default: { background: "bg-white", text: "text-black" },
  };

  const { background, text } = roleStyles[role] || roleStyles.default;

  userRole.className = `text-sm font-bold rounded ${background} ${text} inline-block px-2 py-1`;
  userRole.textContent = `${role}`;

  return userRole;
}

function createStatusContainer(user, onEdit, onDelete) {
  const statusContainer = document.createElement("div");
  statusContainer.className = "flex flex-col status-container items-start";

  const status = createStatus(user.status);
  const expiryTime = createExpiryTime(user.expiry_time);
  const actions = createActionButtons(user, onEdit, onDelete);

  statusContainer.appendChild(status);
  statusContainer.appendChild(expiryTime);
  statusContainer.appendChild(actions);

  return statusContainer;
}

function createStatus(status) {
  const statusElement = document.createElement("span");
  statusElement.className = "status text-sm rounded px-2 py-1 mb-4 ml-auto";

  if (status === "active") {
    statusElement.textContent = "🟢 Active";
    statusElement.classList.add("bg-green-200", "text-green-800", "font-bold");
  } else if (status === "expiring soon") {
    statusElement.textContent = "🟡 Expiring Soon";
    statusElement.classList.add(
      "bg-yellow-200",
      "text-yellow-800",
      "font-bold"
    );
  } else {
    statusElement.textContent = "🔴 Expired";
    statusElement.classList.add("bg-red-200", "text-red-800", "font-bold");
  }

  return statusElement;
}

function createExpiryTime(expiry_time) {
  const expiryDate = new Date(expiry_time);
  const optionsDate = { year: "numeric", month: "long", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit" };

  const date = expiryDate.toLocaleDateString([], optionsDate);
  const time = expiryDate.toLocaleTimeString([], optionsTime);

  const expiryContainer = document.createElement("div");
  expiryContainer.className =
    "flex flex-col ml-auto items-end text-sm text-gray-500";

  const dateElement = document.createElement("p");
  dateElement.className = "font-bold";
  dateElement.textContent = `${date}`;

  const timeElement = document.createElement("p");
  timeElement.textContent = `${time}`;

  expiryContainer.appendChild(dateElement);
  expiryContainer.appendChild(timeElement);

  return expiryContainer;
}

function createActionButtons(user, onEdit, onDelete) {
  const actions = document.createElement("div");
  actions.className = "py-1 mt-2 ml-24 space-x-4";

  const editButton = document.createElement("button");
  editButton.className = "edit-button text-blue-500 hover:text-blue-700";
  editButton.textContent = "✏️";
  editButton.addEventListener("click", () => onEdit(user));

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button text-red-500 hover:text-red-700 ml-4";
  deleteButton.textContent = "❌";
  deleteButton.addEventListener("click", () => onDelete(user.id));

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  return actions;
}
