// ============================================
// render — Construction du DOM via des
// fonctions pures (config + état → chaîne HTML).
// Une seule affectation innerHTML par zone pour
// limiter les re-flows.
// ============================================

import { unitLabel, subjectLabel } from './curriculum.js';
import { formatGrade, toPercent } from './calc.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Applique les textes statiques via data-i18n.
export function applyStaticText(lang, translations) {
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = translations[el.dataset.i18n] ?? el.textContent;
  });
}

export function buildLangButtonsHTML(langConfig, currentLang) {
  return Object.entries(langConfig)
    .map(([code, cfg]) =>
      `<button type="button" class="btn btn-lang${code === currentLang ? ' active' : ''}"
        data-lang="${code}" aria-pressed="${code === currentLang}" aria-label="${cfg.label}">
        ${cfg.label}</button>`)
    .join('');
}

export function buildSelectOptions(values, selected) {
  return values.map((label, i) =>
    `<option value="${i}"${String(i) === String(selected) ? ' selected' : ''}>${label}</option>`)
    .join('');
}

export function buildUnitsFormHTML({ curriculum, lang, translations, grades, coeffs }) {
  const rows = [];
  curriculum.forEach((unit) => {
    rows.push(`<div class="unit-title"><span>${escapeHtml(unitLabel(unit, lang))}</span></div>`);
    unit.subjects.forEach((s) => {
      rows.push(`
        <div class="subj-item">
          <label class="${lang === 'ar' ? 'ar' : ''}" for="g-${s.key}">${escapeHtml(subjectLabel(s, lang))}</label>
          <input type="number" step="0.25" min="0" max="10" id="g-${s.key}" data-grade="${s.key}"
            placeholder="${translations.notePlaceholder}" value="${escapeHtml(grades[s.key] ?? '')}"
            aria-label="${escapeHtml(subjectLabel(s, lang))} — ${translations.notePlaceholder}">
          <input type="number" step="0.5" min="0" id="c-${s.key}" data-coeff="${s.key}"
            placeholder="${translations.coeffPlaceholder}" value="${escapeHtml(coeffs[s.key] ?? '1')}"
            aria-label="${escapeHtml(subjectLabel(s, lang))} — ${translations.coeffPlaceholder}">
        </div>`);
    });
  });
  return rows.join('');
}

export function buildMobilePreviewHTML(data, form, lang, translations) {
  const { units, generalAvg } = data;

  let html = `
    <div class="mobile-card-header">
      <div style="font-weight:700; font-size:16px; margin-bottom:8px;">📋 ${escapeHtml(form.school)}</div>
      <div style="font-size:22px; font-weight:900; color:var(--gold);">${escapeHtml(form.year)}</div>
      <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:12px;">${escapeHtml(form.period)}</div>
      <div class="m-grid">
        <div class="m-info-box"><span>${translations.student}</span><strong>${escapeHtml(form.student)}</strong></div>
        <div class="m-info-box"><span>${translations.regNumber}</span><strong>${escapeHtml(form.regNum)}</strong></div>
        <div class="m-info-box"><span>${translations.class} · ${translations.classCount}</span><strong>${escapeHtml(form.klass)} — ${escapeHtml(form.count)} ${translations.pupils}</strong></div>
        <div class="m-info-box"><span>${translations.teachers}</span><strong>${escapeHtml(form.teachers)}</strong></div>
      </div>
      <div class="m-avg-box">
        <span>${translations.avgGeneral}</span>
        <strong>${formatGrade(generalAvg)} / 10</strong>
      </div>
    </div>`;

  units.forEach((u) => {
    html += `
      <div class="mobile-unit">
        <div class="m-unit-head">
          <span>${escapeHtml(u.name)}</span>
          <span style="color:var(--gold);">${formatGrade(u.avg)}</span>
        </div>`;
    u.subjects.forEach((s) => {
      html += `
        <div style="margin-bottom:6px;">
          <div class="m-subj-row">
            <span>${escapeHtml(s.label)}</span>
            <strong>${formatGrade(s.grade)}</strong>
          </div>
          <div class="m-subj-bar"><div class="m-subj-fill" style="width:${toPercent(s.grade)}%"></div></div>
        </div>`;
    });
    html += `</div>`;
  });

  return html;
}

export function buildA4SheetHTML(data, form, lang, translations) {
  const { units, generalAvg } = data;

  const tableRows = [];
  units.forEach((u) => {
    tableRows.push(
      `<tr class="a4-unit-header"><td colspan="3">${escapeHtml(u.name)}</td>` +
      `<td class="num">${formatGrade(u.avg)}</td></tr>`);
    u.subjects.forEach((s) => {
      const total = s.grade !== null ? (s.grade * s.coeff).toFixed(2) : '—';
      tableRows.push(
        `<tr><td style="padding-left:12px;">${escapeHtml(s.label)}</td>` +
        `<td>${s.coeff}</td><td>${formatGrade(s.grade)}</td>` +
        `<td class="num">${total}</td></tr>`);
    });
  });

  return `
    <div>
      <div class="a4-header">
        <div>
          <h2 style="margin:0; font-size:16px;">${escapeHtml(form.school)}</h2>
          <span style="font-size:10px;">${translations.sheetTitle}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:bold;">${escapeHtml(form.year)}</div>
          <div style="font-size:10px;">${escapeHtml(form.period)}</div>
        </div>
      </div>
      <div class="a4-grid">
        <div><b>${translations.student}:</b> ${escapeHtml(form.student)}</div>
        <div><b>${translations.class}:</b> ${escapeHtml(form.klass)}</div>
        <div><b>${translations.rank}:</b> ${escapeHtml(form.rank)}</div>
        <div><b>${translations.avgGeneral}:</b> ${formatGrade(generalAvg)}</div>
      </div>
      <table class="a4-table">
        <thead>
          <tr>
            <th>${translations.tableSubject}</th><th>${translations.coeff}</th>
            <th>${translations.tableNote}</th><th style="text-align:right;">${translations.tableTotal}</th>
          </tr>
        </thead>
        <tbody>${tableRows.join('')}</tbody>
      </table>
    </div>
    <div>
      <div class="a4-summary">
        <div><b>${translations.remark}:</b> ${escapeHtml(form.remark)}</div>
        <div><b>${translations.avgGeneral}:</b>
          <span style="font-size:14px; font-weight:bold;">${formatGrade(generalAvg)} / 10</span></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:15px; font-size:10px;">
        <div>${translations.director}: <b>${escapeHtml(form.director)}</b></div>
        <div>${translations.stamp}</div>
      </div>
    </div>`;
}
