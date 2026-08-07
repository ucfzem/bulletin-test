// ============================================
// app — Point d'entrée : câblage des événements,
// bascule de langue, aperçu et export PDF.
// ============================================

import { SUPPORTED_LANGS, langConfig, getTranslations } from './i18n.js';
import { curriculum } from './curriculum.js';
import { translateValue } from './values.js';
import { store, setLang } from './store.js';
import { calculateData } from './calc.js';
import {
  buildLangButtonsHTML,
  buildSelectOptions,
  buildUnitsFormHTML,
  buildMobilePreviewHTML,
  buildA4SheetHTML,
  applyStaticText
} from './render.js';

const $ = (id) => document.getElementById(id);
const state = () => store.get();

const els = {
  langBar: $('lang-bar'),
  formView: $('form-view'),
  preview: $('preview-mobile'),
  previewRender: $('mobile-card-render'),
  unitsForm: $('units-form'),
  a4Sheet: $('a4-sheet'),
  btnPreview: $('btnPreview'),
  btnEdit: $('btnEdit'),
  btnPrint: $('btnPrint'),
  btnExport: $('btnExport'),
  btnAutoFill: $('btnAutoFill'),
  gradeSelect: $('grade-select'),
  semesterSelect: $('semester-select'),
  yearSelect: $('year-select'),
  inputSchool: $('inputSchool'),
  inputStudent: $('inputStudent'),
  inputDirector: $('inputDirector'),
  inputRank: $('f-rank'),
  inputRemark: $('f-remark'),
  inputNum: $('f-num'),
  inputCount: $('inputCount'),
  inputTeachers: $('inputTeachers')
};

let lastTrigger = null;

// ---------- Langue ----------

function applyLanguage(lang) {
  const t = getTranslations(lang);
  const isRtl = lang === 'ar';

  applyStaticText(lang, t);

  // Boutons de langue (état aria-pressed)
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // Options des listes
  const gradeSel = els.gradeSelect;
  gradeSel.innerHTML = buildSelectOptions(t.grades, gradeSel.value);
  const semSel = els.semesterSelect;
  semSel.innerHTML = buildSelectOptions(t.semesters, semSel.value);

  // Traduction des valeurs saisies (bidirectionnelle)
  [els.inputSchool, els.inputStudent, els.inputDirector, els.inputRank, els.inputRemark, els.inputTeachers].forEach((el) => {
    if (!el) return;
    const translated = translateValue(el.value, lang);
    if (translated !== el.value) el.value = translated;
    el.classList.toggle('ar', isRtl);
  });

  renderUnitsForm();
}

function renderUnitsForm() {
  const { lang, grades, coeffs } = state();
  els.unitsForm.innerHTML = buildUnitsFormHTML({
    curriculum,
    lang,
    translations: getTranslations(lang),
    grades,
    coeffs
  });
}

function switchLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  if (lang === state().lang) return;
  setLang(lang);
  applyLanguage(lang);
}

// ---------- Formulaire / Store ----------

const FORM_FIELDS = ['school', 'student', 'director', 'rank', 'remark', 'count', 'teachers'];

function syncFormFields() {
  const form = state().form;
  els.inputSchool && (form.school = els.inputSchool.value);
  els.inputStudent && (form.student = els.inputStudent.value);
  els.inputDirector && (form.director = els.inputDirector.value);
  els.inputRank && (form.rank = els.inputRank.value);
  els.inputRemark && (form.remark = els.inputRemark.value);
  els.inputNum && (form.regNum = els.inputNum.value);
  els.inputCount && (form.count = els.inputCount.value);
  els.inputTeachers && (form.teachers = els.inputTeachers.value);
}

function collectForm() {
  syncFormFields();
  const form = { ...state().form };
  form.year = els.yearSelect.options[els.yearSelect.selectedIndex].text;
  form.period = els.semesterSelect.options[els.semesterSelect.selectedIndex].text;
  form.klass = els.gradeSelect.options[els.gradeSelect.selectedIndex].text;
  return form;
}

// ---------- Actions ----------

function autoFill() {
  const grades = {};
  const coeffs = {};
  curriculum.forEach((u) => u.subjects.forEach((s) => {
    grades[s.key] = (Math.random() * 4 + 6).toFixed(2);
    coeffs[s.key] = '1';
  }));
  store.update('grades', grades);
  store.update('coeffs', coeffs);
  renderUnitsForm();
}

function showPreview() {
  syncFormFields();
  const { lang } = state();
  const t = getTranslations(lang);
  const data = calculateData({ curriculum, lang, ...state() });

  els.previewRender.innerHTML = buildMobilePreviewHTML(data, collectForm(), lang, t);
  els.a4Sheet.innerHTML = buildA4SheetHTML(data, collectForm(), lang, t);
  els.a4Sheet.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  els.formView.hidden = true;
  els.preview.hidden = false;
  els.btnEdit.focus();
}

function showForm() {
  els.preview.hidden = true;
  els.formView.hidden = false;
  (lastTrigger || els.btnPreview).focus();
}

function exportPDF() {
  const btn = els.btnExport;
  if (btn.disabled) return;
  const { lang } = state();
  const t = getTranslations(lang);
  const original = t.exportPDF;

  btn.textContent = t.exporting;
  btn.disabled = true;

  const opt = {
    margin: 0,
    filename: 'Bulletin.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Rendre le conteneur visible pendant la capture (html2canvas ne capture
  // pas fiabiliment un élément opacity:0), puis le remasquer après.
  const parent = $('a4-render-container');
  parent.style.opacity = '1';
  parent.style.zIndex = '9999';

  window.html2pdf().set(opt).from(els.a4Sheet).save()
    .then(() => { btn.textContent = original; })
    .catch(() => { btn.textContent = original; })
    .finally(() => {
      parent.style.opacity = '0';
      parent.style.zIndex = '-9999';
      btn.disabled = false;
    });
}

// ---------- Initialisation ----------

function wireEvents() {
  // Bascule de langue (boutons générés dynamiquement)
  els.langBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (btn) switchLang(btn.dataset.lang);
  });

  // Boutons d'action
  els.btnAutoFill.addEventListener('click', autoFill);
  els.btnPreview.addEventListener('click', () => {
    lastTrigger = els.btnPreview;
    showPreview();
  });
  els.btnEdit.addEventListener('click', () => {
    lastTrigger = els.btnEdit;
    showForm();
  });
  els.btnPrint.addEventListener('click', () => window.print());
  els.btnExport.addEventListener('click', exportPDF);

  // Notes / coefficients : sync store (délégation)
  els.unitsForm.addEventListener('input', (e) => {
    const grade = e.target.closest('[data-grade]');
    const coeff = e.target.closest('[data-coeff]');
    if (grade) {
      store.update('grades', { ...state().grades, [grade.dataset.grade]: grade.value });
    } else if (coeff) {
      store.update('coeffs', { ...state().coeffs, [coeff.dataset.coeff]: coeff.value });
    }
  });

  // Champs du formulaire : sync store
  els.formView.addEventListener('input', (e) => {
    if (FORM_FIELDS.includes(e.target.id?.slice(1)) || e.target.matches('[id^="f-"]')) {
      syncFormFields();
    }
  });
}

function init() {
  const { lang } = state();
  document.documentElement.dir = langConfig[lang].dir;

  els.langBar.innerHTML = buildLangButtonsHTML(langConfig, lang);
  wireEvents();
  applyLanguage(lang);
}

init();
