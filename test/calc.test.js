import { test } from 'node:test';
import assert from 'node:assert/strict';

import { curriculum, subjectLabel, unitLabel } from '../src/curriculum.js';
import { calculateData, average, formatGrade, toPercent, NO_VALUE } from '../src/calc.js';
import { getGrade, getCoeff } from '../src/store.js';
import { translateValue } from '../src/values.js';
import { i18n, getTranslations, getLangConfig, SUPPORTED_LANGS } from '../src/i18n.js';

test('calculateData: empty inputs → null averages', () => {
  const data = calculateData({ curriculum, lang: 'fr', grades: {}, coeffs: {} });
  assert.equal(data.generalAvg, null);
  assert.equal(data.units.length, curriculum.length);
  data.units.forEach((u) => {
    assert.equal(u.avg, null);
    u.subjects.forEach((s) => assert.equal(s.grade, null));
  });
});

test('calculateData: weighted average per unit and general', () => {
  const grades = { isl1: '8', isl2: '10' };
  const coeffs = { isl1: '2', isl2: '1' };
  const data = calculateData({ curriculum, lang: 'fr', grades, coeffs });

  const islam = data.units.find((u) => u.name === 'Éducation Islamique');
  // (8*2 + 10*1) / (2+1) = 26/3 ≈ 8.6667
  assert.ok(Math.abs(islam.avg - 26 / 3) < 1e-9);
  // Générale : mêmes notes/coeffs remplis → même moyenne
  assert.ok(Math.abs(data.generalAvg - 26 / 3) < 1e-9);
});

test('calculateData: localise les libellés', () => {
  const data = calculateData({ curriculum, lang: 'ar', grades: {}, coeffs: {} });
  assert.equal(data.units[0].name, 'وحدة التربية الإسلامية');
  assert.equal(data.units[0].subjects[0].label, 'القرآن الكريم');
});

test('getGrade / getCoeff', () => {
  assert.equal(getGrade({}, 'x'), null);
  assert.equal(getGrade({ x: '' }, 'x'), null);
  assert.equal(getGrade({ x: '7.5' }, 'x'), 7.5);
  assert.equal(getCoeff({}, 'x'), 1);
  assert.equal(getCoeff({ x: '3' }, 'x'), 3);
});

test('average / formatGrade / toPercent', () => {
  assert.equal(average(26, 3), 26 / 3);
  assert.equal(average(0, 0), null);
  assert.equal(formatGrade(null), NO_VALUE);
  assert.equal(formatGrade(8.66666), '8.67');
  assert.equal(toPercent(8), 80);
  assert.equal(toPercent(12, 20), 60);
  assert.equal(toPercent(null), 0);
});

test('curriculum helpers', () => {
  assert.equal(subjectLabel({ fr: 'Coran', ar: 'القرآن الكريم' }, 'fr'), 'Coran');
  assert.equal(subjectLabel({ fr: 'Coran', ar: 'القرآن الكريم' }, 'ar'), 'القرآن الكريم');
  assert.equal(unitLabel(curriculum[0], 'fr'), 'Éducation Islamique');
  assert.equal(unitLabel(curriculum[0], 'ar'), 'وحدة التربية الإسلامية');
});

test('translateValue: bidirectionnel + fallback', () => {
  assert.equal(translateValue('مدرسة ابن سينا', 'fr'), 'École Ibn Sina');
  assert.equal(translateValue('École Ibn Sina', 'ar'), 'مدرسة ابن سينا');
  assert.equal(translateValue('2ᵉ de la classe', 'ar'), 'الثاني في القسم');
  assert.equal(translateValue('الثاني في القسم', 'fr'), '2ᵉ de la classe');
  assert.equal(translateValue('Élève sérieux et travailleur', 'ar'), 'تلميذ جاد ومجتهد');
  assert.equal(translateValue('تلميذ جاد ومجتهد', 'fr'), 'Élève sérieux et travailleur');
  assert.equal(translateValue('Valeur inconnue', 'fr'), 'Valeur inconnue');
  assert.equal(translateValue('', 'fr'), '');
  assert.equal(translateValue(null, 'fr'), null);
});

test('i18n: traduction + fallback', () => {
  assert.equal(getTranslations('fr').appTitle, '📋 Générateur de Bulletin');
  assert.equal(getTranslations('ar').appTitle, '📋 مولد البطاقة المدرسية');
  assert.equal(getTranslations('zz' /* inconnue */).appTitle, i18n.fr.appTitle);
  assert.equal(getLangConfig('zz').dir, 'ltr');
  assert.ok(SUPPORTED_LANGS.includes('fr') && SUPPORTED_LANGS.includes('ar'));
});
