const STORAGE_KEY = 'cad-pages-progress-v1';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { categories: {}, wrongQuestionIds: [], lastStudyDate: null, streak: 0 };
    }
    const parsed = JSON.parse(raw);
    return {
      categories: parsed.categories ?? {},
      wrongQuestionIds: parsed.wrongQuestionIds ?? [],
      lastStudyDate: parsed.lastStudyDate ?? null,
      streak: Number.isFinite(parsed.streak) ? parsed.streak : 0
    };
  } catch {
    return { categories: {}, wrongQuestionIds: [], lastStudyDate: null, streak: 0 };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function applyStudyDay(progress) {
  const today = todayString();
  if (progress.lastStudyDate === today) {
    return progress;
  }
  progress.streak = progress.lastStudyDate === yesterdayString() ? progress.streak + 1 : 1;
  progress.lastStudyDate = today;
  return progress;
}

export function recordAnswer({ categoryId, questionId, isCorrect }) {
  const progress = applyStudyDay(loadProgress());
  const categoryStats = progress.categories[categoryId] ?? { correct: 0, total: 0 };
  categoryStats.total += 1;
  if (isCorrect) {
    categoryStats.correct += 1;
    progress.wrongQuestionIds = progress.wrongQuestionIds.filter((id) => id !== questionId);
  } else if (!progress.wrongQuestionIds.includes(questionId)) {
    progress.wrongQuestionIds.push(questionId);
  }
  progress.categories[categoryId] = categoryStats;
  saveProgress(progress);
  return progress;
}
