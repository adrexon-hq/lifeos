const ITEM_STORAGE_KEY = "lifeos-inbox-items-v1";
const PROJECT_STORAGE_KEY = "lifeos-projects-v1";
const COMPLETION_STORAGE_KEY = "lifeos-completions-v1";
const THEME_STORAGE_KEY = "lifeos-theme-v1";

const TYPE_LABELS = {
  todo: "할 일",
  note: "메모",
  link: "링크",
  prompt: "프롬프트",
};

const PRIORITY_LABELS = {
  high: "높음",
  normal: "보통",
  low: "낮음",
};

const PRIORITY_RANK = {
  high: 3,
  normal: 2,
  low: 1,
};

const RECURRENCE_LABELS = {
  none: "",
  daily: "매일",
  weekly: "매주",
  monthly: "매월",
};

const state = {
  items: loadItems(),
  projects: loadProjects(),
  completions: loadCompletions(),
  activeView: "home",
  activeFilter: "all",
  activeTag: "all",
  activeProject: "all",
  searchQuery: "",
  sortMode: "smart",
  editingId: null,
  weekStart: getStartOfWeek(new Date()),
};

seedLegacyCompletions();

const elements = {
  viewNav: document.querySelector(".view-nav"),
  viewButtons: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  goViewButtons: document.querySelectorAll("[data-go-view]"),

  homeDateText: document.querySelector("#homeDateText"),
  homeTaskList: document.querySelector("#homeTaskList"),
  homeTaskEmpty: document.querySelector("#homeTaskEmpty"),
  homeProjectList: document.querySelector("#homeProjectList"),
  homeProjectEmpty: document.querySelector("#homeProjectEmpty"),
  homeWeekPreview: document.querySelector("#homeWeekPreview"),

  themeToggleButton: document.querySelector("#themeToggleButton"),
  themeToggleIcon: document.querySelector("#themeToggleIcon"),
  themeToggleLabel: document.querySelector("#themeToggleLabel"),

  itemForm: document.querySelector("#itemForm"),
  itemType: document.querySelector("#itemType"),
  itemProject: document.querySelector("#itemProject"),
  itemPriority: document.querySelector("#itemPriority"),
  itemDueDate: document.querySelector("#itemDueDate"),
  itemRecurrence: document.querySelector("#itemRecurrence"),
  itemTags: document.querySelector("#itemTags"),
  itemContent: document.querySelector("#itemContent"),

  itemList: document.querySelector("#itemList"),
  itemTemplate: document.querySelector("#itemTemplate"),
  emptyState: document.querySelector("#emptyState"),
  filterTabs: document.querySelector("#filterTabs"),
  projectFilterSelect: document.querySelector("#projectFilterSelect"),
  tagFilterSelect: document.querySelector("#tagFilterSelect"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),

  totalCount: document.querySelector("#totalCount"),
  todoCount: document.querySelector("#todoCount"),
  todayCount: document.querySelector("#todayCount"),
  overdueCount: document.querySelector("#overdueCount"),
  projectCount: document.querySelector("#projectCount"),
  todayNavCount: document.querySelector("#todayNavCount"),

  todayDateText: document.querySelector("#todayDateText"),
  todayProgressText: document.querySelector("#todayProgressText"),
  todayOverdueCount: document.querySelector("#todayOverdueCount"),
  todayDueCount: document.querySelector("#todayDueCount"),
  todayFocusCount: document.querySelector("#todayFocusCount"),
  todayOverdueList: document.querySelector("#todayOverdueList"),
  todayDueList: document.querySelector("#todayDueList"),
  todayFocusList: document.querySelector("#todayFocusList"),
  todayOverdueEmpty: document.querySelector("#todayOverdueEmpty"),
  todayDueEmpty: document.querySelector("#todayDueEmpty"),
  todayFocusEmpty: document.querySelector("#todayFocusEmpty"),

  projectForm: document.querySelector("#projectForm"),
  projectNameInput: document.querySelector("#projectNameInput"),
  projectGrid: document.querySelector("#projectGrid"),
  projectEmpty: document.querySelector("#projectEmpty"),

  weekRangeText: document.querySelector("#weekRangeText"),
  weekBoard: document.querySelector("#weekBoard"),
  previousWeekButton: document.querySelector("#previousWeekButton"),
  currentWeekButton: document.querySelector("#currentWeekButton"),
  nextWeekButton: document.querySelector("#nextWeekButton"),
  unscheduledDropZone: document.querySelector("#unscheduledDropZone"),

  completed7Count: document.querySelector("#completed7Count"),
  completed30Count: document.querySelector("#completed30Count"),
  completedAllCount: document.querySelector("#completedAllCount"),
  completionRateText: document.querySelector("#completionRateText"),
  weeklyBars: document.querySelector("#weeklyBars"),
  projectStatsList: document.querySelector("#projectStatsList"),
  projectStatsEmpty: document.querySelector("#projectStatsEmpty"),
  completionHistoryList: document.querySelector("#completionHistoryList"),
  completionHistoryEmpty: document.querySelector("#completionHistoryEmpty"),

  editDialog: document.querySelector("#editDialog"),
  editForm: document.querySelector("#editForm"),
  editType: document.querySelector("#editType"),
  editProject: document.querySelector("#editProject"),
  editPriority: document.querySelector("#editPriority"),
  editDueDate: document.querySelector("#editDueDate"),
  editRecurrence: document.querySelector("#editRecurrence"),
  editTags: document.querySelector("#editTags"),
  editContent: document.querySelector("#editContent"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
};

elements.viewNav.addEventListener("click", handleViewChange);
document.addEventListener("click", handleGoViewClick);
elements.itemForm.addEventListener("submit", handleCreateItem);
elements.filterTabs.addEventListener("click", handleFilterChange);
elements.projectFilterSelect.addEventListener("change", handleProjectFilterChange);
elements.tagFilterSelect.addEventListener("change", handleTagFilterChange);
elements.searchInput.addEventListener("input", handleSearch);
elements.sortSelect.addEventListener("change", handleSortChange);

[
  elements.itemList,
  elements.todayOverdueList,
  elements.todayDueList,
  elements.todayFocusList,
  elements.homeTaskList,
].forEach((list) => list.addEventListener("click", handleListAction));

elements.projectForm.addEventListener("submit", handleCreateProject);
elements.projectGrid.addEventListener("click", handleProjectAction);

elements.previousWeekButton.addEventListener("click", () => changeWeek(-7));
elements.currentWeekButton.addEventListener("click", () => {
  state.weekStart = getStartOfWeek(new Date());
  renderWeekView();
});
elements.nextWeekButton.addEventListener("click", () => changeWeek(7));

elements.weekBoard.addEventListener("dragstart", handleWeekDragStart);
elements.weekBoard.addEventListener("dragover", handleWeekDragOver);
elements.weekBoard.addEventListener("dragleave", handleWeekDragLeave);
elements.weekBoard.addEventListener("drop", handleWeekDrop);

elements.unscheduledDropZone.addEventListener("dragover", handleWeekDragOver);
elements.unscheduledDropZone.addEventListener("dragleave", handleWeekDragLeave);
elements.unscheduledDropZone.addEventListener("drop", handleWeekDrop);

elements.themeToggleButton.addEventListener("click", toggleTheme);
elements.editForm.addEventListener("submit", handleEditSubmit);
elements.closeDialogButton.addEventListener("click", closeEditDialog);
elements.cancelEditButton.addEventListener("click", closeEditDialog);

document.addEventListener("keydown", (event) => {
  const isSubmitShortcut =
    (event.ctrlKey || event.metaKey) && event.key === "Enter";

  if (isSubmitShortcut && !elements.editDialog.open && state.activeView === "inbox") {
    event.preventDefault();
    elements.itemForm.requestSubmit();
  }
});

applyTheme(loadTheme());
render();


function loadTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");

  if (elements.themeToggleButton) {
    elements.themeToggleButton.setAttribute("aria-pressed", String(isDark));
  }

  if (elements.themeToggleIcon) {
    elements.themeToggleIcon.textContent = isDark ? "☀" : "☾";
  }

  if (elements.themeToggleLabel) {
    elements.themeToggleLabel.textContent = isDark ? "화이트 모드" : "블랙 모드";
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
}


function loadItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeItem).filter((item) => item.content)
      : [];
  } catch (error) {
    console.error("항목 데이터를 불러오지 못했습니다.", error);
    return [];
  }
}

