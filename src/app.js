// ============================
// ГЛОБАЛЬНОЕ ХРАНИЛИЩЕ
// handlers["target-btn"] = { click: [fn1], mouseover: [fn2] }
// ============================
export const handlers = {};


// ============================
// UI: обновление статуса
// ============================

export function updateStatus(elementId) {
  const el = document.getElementById(elementId);
  const status = document.getElementById("status");

  const record = handlers[elementId];
  if (!record) {
    status.textContent = "Нет добавленных событий.";
    return;
  }

  let text = `Статистика для #${elementId}:\n`;

  for (const evt in record) {
    const count = el.dataset[evt] || 0;
    const active = record[evt].length > 0 ? " (активно)" : " (удалено)";
    text += `• ${evt}: ${count} срабатываний${active}\n`;
  }

  status.textContent = text;
}


// ============================
// ДОБАВЛЕНИЕ СОБЫТИЙ
// ============================

export function addEventsById(elementId, events) {
  // TODO: Implement
}


// ============================
// УДАЛЕНИЕ СОБЫТИЙ
// ============================

export function removeEventsById(elementId, events) {
  // TODO: Implement
}



// ============================
// ЗАДАНИЕ 2 — КАРУСЕЛЬ
// ============================

export function setupCarousel(carouselWrapperSelector, modalSelector) {
  // TODO: Implement
}

