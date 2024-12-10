// state.js

const state = {
  currentUserId: null,
  currentProjectUserId: null,
};

function setCurrentUserId(userId) {
  state.currentUserId = userId;
}

function getCurrentUserId() {
  return state.currentUserId;
}

function setCurrentProjectUserId(projectUserId) {
  state.currentProjectUserId = projectUserId;
}

function getCurrentProjectUserId() {
  return state.currentProjectUserId;
}

export { setCurrentUserId, getCurrentUserId, setCurrentProjectUserId, getCurrentProjectUserId }