function loadProjects() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeProject).filter((project) => project.name)
      : [];
  } catch (error) {
    console.error("프로젝트 데이터를 불러오지 못했습니다.", error);
    return [];
  }
}

function loadCompletions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPLETION_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeCompletion)
      : [];
  } catch (error) {
    console.error("완료 기록을 불러오지 못했습니다.", error);
    return [];
  }
}

function normalizeItem(item) {
  const now = new Date().toISOString();

  return {
    id: item.id || createId(),
    type: TYPE_LABELS[item.type] ? item.type : "note",
    content: typeof item.content === "string" ? item.content.trim() : "",
    completed: Boolean(item.completed),
    pinned: Boolean(item.pinned),
    priority: PRIORITY_LABELS[item.priority] ? item.priority : "normal",
    dueDate: isValidDateKey(item.dueDate) ? item.dueDate : "",
    tags: normalizeTags(item.tags),
    projectId: typeof item.projectId === "string" ? item.projectId : "",
    recurrence: RECURRENCE_LABELS[item.recurrence] !== undefined
      ? item.recurrence
      : "none",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeProject(project) {
  return {
    id: project.id || createId(),
    name: typeof project.name === "string" ? project.name.trim() : "",
    createdAt: project.createdAt || new Date().toISOString(),
  };
}

function normalizeCompletion(record) {
  return {
    id: record.id || createId(),
    itemId: record.itemId || "",
    content: record.content || "완료한 항목",
    projectId: record.projectId || "",
    completedAt: record.completedAt || new Date().toISOString(),
  };
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(
      value.map((tag) => String(tag).trim().replace(/^#/, "")).filter(Boolean),
    )].slice(0, 10);
  }

  if (typeof value !== "string") {
    return [];
  }

  return [...new Set(
    value.split(/[,#\n]/).map((tag) => tag.trim()).filter(Boolean),
  )].slice(0, 10);
}

function seedLegacyCompletions() {
  const recordedItemIds = new Set(state.completions.map((record) => record.itemId));
  let changed = false;

  state.items
    .filter((item) => item.completed && !recordedItemIds.has(item.id))
    .forEach((item) => {
      state.completions.push({
        id: createId(),
        itemId: item.id,
        content: item.content,
        projectId: item.projectId,
        completedAt: item.updatedAt || item.createdAt,
      });
      changed = true;
    });

  if (changed) {
    saveCompletions();
  }
}

function saveItems() {
  localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(state.items));
}

function saveProjects() {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state.projects));
}

function saveCompletions() {
  localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(state.completions));
}

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function handleViewChange(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  setActiveView(button.dataset.view);
}

