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

  function render() {
    const current = questions[index];
    root.innerHTML = `
      <div class="card" style="margin-top: 0.75rem;">
        <p><strong>問題 ${index + 1}/${questions.length}</strong> ${current.categoryName}</p>
        <p>${current.text}</p>
        <div class="grid" id="choices"></div>
        <div id="result" style="margin-top: 1rem;"></div>
      </div>
    `;

    const choicesEl = document.getElementById('choices');
    const resultEl = document.getElementById('result');

    current.choices.forEach((choice, choiceIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-btn';
      button.textContent = choice;
      button.addEventListener('click', () => {
        const isCorrect = choiceIndex === current.answer;
        recordAnswer({ categoryId: current.categoryId, questionId: current.id, isCorrect });

        Array.from(choicesEl.querySelectorAll('button')).forEach((item, itemIndex) => {
          item.disabled = true;
          item.style.opacity = '0.75';
          if (itemIndex === current.answer) {
            item.classList.add('correct');
          } else if (itemIndex === choiceIndex) {
            item.classList.add('incorrect');
          }
        });

        const status = isCorrect ? '正解です。' : '不正解です。';
        resultEl.innerHTML = `
          <p><strong>${status}</strong></p>
          <p>${current.explanation}</p>
          <button type="button" id="next-question">次の問題へ</button>
        `;

        const nextButton = document.getElementById('next-question');
        nextButton?.addEventListener('click', () => {
          index += 1;
          if (index >= questions.length) {
            root.innerHTML = '<p>このセットは完了しました。トップや復習モードから続けて学習できます。</p>';
            return;
          }
          render();
        });
      });
      choicesEl.appendChild(button);
    });
  }

  render();
}
