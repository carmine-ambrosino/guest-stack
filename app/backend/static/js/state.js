// state.js
export { setCurrentUserId, getCurrentUserId };

const state = {
  currentUserId: null,
};

function setCurrentUserId(userId) {
  state.currentUserId = userId;
}

function getCurrentUserId() {
  return state.currentUserId;
}