function handleGoViewClick(event) {
  const button = event.target.closest("[data-go-view]");
  if (!button) return;

  const view = button.dataset.goView;

  if (button.dataset.projectId) {
    state.activeProject = button.dataset.projectId;
  }

  setActiveView(view);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveView(view) {
  state.activeView = view;

  elements.viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });

  elements.viewPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.viewPanel === view);
  });

  if (view === "home") renderHome();
  if (view === "today") renderTodayView();
  if (view === "inbox") {
    renderProjectOptions();
    elements.projectFilterSelect.value = state.activeProject;
    renderItems();
  }
  if (view === "projects") renderProjects();
  if (view === "week") renderWeekView();
  if (view === "stats") renderStats();
}

function handleCreateItem(event) {
  event.preventDefault();

  const content = elements.itemContent.value.trim();
  if (!content) {
    elements.itemContent.focus();
    return;
  }

  const now = new Date().toISOString();
  const previousType = elements.itemType.value;
  const previousProject = elements.itemProject.value;
  const previousPriority = elements.itemPriority.value;
  const previousRecurrence = elements.itemRecurrence.value;

  state.items.unshift({
    id: createId(),
    type: previousType,
    content,
    completed: false,
    pinned: false,
    priority: previousPriority,
    dueDate: elements.itemDueDate.value,
    tags: normalizeTags(elements.itemTags.value),
    projectId: previousProject,
    recurrence: previousRecurrence,
    createdAt: now,
    updatedAt: now,
  });

  saveItems();
  elements.itemForm.reset();
  elements.itemType.value = previousType;
  elements.itemProject.value = previousProject;
  elements.itemPriority.value = previousPriority;
  elements.itemRecurrence.value = previousRecurrence;
  elements.itemContent.focus();
  render();
}

function handleFilterChange(event) {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab === button);
  });
  renderItems();
}

function handleProjectFilterChange(event) {
  state.activeProject = event.target.value;
  renderItems();
}

function handleTagFilterChange(event) {
  state.activeTag = event.target.value;
  renderItems();
}

function handleSearch(event) {
  state.searchQuery = event.target.value.trim().toLowerCase();
  renderItems();
}

function handleSortChange(event) {
  state.sortMode = event.target.value;
  renderItems();
}

function handleListAction(event) {
  const tagButton = event.target.closest("[data-tag]");
  if (tagButton) {
    state.activeTag = tagButton.dataset.tag;
    elements.tagFilterSelect.value = state.activeTag;
    setActiveView("inbox");
    renderItems();
    return;
  }

  const actionButton = event.target.closest("button");
  const itemElement = event.target.closest("[data-item-id]");
  if (!actionButton || !itemElement) return;

  const item = state.items.find((entry) => entry.id === itemElement.dataset.itemId);
  if (!item) return;

  if (actionButton.classList.contains("check-button")) {
    toggleItemCompletion(item);
  }

  if (actionButton.classList.contains("today-button")) {
    item.dueDate = getDateKey(new Date());
    item.type = "todo";
    item.completed = false;
    item.updatedAt = new Date().toISOString();
  }

  if (actionButton.classList.contains("pin-button")) {
    item.pinned = !item.pinned;
    item.updatedAt = new Date().toISOString();
  }

  if (actionButton.classList.contains("edit-button")) {
    openEditDialog(item);
    return;
  }

  if (actionButton.classList.contains("delete-button")) {
    if (!window.confirm("이 항목을 삭제할까요?")) return;
    state.items = state.items.filter((entry) => entry.id !== item.id);
  }

  saveItems();
  render();
}

function toggleItemCompletion(item) {
  const now = new Date().toISOString();

  if (!item.completed) {
    item.completed = true;
    item.updatedAt = now;

    state.completions.unshift({
      id: createId(),
      itemId: item.id,
      content: item.content,
      projectId: item.projectId,
      completedAt: now,
    });

    if (item.type === "todo" && item.recurrence !== "none") {
      createNextRecurringItem(item);
    }

    saveCompletions();
    return;
  }

  item.completed = false;
  item.updatedAt = now;

  const recordIndex = state.completions.findIndex(
    (record) => record.itemId === item.id,
  );

  if (recordIndex >= 0) {
    state.completions.splice(recordIndex, 1);
    saveCompletions();
  }
}

function createNextRecurringItem(item) {
  const baseDate = item.dueDate || getDateKey(new Date());
  const nextDate = getNextRecurringDate(baseDate, item.recurrence);
  const now = new Date().toISOString();

  const duplicateExists = state.items.some(
    (entry) =>
      !entry.completed &&
      entry.content === item.content &&
      entry.projectId === item.projectId &&
      entry.recurrence === item.recurrence &&
      entry.dueDate === nextDate,
  );

  if (duplicateExists) return;

  state.items.unshift({
    ...item,
    id: createId(),
    completed: false,
    dueDate: nextDate,
    createdAt: now,
    updatedAt: now,
  });
}

