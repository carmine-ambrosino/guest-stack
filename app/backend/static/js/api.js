// api.js

const API_BASE_URL = "/api/v1";

// Funzione per recuperare gli utenti dall'API
export async function fetchUsers() {
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


// Aggiunge un nuovo utente
export async function addUser(user) {
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

// Aggiorna un utente esistente
export async function updateUser(userId, user) {
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

// Elimina un utente
export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Error deleting user: ${response.statusText}`);
  }
}
