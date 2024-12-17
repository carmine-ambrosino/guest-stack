// search.js

import { filterUserList } from "./users.js";
import { areModalsOpen } from "./modals.js";

export {
  activateSearchMode,
  handleSearchInput,
  resetSearchInput,
  blurSearchInput,
  initializeSearchInput,
  isTypingKey,
};

function activateSearchMode() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.focus();
}

function handleSearchInput() {
  if (areModalsOpen()) return; // Block search
  filterUserList(); // update list
}

function resetSearchInput() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    searchInput.classList.remove("focus:ring-2", "focus:ring-gray-400");
    searchInput.classList.add("border-gray-300");
  }
}

function blurSearchInput() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.blur();
  }
}

function initializeSearchInput() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("focus", () => {
    searchInput.classList.add("focus:ring-2", "focus:ring-gray-400");
    searchInput.classList.remove("border-gray-300");
  });

  searchInput.addEventListener("blur", () => {
    searchInput.classList.remove("focus:ring-2", "focus:ring-gray-400");
    searchInput.classList.add("border-gray-300");
  });
}

function isTypingKey(event) {
  const ignoredKeys = [
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "Tab",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ];
  return !ignoredKeys.includes(event.key) && event.key.length === 1;
}