function getNextRecurringDate(dateKey, recurrence) {
  const date = parseDateKey(dateKey);

  if (recurrence === "daily") {
    date.setDate(date.getDate() + 1);
  }

  if (recurrence === "weekly") {
    date.setDate(date.getDate() + 7);
  }

  if (recurrence === "monthly") {
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(originalDay, lastDay));
  }

  return getDateKey(date);
}

function openEditDialog(item) {
  state.editingId = item.id;
  elements.editType.value = item.type;
  elements.editProject.value = item.projectId;
  elements.editPriority.value = item.priority;
  elements.editDueDate.value = item.dueDate;
  elements.editRecurrence.value = item.recurrence;
  elements.editTags.value = item.tags.join(", ");
  elements.editContent.value = item.content;
  elements.editDialog.showModal();
  elements.editContent.focus();
}

function closeEditDialog() {
  state.editingId = null;
  elements.editDialog.close();
}

function handleEditSubmit(event) {
  event.preventDefault();

  const item = state.items.find((entry) => entry.id === state.editingId);
  const content = elements.editContent.value.trim();
  if (!item || !content) return;

  item.type = elements.editType.value;
  item.projectId = elements.editProject.value;
  item.priority = elements.editPriority.value;
  item.dueDate = elements.editDueDate.value;
  item.recurrence = elements.editRecurrence.value;
  item.tags = normalizeTags(elements.editTags.value);
  item.content = content;
  item.updatedAt = new Date().toISOString();

  saveItems();
  closeEditDialog();
  render();
}

function handleCreateProject(event) {
  event.preventDefault();

  const name = elements.projectNameInput.value.trim();
  if (!name) return;

  const duplicate = state.projects.some(
    (project) => project.name.toLowerCase() === name.toLowerCase(),
  );

  if (duplicate) {
    window.alert("같은 이름의 프로젝트가 이미 있습니다.");
    return;
  }

  state.projects.push({
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
  });

  saveProjects();
  elements.projectForm.reset();
  render();
}

function handleProjectAction(event) {
  const button = event.target.closest("button");
  const card = event.target.closest("[data-project-id]");
  if (!button || !card) return;

  const project = state.projects.find((entry) => entry.id === card.dataset.projectId);
  if (!project) return;

  if (button.classList.contains("project-open-button")) {
    state.activeProject = project.id;
    elements.projectFilterSelect.value = project.id;
    setActiveView("inbox");
    renderItems();
    return;
  }

  if (button.classList.contains("project-rename-button")) {
    const newName = window.prompt("새 프로젝트 이름을 입력하세요.", project.name);
    if (!newName || !newName.trim()) return;

    project.name = newName.trim();
    saveProjects();
    render();
    return;
  }

  if (button.classList.contains("project-delete-button")) {
    const count = state.items.filter((item) => item.projectId === project.id).length;
    const confirmed = window.confirm(
      `"${project.name}" 프로젝트를 삭제할까요?\n연결된 ${count}개 항목은 삭제되지 않고 프로젝트 없음으로 이동합니다.`,
    );

    if (!confirmed) return;

    state.items.forEach((item) => {
      if (item.projectId === project.id) {
        item.projectId = "";
      }
    });

    state.projects = state.projects.filter((entry) => entry.id !== project.id);

    if (state.activeProject === project.id) {
      state.activeProject = "all";
    }

    saveItems();
    saveProjects();
    render();
  }
}

function changeWeek(days) {
  const next = new Date(state.weekStart);
  next.setDate(next.getDate() + days);
  state.weekStart = next;
  renderWeekView();
}

function handleWeekDragStart(event) {
  const task = event.target.closest("[data-week-item-id]");
  if (!task) return;

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", task.dataset.weekItemId);
}

function handleWeekDragOver(event) {
  const dropTarget = event.target.closest("[data-drop-date]");
  if (!dropTarget) return;

  event.preventDefault();
  dropTarget.classList.add("is-dragover");
}

function handleWeekDragLeave(event) {
  const dropTarget = event.target.closest("[data-drop-date]");
  if (!dropTarget) return;

  if (!dropTarget.contains(event.relatedTarget)) {
    dropTarget.classList.remove("is-dragover");
  }
}

function handleWeekDrop(event) {
  const dropTarget = event.target.closest("[data-drop-date]");
  if (!dropTarget) return;

  event.preventDefault();
  dropTarget.classList.remove("is-dragover");

  const itemId = event.dataTransfer.getData("text/plain");
  const item = state.items.find((entry) => entry.id === itemId);

  if (!item) return;

  item.dueDate = dropTarget.dataset.dropDate;
  item.updatedAt = new Date().toISOString();

  saveItems();
  render();
}

function getVisibleItems() {
  return [...state.items]
    .filter(matchesActiveFilter)
    .filter(matchesProjectFilter)
    .filter(matchesTagFilter)
    .filter(matchesSearch)
    .sort(getSortComparator());
}

function matchesActiveFilter(item) {
  switch (state.activeFilter) {
    case "today":
      return isDueToday(item) && !item.completed;
    case "overdue":
      return isOverdue(item) && !item.completed;
    case "completed":
      return item.completed;
    case "all":
      return true;
    default:
      return item.type === state.activeFilter;
  }
}

function matchesProjectFilter(item) {
  if (state.activeProject === "all") return true;
  if (state.activeProject === "none") return !item.projectId;
  return item.projectId === state.activeProject;
}

function matchesTagFilter(item) {
  return state.activeTag === "all" || item.tags.includes(state.activeTag);
}

