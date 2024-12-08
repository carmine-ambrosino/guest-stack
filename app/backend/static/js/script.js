document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "/api/v1/users";
    const userList = document.getElementById("userList");
    const searchInput = document.getElementById("searchInput");

    let users = [];
    let selectedUser = null;

    const today = new Date();

    // Funzione per determinare lo stato
    const getStatus = (expiryDate) => {
        if (expiryDate < today) return { label: "Expired", color: "text-red-500" };
        if (expiryDate.toDateString() === today.toDateString())
            return { label: "Expiring Soon", color: "text-yellow-500" };
        return { label: "Active", color: "text-green-500" };
    };

    // Funzione per ordinare gli utenti
    const sortUsers = (users) => {
        return users.sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));
    };

    // Funzione per caricare e visualizzare gli utenti
    const loadUsers = (filteredUsers) => {
        userList.replaceChildren();

        filteredUsers.forEach((user) => {
            const expiryDate = new Date(user.expiry_time);
            const status = getStatus(expiryDate);

            const userItem = document.createElement("li");
            userItem.className = "p-4 bg-gray-100 rounded-lg flex justify-between items-center";

            const userInfo = document.createElement("div");
            userInfo.className = "text-gray-800";

            const userName = document.createElement("p");
            userName.className = "text-sm font-bold";
            userName.textContent = user.username;

            const userEmail = document.createElement("p");
            userEmail.className = "text-xs text-gray-600";
            userEmail.textContent = user.email;

            const userDetails = document.createElement("p");
            userDetails.className = "text-sm text-gray-600";
            userDetails.textContent = `${user.role} • ${user.project_name}`;

            const userStatus = document.createElement("div");
            userStatus.className = "text-right";

            const statusText = document.createElement("p");
            statusText.className = `text-sm font-bold ${status.color}`;
            statusText.textContent = status.label;

            const expiryInfo = document.createElement("p");
            expiryInfo.className = "text-sm font-bold text-gray-500";
            expiryInfo.textContent = `Expiry: ${expiryDate.toLocaleDateString()}`;

            const actionButtons = document.createElement("div");
            actionButtons.className = "mt-2 flex space-x-4";

            const editButton = document.createElement("button");
            editButton.className = "text-sm text-blue-500 hover:underline";
            editButton.textContent = "Edit";
            editButton.onclick = () => openModal("editModal", user);

            const deleteButton = document.createElement("button");
            deleteButton.className = "text-sm text-red-500 hover:underline";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => {
                selectedUser = user;
                openModal("deleteModal");
            };

            actionButtons.append(editButton, deleteButton);
            userStatus.append(statusText, expiryInfo, actionButtons);
            userInfo.append(userName, userEmail, userDetails);
            userItem.append(userInfo, userStatus);

            userList.appendChild(userItem);
        });
    };

    // Funzione per aggiornare le statistiche
    const updateStatistics = (users) => {
        const totalUsers = users.length;
        const expiringSoonCount = users.filter((user) => {
            const expiryDate = new Date(user.expiry_time);
            return expiryDate.toDateString() === today.toDateString();
        }).length;
        const expiredCount = users.filter((user) => {
            const expiryDate = new Date(user.expiry_time);
            return expiryDate < today;
        }).length;

        // Aggiorna il DOM con i conteggi
        document.getElementById("totalUsersCount").textContent = totalUsers;
        document.getElementById("expiringSoonCount").textContent = expiringSoonCount;
        document.getElementById("expiredCount").textContent = expiredCount;
    };

    // Funzione per aprire un modale
    const openModal = (modalId) => {
        document.getElementById(modalId).classList.remove("hidden");
    };

    // Funzione per chiudere un modale
    const closeModal = (modalId) => {
        document.getElementById(modalId).classList.add("hidden");
    };

    // Gestore pulsanti Cancel
    document.querySelectorAll(".cancel-modal").forEach((button) => {
        button.addEventListener("click", () => {
            closeModal("editModal");
            closeModal("deleteModal");
        });
    });

    // Chiudi modale con ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal("editModal");
            closeModal("deleteModal");
        }
    });

    // Effettua la richiesta DELETE
    document.getElementById("confirmDeleteButton").onclick = async () => {
        if (selectedUser) {
            try {
                await fetch(`${API_URL}/${selectedUser.openstack_user_id}`, {
                    method: "DELETE",
                });
                users = users.filter((user) => user.openstack_user_id !== selectedUser.openstack_user_id);
                loadUsers(users);
                updateStatistics(users);  // Ricalcola le statistiche dopo la cancellazione
                closeModal("deleteModal");
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    // Fetch utenti
    try {
        const response = await fetch(API_URL);
        users = await response.json();
        users = sortUsers(users);

        // Aggiorna le statistiche
        updateStatistics(users);

        // Carica gli utenti nella lista
        loadUsers(users);

        // Ricerca
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filteredUsers = users.filter(
                (user) =>
                    user.username.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    user.project_name.toLowerCase().includes(query) ||
                    user.role.toLowerCase().includes(query)
            );
            loadUsers(filteredUsers);
            updateStatistics(filteredUsers);  // Aggiorna le statistiche quando i risultati della ricerca cambiano
        });
    } catch (error) {
        console.error("Errore durante il caricamento degli utenti:", error);
    }
});
