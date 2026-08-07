// ============================================
// curriculum — Matières et unités pédagogiques.
// Données immuables, séparées de l'interface.
// Chaque matière porte un `key` unique servant
// de point d'accroche dans le store (grades/coeffs).
// ============================================

export const curriculum = [
  { fr: "Éducation Islamique", ar: "وحدة التربية الإسلامية", subjects: [
    { ar: "القرآن الكريم", fr: "Coran", key: "isl1" },
    { ar: "العبادات", fr: "Pratiques", key: "isl2" },
    { ar: "الآداب الإسلامية", fr: "Morale", key: "isl3" },
    { ar: "العقيدة", fr: "Dogme", key: "isl4" }
  ]},
  { fr: "Langue Arabe", ar: "وحدة اللغة العربية", subjects: [
    { ar: "التعبير الشفوي", fr: "Expression Orale", key: "ar1" },
    { ar: "القراءة", fr: "Lecture", key: "ar2" },
    { ar: "التراكيب والشكل", fr: "Grammaire", key: "ar3" },
    { ar: "الصرف والتحويل", fr: "Conjugaison", key: "ar4" }
  ]},
  { fr: "Mathématiques", ar: "وحدة الرياضيات", subjects: [
    { ar: "الرياضيات", fr: "Mathématiques", key: "math1" }
  ]},
  { fr: "Langue Française", ar: "وحدة اللغة الفرنسية", subjects: [
    { fr: "Lecture", ar: "القراءة", key: "fr1" },
    { fr: "Grammaire", ar: "القواعد", key: "fr2" },
    { fr: "Conjugaison", ar: "التصريف", key: "fr3" },
    { fr: "Production Écrite", ar: "التعبير الكتابي", key: "fr4" }
  ]}
];

// Retourne l'étiquette d'une matière dans la langue demandée.
export function subjectLabel(subject, lang) {
  if (lang === 'ar') return subject.ar || subject.fr;
  return subject.fr || subject.ar;
}

// Retourne le nom d'une unité dans la langue demandée.
export function unitLabel(unit, lang) {
  if (lang === 'ar') return unit.ar || unit.fr;
  return unit.fr || unit.ar;
}

// Liste aplatie de toutes les matières (clé → sujet).
export function allSubjects() {
  const map = {};
  curriculum.forEach((unit) => unit.subjects.forEach((s) => { map[s.key] = s; }));
  return map;
}