function matchesSearch(item) {
  if (!state.searchQuery) return true;

  const projectName = getProjectName(item.projectId);

  return [
    item.content,
    TYPE_LABELS[item.type],
    PRIORITY_LABELS[item.priority],
    RECURRENCE_LABELS[item.recurrence],
    projectName,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(state.searchQuery);
}

function getSortComparator() {
  if (state.sortMode === "newest") {
    return (a, b) => comparePinned(a, b) || compareCreatedAt(a, b);
  }

  if (state.sortMode === "due") {
    return (a, b) =>
      comparePinned(a, b) ||
      compareCompletion(a, b) ||
      compareDueDate(a, b) ||
      compareCreatedAt(a, b);
  }

  if (state.sortMode === "priority") {
    return (a, b) =>
      comparePinned(a, b) ||
      compareCompletion(a, b) ||
      comparePriority(a, b) ||
      compareDueDate(a, b) ||
      compareCreatedAt(a, b);
  }

  return (a, b) =>
    comparePinned(a, b) ||
    compareCompletion(a, b) ||
    compareOverdueStatus(a, b) ||
    compareTodayStatus(a, b) ||
    comparePriority(a, b) ||
    compareDueDate(a, b) ||
    compareCreatedAt(a, b);
}

function comparePinned(a, b) {
  return Number(b.pinned) - Number(a.pinned);
}

function compareCompletion(a, b) {
  return Number(a.completed) - Number(b.completed);
}

function compareOverdueStatus(a, b) {
  return Number(isOverdue(b)) - Number(isOverdue(a));
}

function compareTodayStatus(a, b) {
  return Number(isDueToday(b)) - Number(isDueToday(a));
}

function comparePriority(a, b) {
  return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
}

function compareDueDate(a, b) {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return 0;
}

function compareCreatedAt(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

function render() {
  sanitizeProjectReferences();
  renderProjectOptions();
  renderTagOptions();
  renderSummary();
  renderHome();
  renderItems();
  renderTodayView();
  renderProjects();
  renderWeekView();
  renderStats();
}

function sanitizeProjectReferences() {
  const projectIds = new Set(state.projects.map((project) => project.id));
  let changed = false;

  state.items.forEach((item) => {
    if (item.projectId && !projectIds.has(item.projectId)) {
      item.projectId = "";
      changed = true;
    }
  });

  if (changed) saveItems();
}

function renderProjectOptions() {
  const selectTargets = [elements.itemProject, elements.editProject];

  selectTargets.forEach((select) => {
    const currentValue = select.value;
    select.replaceChildren();

    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.textContent = "프로젝트 없음";
    select.append(noneOption);

    state.projects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .forEach((project) => {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.name;
        select.append(option);
      });

    if ([...select.options].some((option) => option.value === currentValue)) {
      select.value = currentValue;
    }
  });

  const previousFilter = state.activeProject;
  elements.projectFilterSelect.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "모든 프로젝트";
  elements.projectFilterSelect.append(allOption);

  const noneFilter = document.createElement("option");
  noneFilter.value = "none";
  noneFilter.textContent = "프로젝트 없음";
  elements.projectFilterSelect.append(noneFilter);

  state.projects
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      elements.projectFilterSelect.append(option);
    });

  if (![...elements.projectFilterSelect.options].some((option) => option.value === previousFilter)) {
    state.activeProject = "all";
  }

  elements.projectFilterSelect.value = state.activeProject;
}

function renderTagOptions() {
  const tags = [...new Set(state.items.flatMap((item) => item.tags))]
    .sort((a, b) => a.localeCompare(b, "ko"));

  const previousTag = state.activeTag;
  elements.tagFilterSelect.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "모든 태그";
  elements.tagFilterSelect.append(allOption);

  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = `#${tag}`;
    elements.tagFilterSelect.append(option);
  });

  if (previousTag !== "all" && !tags.includes(previousTag)) {
    state.activeTag = "all";
  }

  elements.tagFilterSelect.value = state.activeTag;
}

function renderSummary() {
  const activeTodos = state.items.filter(
    (item) => item.type === "todo" && !item.completed,
  );

  elements.totalCount.textContent = state.items.length;
  elements.todoCount.textContent = activeTodos.length;
  elements.todayCount.textContent = activeTodos.filter(isDueToday).length;
  elements.overdueCount.textContent = activeTodos.filter(isOverdue).length;
  elements.projectCount.textContent = state.projects.length;
  elements.todayNavCount.textContent = activeTodos.filter(
    (item) => isDueToday(item) || isOverdue(item),
  ).length;
}


function renderHome() {
  if (!elements.homeDateText) return;

  const today = new Date();
  const todayKey = getDateKey(today);

  elements.homeDateText.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  const urgentTasks = state.items
    .filter(
      (item) =>
        item.type === "todo" &&
        !item.completed &&
        item.dueDate &&
        item.dueDate <= todayKey,
    )
    .sort(
      (a, b) =>
        compareOverdueStatus(a, b) ||
        compareDueDate(a, b) ||
        comparePriority(a, b) ||
        compareCreatedAt(a, b),
    )
    .slice(0, 5);

  elements.homeTaskList.replaceChildren();

  urgentTasks.forEach((item) => {
    elements.homeTaskList.append(createItemFragment(item, { compact: true }));
  });

  elements.homeTaskEmpty.hidden = urgentTasks.length > 0;

  renderHomeProjects();
  renderHomeWeekPreview();
}

