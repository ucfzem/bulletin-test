// ============================================
// store — État centralisé de l'application.
// L'unique source de vérité pour la langue,
// les notes, les coefficients et le formulaire.
// ============================================

function createStore(initial = {}) {
  let state = { ...initial };
  const listeners = new Set();

  return {
    get: () => state,
    set: (patch) => {
      state = { ...state, ...patch };
      listeners.forEach((fn) => fn(state));
      return state;
    },
    update: (key, value) => {
      state = { ...state, [key]: value };
      listeners.forEach((fn) => fn(state));
      return state;
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
}

const LANG_KEY = 'bulletin_lang';

function loadInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ar' || saved === 'fr') return saved;
  } catch { /* localStorage indisponible */ }
  return 'fr';
}

export const store = createStore({
  lang: loadInitialLang(),
  grades: {},   // subjectKey → "8.50"
  coeffs: {},   // subjectKey → "1"
  form: {
    school: { fr: '', ar: '' },
    student: { fr: '', ar: '' },
    director: { fr: '', ar: '' },
    rank: '',
    remark: '',
    regNum: '',
    count: '',
    teachers: { fr: '', ar: '' }
  }
});

export function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  store.update('lang', lang);
}

// Fonctions pures d'accès aux données (testables).
export function getGrade(grades, key) {
  const v = grades[key];
  if (v === undefined || v === '') return null;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return null;
  return Math.min(10, Math.max(0, n));
}

export function getCoeff(coeffs, key) {
  const v = coeffs[key];
  if (v === undefined || v === '') return 1;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return 1;
  return Math.min(10, Math.max(0, n));
}
