const tabs = [...document.querySelectorAll('[data-view]')];
function showView(view) {
  for (const tab of tabs) {
    const selected = tab.dataset.view === view;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.dataset.view).hidden = !selected;
  }
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    showView(tabs[next].dataset.view);
    tabs[next].focus();
  });
}
document.querySelector('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  showView('preview');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('annotations').addEventListener('change', (event) => {
  document.getElementById('preview').classList.toggle('show-notes', event.target.checked);
});

const cards = [...document.querySelectorAll('.space-card')];
const saved = new Set();
let activeCategory = 'all';
let onlySaved = false;
let dialogCard;
const dialog = document.getElementById('space-dialog');
const favoriteButtons = [...document.querySelectorAll('[data-save]')];
const savedFilter = document.querySelector('.saved-filter');
function updateCards() {
  let visible = 0;
  for (const card of cards) {
    card.hidden = (activeCategory !== 'all' && card.dataset.category !== activeCategory) || (onlySaved && !saved.has(card.dataset.id));
    if (!card.hidden) visible++;
  }
  for (const button of favoriteButtons) {
    const isSaved = saved.has(button.dataset.save);
    button.setAttribute('aria-pressed', String(isSaved));
    const title = cards.find((card) => card.dataset.id === button.dataset.save).querySelector('h2').textContent;
    button.setAttribute('aria-label', `${isSaved ? '取消收藏' : '收藏'}${title}`);
  }
  document.getElementById('saved-count').textContent = saved.size;
  document.getElementById('empty-state').hidden = visible !== 0;
  document.getElementById('empty-state').textContent = saved.size === 0 ? '这里还没有收藏。点击照片上的爱心，留下喜欢的空间。' : '这个分类中还没有收藏。试试其他分类。';
  document.getElementById('browse-status').textContent = `显示 ${visible} 个空间，已收藏 ${saved.size} 个。`;
}
function toggleSaved(id) {
  if (saved.has(id)) saved.delete(id);
  else saved.add(id);
  updateCards();
  if (dialog.open) updateDialogSaved();
}
for (const button of favoriteButtons) button.addEventListener('click', () => toggleSaved(button.dataset.save));
for (const button of document.querySelectorAll('[data-category]:not(.space-card)')) {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    for (const category of document.querySelectorAll('.categories button')) {
      const selected = category === button;
      category.classList.toggle('selected', selected);
      category.setAttribute('aria-pressed', String(selected));
    }
    updateCards();
  });
}
savedFilter.addEventListener('click', () => {
  onlySaved = !onlySaved;
  savedFilter.setAttribute('aria-pressed', String(onlySaved));
  updateCards();
});
function updateDialogSaved() {
  const isSaved = saved.has(dialogCard.dataset.id);
  document.getElementById('dialog-save').textContent = isSaved ? '取消收藏' : '收藏这个空间';
  document.getElementById('dialog-feedback').textContent = isSaved ? '已加入本次浏览的收藏' : '';
}
for (const button of document.querySelectorAll('[data-open]')) {
  button.addEventListener('click', () => {
    dialogCard = cards.find((card) => card.dataset.id === button.dataset.open);
    const image = dialogCard.querySelector('img');
    document.getElementById('dialog-image').src = image.src;
    document.getElementById('dialog-image').alt = image.alt;
    document.getElementById('dialog-title').textContent = dialogCard.querySelector('h2').textContent;
    document.getElementById('dialog-description').textContent = dialogCard.querySelector('.space-info p').textContent;
    dialog.showModal();
    updateDialogSaved();
  });
}
document.getElementById('dialog-save').addEventListener('click', () => toggleSaved(dialogCard.dataset.id));
document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});

const scaleInput = document.getElementById('type-scale');
const familyInput = document.getElementById('font-family');
function updateType() {
  const scale = Number(scaleInput.value) / 100;
  const specimens = document.getElementById('type-specimens');
  specimens.style.setProperty('--scale', scale);
  specimens.style.setProperty('--specimen-font', familyInput.value === 'inter' ? 'var(--font)' : "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif");
  document.getElementById('scale-value').textContent = `${scaleInput.value}%`;
  for (const row of document.querySelectorAll('.specimen')) {
    row.style.setProperty('--role-size', `${row.dataset.size}px`);
    row.style.setProperty('--role-weight', row.dataset.weight);
    row.style.setProperty('--role-leading', row.dataset.leading);
    row.querySelector('.size-label').textContent = `${Math.round(Number(row.dataset.size) * scale * 10) / 10}px`;
  }
}
scaleInput.addEventListener('input', updateType);
familyInput.addEventListener('change', updateType);
document.getElementById('reset-type').addEventListener('click', () => {
  scaleInput.value = '100';
  familyInput.value = 'inter';
  updateType();
});
updateType();

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
const foreground = document.getElementById('foreground');
const background = document.getElementById('background');
const sampleSize = document.getElementById('sample-size');
const sampleWeight = document.getElementById('sample-weight');
function updateContrast() {
  const sample = document.getElementById('contrast-sample');
  sample.style.color = foreground.value;
  sample.style.backgroundColor = background.value;
  const size = Number(sampleSize.value);
  const weight = Number(sampleWeight.value);
  const text = document.getElementById('sample-text');
  text.style.fontSize = `${size}px`;
  text.style.fontWeight = weight;
  document.getElementById('foreground-value').textContent = foreground.value.toUpperCase();
  document.getElementById('background-value').textContent = background.value.toUpperCase();
  document.getElementById('sample-size-value').textContent = `${size}px`;
  const ratio = contrastRatio(foreground.value, background.value);
  const largeText = size >= 24 || (weight >= 700 && size >= 14 * 96 / 72);
  const threshold = largeText ? 3 : 4.5;
  document.getElementById('contrast-ratio').innerHTML = `${ratio.toFixed(2)}<span>:1</span>`;
  const status = document.getElementById('contrast-status');
  status.textContent = ratio >= threshold ? '样本文字通过 AA' : '样本文字未达 AA';
  status.classList.toggle('fail', ratio < threshold);
  document.getElementById('contrast-condition').textContent = `${largeText ? '大字号' : '普通'}文字至少 ${threshold}:1`;
  for (const button of document.querySelectorAll('[data-fg]')) button.classList.toggle('selected', foreground.value === button.dataset.fg && background.value === button.dataset.bg);
}
for (const input of [foreground, background, sampleSize]) input.addEventListener('input', updateContrast);
sampleWeight.addEventListener('change', updateContrast);
for (const button of document.querySelectorAll('[data-fg]')) button.addEventListener('click', () => {
  foreground.value = button.dataset.fg;
  background.value = button.dataset.bg;
  updateContrast();
});
updateContrast();
