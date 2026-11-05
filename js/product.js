const params = new URLSearchParams(window.location.search);
const giftId = parseInt(params.get("id"));
const gift = gifts.find(g => g.id === giftId);
const page = document.getElementById("productPage");

// ⚠️ ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ИЗ GOOGLE APPS SCRIPT (ту, что заканчивается на /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbxgPd2hGtTCvaDCA_TBnaBdvqlXBsCojUKRrQOK03fZcVMeayrPiIv_VlTM_eZdpBAxjQ/exec"; 

if (!gift) {
  page.innerHTML = `<p class="not-found">Подарок не найден 😢</p>`;
} else {
  renderProductPage(gift);
}

async function renderProductPage(gift) {
  page.innerHTML = `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${gift.image}" alt="${gift.title}" class="product-image">
      </div>
      <div class="product-details">
        <h1 class="product-title">${gift.title}</h1>
        <p class="product-price">${gift.price}</p>
        <p class="product-description">${gift.description}</p>
        <a href="${gift.link}" target="_blank" rel="noopener" class="btn-link">
          🔗 Посмотреть товар в магазине
        </a>
        <div class="action-area" id="actionArea">
          <p class="hint">Загрузка статуса...</p>
        </div>
      </div>
    </div>
  `;

  let isReserved = false;
  try {
    const response = await fetch(API_URL);
    const reservations = await response.json();
    if (reservations && reservations[gift.id]) {
        isReserved = true;
    }
  } catch (e) {
    console.error("Ошибка загрузки статуса", e);
  }

  updateActionButton(gift.id, isReserved);
}

function updateActionButton(id, reserved) {
  const area = document.getElementById("actionArea");
  if (!area) return;

  if (reserved) {
    area.innerHTML = `<button class="btn btn-cancel" id="btnAction">Отменить резервирование</button>`;
  } else {
    area.innerHTML = `<button class="btn btn-reserve" id="btnAction">Зарезервировать подарок</button>`;
  }

  document.getElementById("btnAction").addEventListener("click", async () => {
    const action = reserved ? "cancel" : "reserve";
    const btn = document.getElementById("btnAction");
    btn.disabled = true;
    btn.textContent = "Отправка...";

    try {
      // Создаем невидимую HTML-форму
      const form = document.createElement("form");
      form.method = "POST";
      form.action = API_URL;
      form.target = "hidden_iframe"; // Отправляем в невидимый фрейм
      form.style.display = "none";

      // Добавляем поля
      const giftInput = document.createElement("input");
      giftInput.type = "hidden";
      giftInput.name = "giftId";
      giftInput.value = id;
      form.appendChild(giftInput);

      const actionInput = document.createElement("input");
      actionInput.type = "hidden";
      actionInput.name = "action";
      actionInput.value = action;
      form.appendChild(actionInput);

      // Создаем невидимый iframe, чтобы страница не перезагружалась
      let iframe = document.getElementById("hidden_iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "hidden_iframe";
        iframe.id = "hidden_iframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }

      // Добавляем форму на страницу и "нажимаем" на кнопку отправки
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // Ждем 1.5 секунды, чтобы Google успел записать данные, и перезагружаем страницу
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      alert("Ошибка отправки.");
      btn.disabled = false;
      btn.textContent = reserved ? "Отменить" : "Зарезервировать";
    }
  });
}