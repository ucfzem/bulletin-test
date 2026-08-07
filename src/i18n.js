// ============================================
// i18n — Chaînes d'interface + configuration
// des langues. Séparé du curriculum (matières).
// Pour ajouter une langue : déclarer ici un
// bloc, ajouter `curriculum` (src/curriculum.js)
// et éventuellement les valeurs (src/values.js).
// Aucun changement de code nécessaire.
// ============================================

export const i18n = {
  fr: {
    appTitle: "📋 Générateur de Bulletin",
    appSub: "UCF ZEM · Version Mobile",
    generalInfo: "🏫 Informations Générales",
    notesCoeff: "📊 Notes & Coefficients",
    appreciation: "✍️ Appréciation",
    school: "École",
    schoolYear: "Année Scolaire",
    student: "Élève",
    class: "Classe",
    regNumber: "N° Inscription",
    semester: "Période",
    rank: "Rang",
    director: "Directeur",
    remark: "Remarque",
    coeff: "Coeff.",
    notePlaceholder: "Note /10",
    coeffPlaceholder: "Coeff.",
    avgGeneral: "Moyenne Générale",
    autoFill: "✨ Remplir",
    preview: "Afficher l'Aperçu Mobile →",
    edit: "← Éditer",
    print: "🖨️ Imprimer",
    exportPDF: "📄 PDF A4",
    exporting: "⏳ Export...",
    semesters: ["SEMESTRE 1", "SEMESTRE 2"],
    grades: ["1ère Année", "2ème Année", "3ème Année", "4ème Année", "5ème Année", "6ème Année"],
    sheetTitle: "Bulletin Scolaire",
    tableSubject: "Matière",
    tableNote: "Note",
    tableTotal: "Total",
    stamp: "Cachet de l'établissement"
  },
  ar: {
    appTitle: "📋 مولد البطاقة المدرسية",
    appSub: "UCF ZEM · نسخة الجوال",
    generalInfo: "🏫 معلومات عامة",
    notesCoeff: "📊 النقط والمعاملات",
    appreciation: "✍️ التقدير",
    school: "المؤسسة",
    schoolYear: "السنة الدراسية",
    student: "التلميذ",
    class: "القسم",
    regNumber: "رقم التسجيل",
    semester: "الدورة",
    rank: "الرتبة",
    director: "المدير",
    remark: "ملاحظة",
    coeff: "المعامل",
    notePlaceholder: "النقطة /10",
    coeffPlaceholder: "المعامل",
    avgGeneral: "المعدل العام",
    autoFill: "✨ تعبئة تلقائية",
    preview: "عرض المعاينة ←",
    edit: "← تعديل",
    print: "🖨️ طباعة",
    exportPDF: "📄 PDF A4",
    exporting: "⏳ جاري التصدير...",
    semesters: ["الدورة 1", "الدورة 2"],
    grades: ["السنة 1", "السنة 2", "السنة 3", "السنة 4", "السنة 5", "السنة 6"],
    sheetTitle: "البطاقة المدرسية",
    tableSubject: "المادة",
    tableNote: "النقطة",
    tableTotal: "المجموع",
    stamp: "خاتم المؤسسة"
  }
};

// Registre des langues : génère automatiquement
// les boutons de bascule et configure direction
// (LTR/RTL) et police. Ajouter une langue = un
// bloc ici + un bloc dans i18n + données curriculum.
export const langConfig = {
  fr: { dir: 'ltr', label: '🇫🇷 FR', isRtl: false },
  ar: { dir: 'rtl', label: '🇲🇦 AR', isRtl: true }
};

export const SUPPORTED_LANGS = Object.keys(langConfig);

export function getTranslations(lang) {
  return i18n[lang] || i18n.fr;
}

export function getLangConfig(lang) {
  return langConfig[lang] || langConfig.fr;
}
