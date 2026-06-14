import { loadProgress } from './storage.js';

const root = document.getElementById('stats-root');
const dataElement = document.getElementById('cad-stats-data');
const data = dataElement ? JSON.parse(dataElement.textContent ?? '{}') : null;

if (!root || !data) {
  throw new Error('Stats data not found');
}

const progress = loadProgress();
const categoryRows = data.categories
  .map((category) => {
    const stats = progress.categories[category.id] ?? { correct: 0, total: 0 };
    const rate = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return { name: category.name, ...stats, rate };
  })
  .map(
    (row) => `
      <li style="margin-bottom: 0.7rem;">
        <strong>${row.name}</strong><br />
        正答率: ${row.rate}% (${row.correct}/${row.total})
      </li>
    `
  )
  .join('');

root.innerHTML = `
  <div class="card" style="margin-top: 0.75rem;">
    <p><strong>連続学習日数:</strong> ${progress.streak} 日</p>
    <p><strong>最終学習日:</strong> ${progress.lastStudyDate ?? 'まだ学習記録がありません'}</p>
    <p><strong>復習対象の誤答数:</strong> ${progress.wrongQuestionIds.length} 問</p>
    <h3>分野別進捗</h3>
    <ul style="padding-left: 1.2rem;">${categoryRows}</ul>
  </div>
`;