function renderHomeProjects() {
  elements.homeProjectList.replaceChildren();

  const projects = state.projects
    .map((project) => {
      const todos = state.items.filter(
        (item) => item.projectId === project.id && item.type === "todo",
      );
      const completed = todos.filter((item) => item.completed).length;
      const rate = todos.length ? Math.round((completed / todos.length) * 100) : 0;

      return {
        project,
        todos,
        completed,
        rate,
      };
    })
    .sort((a, b) => {
      const aRemaining = a.todos.length - a.completed;
      const bRemaining = b.todos.length - b.completed;
      return bRemaining - aRemaining || a.project.name.localeCompare(b.project.name, "ko");
    })
    .slice(0, 4);

  elements.homeProjectEmpty.hidden = projects.length > 0;

  projects.forEach(({ project, todos, completed, rate }) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "home-project-card";
    card.dataset.goView = "inbox";
    card.dataset.projectId = project.id;

    const heading = document.createElement("div");
    heading.className = "home-project-card-heading";

    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = project.name;
    const meta = document.createElement("small");
    meta.textContent = `완료 ${completed} / ${todos.length}`;
    titleWrap.append(title, meta);

    const rateText = document.createElement("strong");
    rateText.textContent = `${rate}%`;
    heading.append(titleWrap, rateText);

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${rate}%`;
    track.append(fill);

    card.append(heading, track);
    elements.homeProjectList.append(card);
  });
}

function renderHomeWeekPreview() {
  elements.homeWeekPreview.replaceChildren();

  const start = getStartOfWeek(new Date());

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(start, index);
    const dateKey = getDateKey(date);
    const count = state.items.filter(
      (item) =>
        item.type === "todo" &&
        !item.completed &&
        item.dueDate === dateKey,
    ).length;

    const day = document.createElement("button");
    day.type = "button";
    day.className = "home-week-day";
    day.dataset.goView = "week";
    day.classList.toggle("is-today", dateKey === getDateKey(new Date()));

    const weekday = document.createElement("strong");
    weekday.textContent = new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
    }).format(date);

    const dateText = document.createElement("span");
    dateText.textContent = new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
    }).format(date);

    const countText = document.createElement("b");
    countText.textContent = count;

    day.append(weekday, dateText, countText);
    elements.homeWeekPreview.append(day);
  }
}


function renderItems() {
  const items = getVisibleItems();
  elements.itemList.replaceChildren();

  items.forEach((item) => {
    elements.itemList.append(createItemFragment(item));
  });

  const isEmpty = items.length === 0;
  elements.emptyState.classList.toggle("is-visible", isEmpty);

  const emptyTitle = elements.emptyState.querySelector("h3");
  const emptyDescription = elements.emptyState.querySelector("p");

  if (state.items.length === 0) {
    emptyTitle.textContent = "아직 저장된 항목이 없습니다.";
    emptyDescription.textContent = "홈에서 첫 항목을 추가해 보세요.";
  } else {
    emptyTitle.textContent = "조건에 맞는 항목이 없습니다.";
    emptyDescription.textContent = "필터, 프로젝트, 태그 또는 검색어를 바꿔 보세요.";
  }
}

function renderTodayView() {
  const today = new Date();
  const todayKey = getDateKey(today);

  const todos = state.items
    .filter((item) => item.type === "todo")
    .sort(
      (a, b) =>
        compareCompletion(a, b) ||
        comparePriority(a, b) ||
        compareDueDate(a, b) ||
        compareCreatedAt(a, b),
    );

  const overdue = todos.filter(
    (item) => !item.completed && item.dueDate && item.dueDate < todayKey,
  );

  const dueToday = todos.filter(
    (item) => !item.completed && item.dueDate === todayKey,
  );

  const focus = todos.filter(
    (item) =>
      !item.completed &&
      !item.dueDate &&
      (item.priority === "high" || item.pinned),
  );

  const completedToday = state.completions.filter(
    (record) => getDateKey(new Date(record.completedAt)) === todayKey,
  ).length;

  elements.todayDateText.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  elements.todayProgressText.textContent =
    `${completedToday} / ${completedToday + overdue.length + dueToday.length}`;

  renderTodayList(elements.todayOverdueList, elements.todayOverdueEmpty, overdue);
  renderTodayList(elements.todayDueList, elements.todayDueEmpty, dueToday);
  renderTodayList(elements.todayFocusList, elements.todayFocusEmpty, focus);

  elements.todayOverdueCount.textContent = overdue.length;
  elements.todayDueCount.textContent = dueToday.length;
  elements.todayFocusCount.textContent = focus.length;
}

function renderTodayList(listElement, emptyElement, items) {
  listElement.replaceChildren();

  items.forEach((item) => {
    listElement.append(createItemFragment(item, { compact: true }));
  });

  emptyElement.hidden = items.length > 0;
}

function renderProjects() {
  elements.projectGrid.replaceChildren();
  elements.projectEmpty.hidden = state.projects.length > 0;

  state.projects
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .forEach((project) => {
      const projectItems = state.items.filter(
        (item) => item.projectId === project.id,
      );
      const todos = projectItems.filter((item) => item.type === "todo");
      const completed = todos.filter((item) => item.completed).length;
      const rate = todos.length ? Math.round((completed / todos.length) * 100) : 0;

      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.projectId = project.id;

      const heading = document.createElement("div");
      heading.className = "project-card-heading";

      const titleWrap = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = project.name;
      const meta = document.createElement("small");
      meta.textContent = `전체 ${projectItems.length} · 할 일 ${todos.length}`;

      titleWrap.append(title, meta);

      const rateText = document.createElement("strong");
      rateText.textContent = `${rate}%`;

      heading.append(titleWrap, rateText);

      const progressTrack = document.createElement("div");
      progressTrack.className = "progress-track";
      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressFill.style.width = `${rate}%`;
      progressTrack.append(progressFill);

      const description = document.createElement("p");
      description.className = "muted-text";
      description.textContent = `완료 ${completed} / ${todos.length}`;

      const actions = document.createElement("div");
      actions.className = "project-card-actions";

      actions.append(
        createProjectButton("열기", "project-open-button"),
        createProjectButton("이름 변경", "project-rename-button"),
        createProjectButton("삭제", "project-delete-button"),
      );

      card.append(heading, progressTrack, description, actions);
      elements.projectGrid.append(card);
    });
}

function createProjectButton(text, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button button-secondary ${className}`;
  button.textContent = text;
  return button;
}

function renderWeekView() {
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(state.weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  const endDate = weekDates[6];

  elements.weekRangeText.textContent =
    `${formatShortDate(state.weekStart)} – ${formatShortDate(endDate)}`;

  elements.weekBoard.replaceChildren();

  weekDates.forEach((date) => {
    const dateKey = getDateKey(date);
    const dayItems = state.items
      .filter((item) => item.type === "todo" && item.dueDate === dateKey)
      .sort(
        (a, b) =>
          compareCompletion(a, b) ||
          comparePriority(a, b) ||
          compareCreatedAt(a, b),
      );

    const column = document.createElement("section");
    column.className = "week-day";
    column.dataset.dropDate = dateKey;
    column.classList.toggle("is-today", dateKey === getDateKey(new Date()));

    const header = document.createElement("div");
    header.className = "week-day-header";

    const weekday = document.createElement("strong");
    weekday.textContent = new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
    }).format(date);

    const dateText = document.createElement("span");
    dateText.textContent = new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
    }).format(date);

    header.append(weekday, dateText);
    column.append(header);

    dayItems.forEach((item) => {
      column.append(createWeekTask(item));
    });

    elements.weekBoard.append(column);
  });
}

