import { loadProgress } from './storage.js';

const root = document.getElementById('stats-root');
const dataElement = document.getElementById('cad-stats-data');
const data = dataElement ? JSON.parse(dataElement.textContent ?? '{}') : null;

if (!root || !data) {
  throw new Error('Stats data not found');
}

const progress = loadProgress();

const totalAnswered = data.categories.reduce((sum, category) => {
  const stats = progress.categories[category.id];
  return sum + (stats ? stats.total : 0);
}, 0);

const summaryChips = [
  { label: '連続学習日数', value: `${progress.streak}`, unit: '日' },
  { label: '復習できる誤答', value: `${progress.wrongQuestionIds.length}`, unit: '問' },
  { label: '解いた問題数', value: `${totalAnswered}`, unit: '問' }
]
  .map(
    (chip) => `
      <div class="stat-chip">
        <span class="stat-num">${chip.value}<small>${chip.unit}</small></span>
        <span class="stat-label">${chip.label}</span>
      </div>`
  )
  .join('');

const categoryCards = data.categories
  .map((category) => {
    const stats = progress.categories[category.id] ?? { correct: 0, total: 0 };
    const rate = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    const done = stats.total > 0;
    return `
      <div class="stat-row">
        <div class="stat-row-head">
          <span class="stat-row-name">${category.name}</span>
          <span class="stat-row-val">${done ? `${rate}%` : '未挑戦'}</span>
        </div>
        <div class="quiz-bar"><span class="quiz-bar-fill" style="width:${rate}%"></span></div>
        <div class="stat-row-sub">${done ? `${stats.correct} / ${stats.total} 問正解` : 'まだ解いていません'}</div>
      </div>`;
  })
  .join('');

root.innerHTML = `
  <div class="stats-summary">${summaryChips}</div>
  <h2 class="stats-heading">分野別の正答率</h2>
  <div class="stats-grid">${categoryCards}</div>
  <p class="note">※ 学習の記録はお使いのブラウザに保存されます。ブラウザのデータ（履歴・サイトデータ）を消去したり、別の端末・ブラウザに変えると記録は引き継がれません。</p>
`;
