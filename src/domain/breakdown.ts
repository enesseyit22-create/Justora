const STUDY = ['study', 'ders', 'ödev', 'homework', 'read', 'oku', 'okuma', 'learn', 'lernen', 'estudi', 'révis', 'revis', 'studia', '勉強', 'livro', 'libro', 'notes', 'not'];
const TIDY = ['clean', 'temiz', 'topla', 'tidy', 'aufräum', 'limpi', 'rang', 'puliz', '掃除', 'limpar', 'desk', 'masa', 'room', 'oda'];
const WRITE = ['write', 'yaz', 'email', 'mail', 'e-posta', 'draft', 'essay', 'schreib', 'escrib', 'écri', 'scriv', 'escrev', '書く', 'blog'];

const SETS = {
  generic: ['stepOpen', 'stepFirst', 'stepKeep', 'stepClose'],
  study: ['stepStudy1', 'stepStudy2', 'stepStudy3', 'stepStudy4'],
  tidy: ['stepTidy1', 'stepTidy2', 'stepTidy3', 'stepTidy4'],
  write: ['stepWrite1', 'stepWrite2', 'stepWrite3', 'stepWrite4'],
} as const;

export type StepTemplateKey = (typeof SETS)[keyof typeof SETS][number];

function includesAny(title: string, words: readonly string[]): boolean {
  const text = title.toLowerCase();
  return words.some((word) => text.includes(word));
}

export function stepTemplates(title: string, estimateMin: number): StepTemplateKey[] {
  const set = includesAny(title, STUDY)
    ? SETS.study
    : includesAny(title, TIDY)
      ? SETS.tidy
      : includesAny(title, WRITE)
        ? SETS.write
        : SETS.generic;
  return estimateMin >= 20 ? [...set] : set.slice(0, 3);
}
