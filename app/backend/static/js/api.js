// api.js

export async function fetchUsers() {
    try {
      const response = await fetch("/api/v1/users");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error; 
    }
  }
  
  export function updateUserStats(stats) {
    document.getElementById("totalUsersCount").textContent = stats.users;
    document.getElementById("expiringSoonCount").textContent = stats.expiring_soon;
    document.getElementById("expiredCount").textContent = stats.expired;
  }
  