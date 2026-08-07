// ============================================
// values — Traduction bidirectionnelle des
// VALEURS saisies (écoles, élèves, directeurs).
// Dictionnaire extensible, sans toucher au code.
// ============================================

const dict = {
  // ===== VALEURS PAR DÉFAUT (pré-remplies) =====
  // Écoles
  "مدرسة ابن سينا": "École Ibn Sina",
  "مدرسة خالد بن الوليد": "École Khalid Ibn Al-Walid",
  // Élèves
  "أحمد بن محمد": "Ahmed Ben Mohamed",
  "كمال الدرقاوي": "Kamal Ad-Darqawi",
  // Directeurs
  "عبد الله الناصري": "Abdellah An-Naciri",
  "محمد محي الدين": "Mohammed Mouhi Ad-Dine",
  // Professeurs
  "المرابط · الفاسي": "Al-Morabit · Al-Fassi",
  // Rang / Remarque
  "الثاني في القسم": "2ᵉ de la classe",
  "تلميذ جاد ومجتهد": "Élève sérieux et travailleur"
  // ===== AJOUTEZ ICI LES NOUVELLES TRADUCTIONS =====
  // (le système utilisera automatiquement les valeurs saisies)
};

const reverse = {};
for (const [ar, fr] of Object.entries(dict)) {
  reverse[fr.trim()] = ar;
}

export function translateValue(value, lang) {
  if (!value) return value;
  const trimmed = value.trim();
  if (lang === 'ar') return reverse[trimmed] || trimmed;
  return dict[trimmed] || trimmed;
}

export function addTranslation(arText, frText) {
  if (arText && frText && arText.trim() !== '' && frText.trim() !== '') {
    dict[arText.trim()] = frText.trim();
    reverse[frText.trim()] = arText.trim();
  }
}
