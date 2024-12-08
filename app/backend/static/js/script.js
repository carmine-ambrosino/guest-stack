function createUserElement(user) {
    const li = document.createElement('li');
    li.className =
      'p-4 bg-gray-100 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center';
  
    // Colonna Sinistra
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex flex-col';
  
    // Username con Badge Ruolo
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'flex items-center';
  
    const username = document.createElement('p');
    username.className = 'text-lg font-bold text-gray-800';
    username.textContent = user.username;
  
    const roleBadge = document.createElement('span');
    roleBadge.className = `ml-3 text-xs font-medium px-3 py-1 rounded-full ${
    user.role === 'admin'
      ? 'bg-blue-100 text-blue-700'
      : user.role === 'member'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
    }`;
    roleBadge.textContent = user.role;
  
    usernameDiv.appendChild(username);
    usernameDiv.appendChild(roleBadge);
  
    // Email e Progetto
    const email = document.createElement('p');
    email.className = 'text-sm text-gray-600';
    email.textContent = user.email;
  
    const project = document.createElement('p');
    project.className = 'text-sm text-gray-500';
    project.textContent = `Project: ${user.project_name}`;
  
    leftDiv.appendChild(usernameDiv);
    leftDiv.appendChild(email);
    leftDiv.appendChild(project);
  
    // Colonna Destra
    const rightDiv = document.createElement('div');
    rightDiv.className = 'flex flex-col items-end';
  
    // Stato
    const statusDiv = document.createElement('div');
    statusDiv.className = `text-xs font-bold px-3 py-1 rounded-lg mb-2 ${
      user.status === 'active'
        ? 'bg-green-100 text-green-700'
        : user.status === 'expiring_soon'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'
    }`;
    statusDiv.textContent =
      user.status === 'active'
        ? 'Active'
        : user.status === 'expiring_soon'
        ? 'Expiring Soon'
        : 'Expired';
  
    // Data e Ora di Scadenza
    const expiryDate = document.createElement('p');
    expiryDate.className = 'text-sm font-bold text-gray-800';
    expiryDate.textContent = new Date(user.expiry_time).toLocaleDateString();
  
    const expiryTime = document.createElement('p');
    expiryTime.className = 'text-sm text-gray-500';
    expiryTime.textContent = new Date(user.expiry_time).toLocaleTimeString();
  
    // Pulsanti
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'flex gap-2 mt-2';
  
    const updateButton = document.createElement('button');
    updateButton.className =
      'px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600';
    updateButton.textContent = 'Update';
  
    const deleteButton = document.createElement('button');
    deleteButton.className =
      'px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600';
    deleteButton.textContent = 'Delete';
  
    buttonDiv.appendChild(updateButton);
    buttonDiv.appendChild(deleteButton);
  
    // Aggiungi elementi al div destro
    rightDiv.appendChild(statusDiv);
    rightDiv.appendChild(expiryDate);
    rightDiv.appendChild(expiryTime);
    rightDiv.appendChild(buttonDiv);
  
    // Aggiungi div sinistro e destro al contenitore principale
    li.appendChild(leftDiv);
    li.appendChild(rightDiv);
  
    return li;
  }
  
  // Funzione per caricare gli utenti dall'API
  async function fetchUsers() {
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
  
      // Aggiorna statistiche
      document.getElementById('totalUsersCount').textContent = data.stats.users;
      document.getElementById('expiringSoonCount').textContent = data.stats.expiring_soon;
      document.getElementById('expiredCount').textContent = data.stats.expired;
  
      // Aggiorna lista utenti
      const userList = document.getElementById('userList');
      userList.replaceChildren(); // Svuota la lista prima di riempirla
      data.users.forEach(user => {
        const userElement = createUserElement(user);
        userList.appendChild(userElement);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  
  // Filtra gli utenti
  document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const users = document.querySelectorAll('#userList li');
    users.forEach(user => {
      const userText = user.textContent.toLowerCase();
      user.style.display = userText.includes(searchTerm) ? '' : 'none';
    });
  });
  
  // Inizializza la pagina
  document.addEventListener('DOMContentLoaded', fetchUsers);
  