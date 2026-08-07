// ============================================
// calc — Calculs purs (aucune dépendance DOM).
// Testable unitairement.
// ============================================

import { unitLabel, subjectLabel } from './curriculum.js';
import { getGrade, getCoeff } from './store.js';

export const NO_VALUE = '—';

export function formatGrade(value, digits = 2) {
  return value === null || value === undefined || Number.isNaN(value)
    ? NO_VALUE
    : value.toFixed(digits);
}

export function toPercent(value, max = 10) {
  return value === null ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
}

export function average(weightedSum, coeffSum) {
  return coeffSum > 0 ? weightedSum / coeffSum : null;
}

// Calcule les moyennes par unité + moyenne générale.
// `grades` et `coeffs` sont des maps key → string | number.
export function calculateData({ curriculum: units, lang, grades, coeffs }) {
  let totalWeighted = 0;
  let totalCoeff = 0;

  const unitsData = units.map((unit) => {
    let unitWeighted = 0;
    let unitCoeff = 0;

    const subjects = unit.subjects.map((s) => {
      const grade = getGrade(grades, s.key);
      const coeff = getCoeff(coeffs, s.key);
      if (grade !== null) {
        unitWeighted += grade * coeff;
        unitCoeff += coeff;
        totalWeighted += grade * coeff;
        totalCoeff += coeff;
      }
      return { label: subjectLabel(s, lang), grade, coeff };
    });

    return {
      name: unitLabel(unit, lang),
      subjects,
      avg: average(unitWeighted, unitCoeff)
    };
  });

  return { units: unitsData, generalAvg: average(totalWeighted, totalCoeff) };
}
