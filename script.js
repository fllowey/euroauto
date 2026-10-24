const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  document.body.classList.toggle('menu-open', isOpen);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    menuButton?.focus();
  }
});

const serviceSearch = document.querySelector('#service-search');
const serviceGroups = [...document.querySelectorAll('.service-group')];
const noResults = document.querySelector('.no-results');
serviceSearch?.addEventListener('input', () => {
  const query = serviceSearch.value.trim().toLocaleLowerCase('ru');
  let visible = 0;
  serviceGroups.forEach((group) => {
    const haystack = `${group.dataset.search || ''} ${group.innerText}`.toLocaleLowerCase('ru');
    group.hidden = query.length > 0 && !haystack.includes(query);
    if (!group.hidden) visible++;
  });
  if (noResults) noResults.hidden = visible > 0;
});

// Service details are shown locally, without navigating away from the site.
const serviceDialog = document.createElement('dialog');
serviceDialog.className = 'info-dialog';
serviceDialog.setAttribute('aria-labelledby', 'service-dialog-title');
serviceDialog.innerHTML = '<div class="info-dialog-inner"><button class="dialog-close" type="button" aria-label="Закрыть">×</button><h2 id="service-dialog-title"></h2><p class="dialog-intro"></p><ul class="dialog-list"></ul><p>Состав работ и возможность выполнения в филиале зависят от автомобиля. Уточните детали у специалистов ЕвроАвто в Архангельске.</p><a class="dialog-phone" href="tel:+78182608048">Позвонить: +7 (8182) 60-80-48</a></div>';
document.body.append(serviceDialog);
const closeDialog = () => serviceDialog.close();
serviceDialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
serviceDialog.addEventListener('click', (event) => { if (event.target === serviceDialog) closeDialog(); });
document.querySelectorAll('[data-service-info]').forEach((button) => button.addEventListener('click', () => {
  const group = button.closest('.service-group');
  serviceDialog.querySelector('#service-dialog-title').textContent = group.querySelector('h3').textContent;
  const items = [...group.querySelectorAll('li')].map((item) => item.textContent.trim());
  const list = serviceDialog.querySelector('.dialog-list');
  list.replaceChildren(...items.map((item) => { const li = document.createElement('li'); li.textContent = item; return li; }));
  serviceDialog.showModal();
}));

// Disable casual copying, text selection and context-menu copying across the whole site.
for (const eventName of ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart']) {
  document.addEventListener(eventName, (event) => event.preventDefault());
}
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'x'].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

// Ask for confirmation before handing a tel: link to iOS or another dialer.
const callDialog = document.createElement('dialog');
callDialog.className = 'call-dialog';
callDialog.setAttribute('aria-labelledby', 'call-dialog-title');
callDialog.innerHTML = '<div class="call-dialog-inner"><button class="call-dialog-close" type="button" aria-label="Закрыть">×</button><p class="call-dialog-kicker">ЕВРОАВТО · АРХАНГЕЛЬСК</p><h2 id="call-dialog-title">Позвонить в сервис?</h2><p class="call-dialog-number"></p><a class="call-confirm-action" href="#">Позвонить</a><button class="call-cancel-action" type="button">Отмена</button></div>';
document.body.append(callDialog);
const closeCallDialog = () => callDialog.close();
callDialog.querySelector('.call-dialog-close').addEventListener('click', closeCallDialog);
callDialog.querySelector('.call-cancel-action').addEventListener('click', closeCallDialog);
callDialog.addEventListener('click', (event) => { if (event.target === callDialog) closeCallDialog(); });
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="tel:"]');
  if (!link || link.classList.contains('call-confirm-action')) return;
  event.preventDefault();
  const href = link.getAttribute('href');
  const digits = href.slice(4);
  const labels = {'+78182608048': '+7 (8182) 60-80-48', '+78003334554': '8 (800) 333-45-54'};
  callDialog.querySelector('.call-dialog-number').textContent = labels[digits] || link.textContent.replace('↗', '').trim() || digits;
  callDialog.querySelector('.call-confirm-action').href = href;
  callDialog.showModal();
});
