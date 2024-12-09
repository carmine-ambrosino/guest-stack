// api.js

export async function fetchUsers() {
  try {
    const response = await fetch("/api/v1/users");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function addUser(user) {
  const response = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Failed to add user");
  }
  return await response.json();
}

export async function updateUser(userId, user) {
  const response = await fetch(`/api/v1/users/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return await response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`/api/v1/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
  return await response.json();
}
