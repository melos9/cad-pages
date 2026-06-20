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

    current.choices.forEach((choice, choiceIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-btn';
      button.innerHTML = `<span class="choice-key">${choiceLabels[choiceIndex] ?? choiceIndex + 1}</span><span class="choice-text">${choice}</span>`;
      button.addEventListener('click', () => {
        const isCorrect = choiceIndex === current.answer;
        if (isCorrect) {
          correctCount += 1;
        }
        recordAnswer({ categoryId: current.categoryId, questionId: current.id, isCorrect });

        Array.from(choicesEl.querySelectorAll('button')).forEach((item, itemIndex) => {
          item.disabled = true;
          if (itemIndex === current.answer) {
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
    root.innerHTML = `
      <div class="quiz quiz-summary">
        <p class="summary-title">おつかれさまでした！</p>
        <p class="summary-score"><strong>${correctCount}</strong> / ${total} 問正解（正答率 ${rate}%）</p>
        <div class="quiz-bar"><span class="quiz-bar-fill" style="width:${rate}%"></span></div>
        <button type="button" id="retry" class="button primary">もう一度解く</button>
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