function createWeekTask(item) {
  const task = document.createElement("article");
  task.className = "week-task";
  task.draggable = true;
  task.dataset.weekItemId = item.id;
  task.classList.toggle("is-completed", item.completed);

  const title = document.createElement("strong");
  title.textContent = item.content;

  const meta = document.createElement("div");
  meta.className = "week-task-meta";

  const priority = document.createElement("span");
  priority.textContent = PRIORITY_LABELS[item.priority];

  meta.append(priority);

  const projectName = getProjectName(item.projectId);
  if (projectName) {
    const project = document.createElement("span");
    project.textContent = projectName;
    meta.append(project);
  }

  if (item.recurrence !== "none") {
    const recurrence = document.createElement("span");
    recurrence.textContent = RECURRENCE_LABELS[item.recurrence];
    meta.append(recurrence);
  }

  task.append(title, meta);
  return task;
}

function renderStats() {
  const now = new Date();
  const start7 = startOfDay(addDays(now, -6));
  const start30 = startOfDay(addDays(now, -29));

  const completed7 = state.completions.filter(
    (record) => new Date(record.completedAt) >= start7,
  ).length;

  const completed30 = state.completions.filter(
    (record) => new Date(record.completedAt) >= start30,
  ).length;

  const todos = state.items.filter((item) => item.type === "todo");
  const completedCurrent = todos.filter((item) => item.completed).length;
  const completionRate = todos.length
    ? Math.round((completedCurrent / todos.length) * 100)
    : 0;

  elements.completed7Count.textContent = completed7;
  elements.completed30Count.textContent = completed30;
  elements.completedAllCount.textContent = state.completions.length;
  elements.completionRateText.textContent = `${completionRate}%`;

  renderWeeklyBars();
  renderProjectStats();
  renderCompletionHistory();
}

function renderWeeklyBars() {
  elements.weeklyBars.replaceChildren();

  const days = Array.from({ length: 7 }, (_, index) => addDays(new Date(), index - 6));
  const counts = days.map((date) => {
    const dateKey = getDateKey(date);
    return state.completions.filter(
      (record) => getDateKey(new Date(record.completedAt)) === dateKey,
    ).length;
  });

  const maxCount = Math.max(...counts, 1);

  days.forEach((date, index) => {
    const column = document.createElement("div");
    column.className = "bar-column";

    const value = document.createElement("span");
    value.className = "bar-value";
    value.textContent = counts[index];

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.height = `${Math.max(4, (counts[index] / maxCount) * 100)}%`;

    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
    }).format(date);

    track.append(fill);
    column.append(value, track, label);
    elements.weeklyBars.append(column);
  });
}

function renderProjectStats() {
  elements.projectStatsList.replaceChildren();
  elements.projectStatsEmpty.hidden = state.projects.length > 0;

  state.projects
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .forEach((project) => {
      const todos = state.items.filter(
        (item) => item.projectId === project.id && item.type === "todo",
      );
      const completed = todos.filter((item) => item.completed).length;
      const rate = todos.length ? Math.round((completed / todos.length) * 100) : 0;

      const row = document.createElement("div");
      row.className = "project-stat-row";

      const name = document.createElement("strong");
      name.textContent = project.name;

      const track = document.createElement("div");
      track.className = "progress-track";

      const fill = document.createElement("div");
      fill.className = "progress-fill";
      fill.style.width = `${rate}%`;
      track.append(fill);

      const value = document.createElement("span");
      value.textContent = `${completed}/${todos.length} · ${rate}%`;

      row.append(name, track, value);
      elements.projectStatsList.append(row);
    });
}

