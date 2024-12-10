const state = {
  currentUserId: null,
  currentProjectUserId: null,
};

export function setCurrentUserId(userId) {
  state.currentUserId = userId;
}

export function getCurrentUserId() {
  return state.currentUserId;
}

export function setCurrentProjectUserId(projectUserId) {
  state.currentProjectUserId = projectUserId;
}

export function getCurrentProjectUserId() {
  return state.currentProjectUserId;
}
