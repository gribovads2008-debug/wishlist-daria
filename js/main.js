const grid = document.getElementById("giftsGrid");

// ⚠️ ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ИЗ GOOGLE APPS SCRIPT (ту, что заканчивается на /exec)
// Она должна быть точно такой же, как в product.js
const API_URL = "https://script.google.com/macros/s/AKfycbxgPd2hGtTCvaDCA_TBnaBdvqlXBsCojUKRrQOK03fZcVMeayrPiIv_VlTM_eZdpBAxjQ/exec"; 

async function loadReservationsAndRender() {
  let reservations = {};
  
  // 1. Пытаемся загрузить данные из таблицы
  try {
    const response = await fetch(API_URL);
    reservations = await response.json(); 
  } catch (e) {
    console.error("Не удалось загрузить брони", e);
  }

  // 2. Очищаем экран от старых карточек
  grid.innerHTML = ""; 

  // 3. Отрисовываем карточки заново с учетом брони
  gifts.forEach(gift => {
    // Проверяем, есть ли этот подарок в списке забронированных
    const isReserved = reservations && reservations[gift.id] === true;
    
    // Создаем карточку
    const card = document.createElement("a");
    card.href = `product.html?id=${gift.id}`;
    
    // Если подарок забронирован, добавляем класс "reserved" (он делает карточку серой)
    card.className = "gift-card" + (isReserved ? " reserved" : "");
    
    // Наполняем карточку
    card.innerHTML = `
      <div class="gift-image-wrap">
        <img src="${gift.image}" alt="${gift.title}" class="gift-image">
        ${isReserved ? '<span class="badge-reserved">Зарезервировано</span>' : ''}
      </div>
      <div class="gift-info">
        <h3 class="gift-title">${gift.title}</h3>
        <p class="gift-price">${gift.price}</p>
      </div>
    `;
    
    // Добавляем карточку на страницу
    grid.appendChild(card);
  });
}

// Запускаем при загрузке страницы
loadReservationsAndRender();