function renderCompletionHistory() {
  const records = state.completions
    .slice()
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 30);

  elements.completionHistoryList.replaceChildren();
  elements.completionHistoryEmpty.hidden = records.length > 0;

  records.forEach((record) => {
    const item = document.createElement("li");
    item.className = "history-item";

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = record.content;

    const projectName = getProjectName(record.projectId);
    if (projectName) {
      const project = document.createElement("span");
      project.textContent = projectName;
      content.append(title, document.createElement("br"), project);
    } else {
      content.append(title);
    }

    const time = document.createElement("span");
    time.textContent = formatHistoryDate(record.completedAt);

    item.append(content, time);
    elements.completionHistoryList.append(item);
  });
}

function createItemFragment(item, options = {}) {
  const fragment = elements.itemTemplate.content.cloneNode(true);
  const itemElement = fragment.querySelector(".inbox-item");
  const typeBadge = fragment.querySelector(".type-badge");
  const projectBadge = fragment.querySelector(".project-badge");
  const priorityBadge = fragment.querySelector(".priority-badge");
  const recurrenceBadge = fragment.querySelector(".recurrence-badge");
  const dueBadge = fragment.querySelector(".due-badge");
  const timeElement = fragment.querySelector(".item-time");
  const contentElement = fragment.querySelector(".item-content");
  const tagsElement = fragment.querySelector(".item-tags");
  const pinButton = fragment.querySelector(".pin-button");
  const todayButton = fragment.querySelector(".today-button");
  const checkButton = fragment.querySelector(".check-button");

  itemElement.dataset.itemId = item.id;
  itemElement.classList.toggle("is-completed", item.completed);
  itemElement.classList.toggle("is-pinned", item.pinned);
  itemElement.classList.toggle("is-overdue", isOverdue(item));
  itemElement.classList.toggle("is-due-today", isDueToday(item));

  typeBadge.textContent = TYPE_LABELS[item.type] ?? item.type;

  const projectName = getProjectName(item.projectId);
  projectBadge.hidden = !projectName;
  projectBadge.textContent = projectName;

  priorityBadge.textContent = `우선순위 ${PRIORITY_LABELS[item.priority]}`;
  priorityBadge.dataset.priority = item.priority;

  recurrenceBadge.hidden = item.recurrence === "none";
  recurrenceBadge.textContent = RECURRENCE_LABELS[item.recurrence];

  renderDueBadge(dueBadge, item);

  timeElement.textContent = options.compact
    ? formatCreatedDate(item.createdAt)
    : `등록 ${formatCreatedDate(item.createdAt)}`;

  contentElement.append(renderContent(item));
  renderTags(tagsElement, item.tags);

  pinButton.textContent = item.pinned ? "★" : "☆";
  pinButton.classList.toggle("is-active", item.pinned);

  todayButton.hidden =
    item.type !== "todo" ||
    item.completed ||
    isDueToday(item);

  checkButton.hidden = item.type !== "todo";
  checkButton.setAttribute("aria-pressed", String(item.completed));

  return fragment;
}

function renderTags(container, tags) {
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-chip";
    button.dataset.tag = tag;
    button.textContent = `#${tag}`;
    container.append(button);
  });
}

function renderDueBadge(element, item) {
  element.classList.remove("is-today", "is-overdue");

  if (!item.dueDate) {
    element.hidden = true;
    return;
  }

  element.hidden = false;

  if (isOverdue(item) && !item.completed) {
    element.textContent = `기한 초과 · ${formatDueDate(item.dueDate)}`;
    element.classList.add("is-overdue");
    return;
  }

  if (isDueToday(item) && !item.completed) {
    element.textContent = "오늘 마감";
    element.classList.add("is-today");
    return;
  }

  element.textContent = `마감 ${formatDueDate(item.dueDate)}`;
}

function renderContent(item) {
  const fragment = document.createDocumentFragment();

  if (item.type === "link") {
    const url = normalizeUrl(item.content);

    if (url) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = item.content;
      fragment.append(anchor);
      return fragment;
    }
  }

  fragment.append(document.createTextNode(item.content));
  return fragment;
}

function getProjectName(projectId) {
  return state.projects.find((project) => project.id === projectId)?.name || "";
}

function normalizeUrl(value) {
  const trimmed = value.trim();

  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(candidate);

    if (!parsed.hostname.includes(".")) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function isDueToday(item) {
  return Boolean(item.dueDate) && item.dueDate === getDateKey(new Date());
}

function isOverdue(item) {
  return Boolean(item.dueDate) && item.dueDate < getDateKey(new Date());
}

function isValidDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getStartOfWeek(date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + mondayOffset);
  return result;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatCreatedDate(isoString) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function formatDueDate(dateKey) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(parseDateKey(dateKey));
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatHistoryDate(isoString) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}


function mergeById(currentItems, importedItems) {
  const byId = new Map(currentItems.map((item) => [item.id, item]));
  importedItems.forEach((item) => byId.set(item.id, item));
  return [...byId.values()];
}
