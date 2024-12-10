// api.js

const API_BASE_URL = "/api/v1";

async function fetchUsers() {
  try {
    const response = await fetch("/api/v1/users");
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.users || !data.stats) {
      throw new Error("Invalid data format received from API");
    }

    return data; // Restituisce direttamente l'oggetto JSON
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    throw error; // Rilancia l'errore per la gestione nel chiamante
  }
}

async function addUser(user) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Error adding user: ${response.statusText}`);
  }
  return await response.json();
}

async function updateUser(userId, user) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Error updating user: ${response.statusText}`);
  }
  return await response.json();
}

async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Error deleting user: ${response.statusText}`);
  }
}

export { fetchUsers, addUser, updateUser, deleteUser };
