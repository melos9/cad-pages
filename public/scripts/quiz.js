import { loadProgress, recordAnswer } from './storage.js';

const root = document.getElementById('quiz-root');
const dataElement = document.getElementById('cad-app-data');
const data = dataElement ? JSON.parse(dataElement.textContent ?? '{}') : null;

if (!root || !data) {
  throw new Error('Quiz data not found');
}

const allQuestions = data.categories.flatMap((category) =>
  category.questions.map((question) => ({ ...question, categoryId: category.id, categoryName: category.name }))
);

let questions = [];

if (data.mode === 'category') {
  questions = allQuestions.filter((question) => question.categoryId === data.categoryId);
} else {
  const progress = loadProgress();
  questions = allQuestions.filter((question) => progress.wrongQuestionIds.includes(question.id));
}

function shuffle(list) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

questions = shuffle(questions);

if (questions.length === 0) {
  root.innerHTML = '<p>出題できる問題がありません。分野別演習で回答すると復習対象が作成されます。</p>';
} else {
  let index = 0;
  let correctCount = 0;
  const total = questions.length;
  const choiceLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  function render() {
    const current = questions[index];
    const progress = Math.round((index / total) * 100);
    root.innerHTML = `
      <div class="quiz">
        <div class="quiz-progress">
          <div class="quiz-progress-meta">
            <span class="quiz-count">問題 ${index + 1} / ${total}</span>
            <span class="quiz-cat">${current.categoryName}</span>
          </div>
          <div class="quiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
            <span class="quiz-bar-fill" style="width:${progress}%"></span>
          </div>
        </div>
        <p class="quiz-question">${current.text}</p>
        <div class="quiz-choices" id="choices"></div>
        <div id="result" class="quiz-result"></div>
      </div>
    `;

    const choicesEl = document.getElementById('choices');
    const resultEl = document.getElementById('result');

    const shuffledChoices = shuffle(
      current.choices.map((text, i) => ({ text, correct: i === current.answer }))
    );

    shuffledChoices.forEach((choice, choiceIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-btn';
      button.innerHTML = `<span class="choice-key">${choiceLabels[choiceIndex] ?? choiceIndex + 1}</span><span class="choice-text">${choice.text}</span>`;
      button.addEventListener('click', () => {
        const isCorrect = choice.correct;
        if (isCorrect) {
          correctCount += 1;
        }
        recordAnswer({ categoryId: current.categoryId, questionId: current.id, isCorrect });

        Array.from(choicesEl.querySelectorAll('button')).forEach((item, itemIndex) => {
          item.disabled = true;
          if (shuffledChoices[itemIndex].correct) {
            item.classList.add('correct');
          } else if (itemIndex === choiceIndex) {
            item.classList.add('incorrect');
          } else {
            item.classList.add('dimmed');
          }
        });

        const isLast = index + 1 >= total;
        resultEl.innerHTML = `
          <div class="result-box ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <p class="result-status">${isCorrect ? '◯ 正解' : '✕ 不正解'}</p>
            <p class="result-explain">${current.explanation}</p>
          </div>
          <button type="button" id="next-question" class="button primary">${isLast ? '結果を見る' : '次の問題へ'}</button>
        `;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const nextButton = document.getElementById('next-question');
        nextButton?.addEventListener('click', () => {
          index += 1;
          if (index >= total) {
            renderSummary();
            return;
          }
          render();
        });
      });
      choicesEl.appendChild(button);
    });
  }

  function renderSummary() {
    const rate = Math.round((correctCount / total) * 100);
    const shareText = `CAD利用技術者試験 2次元2級の演習で ${correctCount}/${total} 問正解（正答率 ${rate}%）でした！`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(location.href)}`;
    root.innerHTML = `
      <div class="quiz quiz-summary">
        <p class="summary-title">おつかれさまでした！</p>
        <p class="summary-score"><strong>${correctCount}</strong> / ${total} 問正解（正答率 ${rate}%）</p>
        <div class="quiz-bar"><span class="quiz-bar-fill" style="width:${rate}%"></span></div>
        <div class="quiz-summary-actions">
          <button type="button" id="retry" class="button primary">もう一度解く</button>
          <a class="share-btn" href="${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="結果をXでシェア">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            結果をXでシェア
          </a>
        </div>
      </div>
    `;
    document.getElementById('retry')?.addEventListener('click', () => {
      index = 0;
      correctCount = 0;
      questions = shuffle(questions);
      render();
    });
  }

  render();
}
