import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const langs = ['en', 'tr', 'de', 'es', 'fr', 'pt-BR', 'it', 'ja'];
const files = {
  en: join(root, 'src/i18n/strings.ts'),
  tr: join(root, 'src/i18n/strings.ts'),
  de: join(root, 'src/i18n/locales/de.ts'),
  es: join(root, 'src/i18n/locales/es.ts'),
  fr: join(root, 'src/i18n/locales/fr.ts'),
  'pt-BR': join(root, 'src/i18n/locales/pt-BR.ts'),
  it: join(root, 'src/i18n/locales/it.ts'),
  ja: join(root, 'src/i18n/locales/ja.ts'),
};

function sliceLocale(file, lang) {
  const text = readFileSync(file, 'utf8');
  if (lang === 'en') return text.split('export const tr')[0];
  if (lang === 'tr') return text.split('export const tr')[1];
  return text;
}

function grab(block, key) {
  const token = `${key}:`;
  const at = block.indexOf(token);
  if (at < 0) throw new Error(`missing ${key}`);
  const start = block.indexOf("'", at);
  let i = start + 1;
  let out = '';
  while (i < block.length) {
    const ch = block[i];
    if (ch === '\\') {
      const next = block[i + 1];
      out += next === 'n' ? '\n' : next === "'" ? "'" : next;
      i += 2;
      continue;
    }
    if (ch === "'") break;
    out += ch;
    i += 1;
  }
  return out;
}

const extra = {
  en: {
    navHome: 'Home',
    navPrivacy: 'Privacy',
    navTerms: 'Terms',
    navSupport: 'Support',
    hero: 'Two minutes is enough to begin.',
    lead: 'Justora is a focus timer for the task you have been putting off. A circle shrinks so you can see the time. Stopping has no penalty. There is no account and no ads. Your list stays on the phone.',
    supportTitle: 'Support',
    supportLead: 'Write to us and we will reply.',
    supportBody: 'Justora does not treat or diagnose any condition. There is no account to delete. Uninstalling the app removes the list, timers, and settings from the phone.\n\nSubscriptions, if you buy Pro, are managed by Apple or Google Play. Cancel there at least 24 hours before a renewal.',
    updated: 'Last updated 10 November 2026.',
  },
  tr: {
    navHome: 'Ana sayfa',
    navPrivacy: 'Gizlilik',
    navTerms: 'Koşullar',
    navSupport: 'Destek',
    hero: 'Başlamak için 2 dakika yeter.',
    lead: 'Justora, ertelediğin işe iki dakikayla başlaman için bir odak zamanlayıcısıdır. Daire küçülür, süre görünür. Durunca ceza yoktur. Hesap yok, reklam yok. Listen telefonda kalır.',
    supportTitle: 'Destek',
    supportLead: 'Yaz, yanıtlayalım.',
    supportBody: 'Justora hiçbir durumu tedavi etmez veya teşhis koymaz. Silinecek bir hesap yoktur. Uygulamayı kaldırmak listeyi, süreleri ve ayarları telefondan siler.\n\nPro aldıysan aboneliği Apple veya Google Play yönetir. Yenilemeden en az 24 saat önce oradan iptal edebilirsin.',
    updated: 'Son güncelleme: 10 Kasım 2026.',
  },
  de: {
    navHome: 'Start',
    navPrivacy: 'Datenschutz',
    navTerms: 'Nutzung',
    navSupport: 'Hilfe',
    hero: 'Zwei Minuten reichen zum Anfang.',
    lead: 'Justora ist ein Fokus-Timer für die Aufgabe, die du aufschiebst. Ein Kreis wird kleiner, die Zeit ist sichtbar. Aufhören hat keine Strafe. Kein Konto, keine Werbung. Die Liste bleibt auf dem Telefon.',
    supportTitle: 'Hilfe',
    supportLead: 'Schreib uns. Wir antworten.',
    supportBody: 'Justora behandelt nicht und stellt keine Diagnose. Es gibt kein Konto zum Löschen. Beim Deinstallieren verschwinden Liste, Timer und Einstellungen vom Telefon.\n\nPro, falls du es kaufst, verwalten Apple oder Google Play. Kündige dort mindestens 24 Stunden vor der Verlängerung.',
    updated: 'Stand: 10. November 2026.',
  },
  es: {
    navHome: 'Inicio',
    navPrivacy: 'Privacidad',
    navTerms: 'Términos',
    navSupport: 'Ayuda',
    hero: 'Dos minutos bastan para empezar.',
    lead: 'Justora es un temporizador de foco para la tarea que vienes posponiendo. Un círculo se encoge y el tiempo se ve. Parar no tiene castigo. No hay cuenta ni anuncios. La lista se queda en el teléfono.',
    supportTitle: 'Ayuda',
    supportLead: 'Escríbenos y te respondemos.',
    supportBody: 'Justora no trata ni diagnostica ninguna condición. No hay una cuenta que borrar. Al desinstalar, la lista, los tiempos y los ajustes salen del teléfono.\n\nSi compras Pro, Apple o Google Play gestionan la suscripción. Cancélala allí al menos 24 horas antes de la renovación.',
    updated: 'Actualizado el 10 de noviembre de 2026.',
  },
  fr: {
    navHome: 'Accueil',
    navPrivacy: 'Confidentialité',
    navTerms: 'Conditions',
    navSupport: 'Aide',
    hero: 'Deux minutes suffisent pour commencer.',
    lead: 'Justora est un minuteur de focus pour la tâche que tu repousses. Un cercle rétrécit, le temps se voit. S’arrêter n’a pas de pénalité. Pas de compte, pas de pub. La liste reste sur le téléphone.',
    supportTitle: 'Aide',
    supportLead: 'Écris-nous. Nous répondons.',
    supportBody: 'Justora ne soigne pas et ne pose pas de diagnostic. Il n’y a pas de compte à supprimer. Désinstaller retire la liste, les durées et les réglages du téléphone.\n\nSi tu prends Pro, Apple ou Google Play gère l’abonnement. Annule là-bas au moins 24 heures avant le renouvellement.',
    updated: 'Mis à jour le 10 novembre 2026.',
  },
  'pt-BR': {
    navHome: 'Início',
    navPrivacy: 'Privacidade',
    navTerms: 'Termos',
    navSupport: 'Ajuda',
    hero: 'Dois minutos bastam para começar.',
    lead: 'Justora é um timer de foco para a tarefa que você vem adiando. Um círculo encolhe e o tempo fica visível. Parar não tem punição. Sem conta e sem anúncios. A lista fica no telefone.',
    supportTitle: 'Ajuda',
    supportLead: 'Escreva para a gente. Vamos responder.',
    supportBody: 'O Justora não trata e não diagnostica nenhuma condição. Não há conta para apagar. Desinstalar tira a lista, os tempos e os ajustes do telefone.\n\nSe você comprar o Pro, a Apple ou o Google Play cuida da assinatura. Cancele lá pelo menos 24 horas antes da renovação.',
    updated: 'Atualizado em 10 de novembro de 2026.',
  },
  it: {
    navHome: 'Home',
    navPrivacy: 'Privacy',
    navTerms: 'Termini',
    navSupport: 'Aiuto',
    hero: 'Due minuti bastano per iniziare.',
    lead: 'Justora è un timer di focus per il compito che stai rimandando. Un cerchio si riduce e il tempo si vede. Fermarsi non ha una penalità. Nessun account e nessuna pubblicità. La lista resta sul telefono.',
    supportTitle: 'Aiuto',
    supportLead: 'Scrivici. Ti rispondiamo.',
    supportBody: 'Justora non cura e non fa diagnosi. Non c’è un account da cancellare. Disinstallare toglie lista, tempi e impostazioni dal telefono.\n\nSe compri Pro, Apple o Google Play gestisce l’abbonamento. Annullalo lì almeno 24 ore prima del rinnovo.',
    updated: 'Aggiornato il 10 novembre 2026.',
  },
  ja: {
    navHome: 'ホーム',
    navPrivacy: 'プライバシー',
    navTerms: '利用規約',
    navSupport: 'サポート',
    hero: '始めるなら2分でいい。',
    lead: 'Justoraは、後回しにしている作業を2分で始めるための集中タイマーです。円が小さくなるので時間がわかります。止めても罰はありません。アカウントも広告もありません。リストは電話の中に残ります。',
    supportTitle: 'サポート',
    supportLead: 'メールをください。返信します。',
    supportBody: 'Justoraは治療も診断もしません。削除するアカウントはありません。アプリを消すと、リストとタイマーと設定も電話から消えます。\n\nProを購入した場合、サブスクリプションはAppleまたはGoogle Playが管理します。更新の24時間前までに、そちらで解約できます。',
    updated: '最終更新: 2026年11月10日。',
  },
};

const copy = {};
for (const lang of langs) {
  const block = sliceLocale(files[lang], lang);
  copy[lang] = {
    ...extra[lang],
    privacyTitle: grab(block, 'legalPrivacyTitle'),
    termsTitle: grab(block, 'legalTermsTitle'),
    privacyBody: grab(block, 'legalPrivacyBody'),
    termsBody: grab(block, 'legalTermsBody'),
    privacyStores: grab(block, 'privacyStores'),
  };
}

const css = `*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:Nunito,ui-rounded,system-ui,sans-serif;background:#F6F1EA;color:#2C2825;line-height:1.5}
a{color:#E15D32;text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:720px;margin:0 auto;padding:28px 20px 64px}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-weight:800;font-size:22px;letter-spacing:-0.03em}
.nav{display:flex;gap:14px;flex-wrap:wrap;font-weight:700}
.langs{display:flex;flex-wrap:wrap;gap:6px;margin:18px 0}
.langs button{border:0;background:#fff;color:#2C2825;border-radius:999px;padding:6px 10px;font:700 13px Nunito,sans-serif;cursor:pointer}
.langs button[aria-pressed="true"]{background:#E15D32;color:#fff}
.card{background:#fff;border-radius:24px;padding:22px 20px;box-shadow:0 10px 30px rgba(107,83,70,.08);margin-top:16px}
h1{font-size:34px;line-height:1.15;margin:8px 0 10px;letter-spacing:-0.03em}
h2{font-size:18px;margin:0 0 8px}
p{margin:0 0 12px}
.muted{color:#8D8178}
.mail{display:inline-block;margin-top:8px;font-weight:800}
@media (max-width:480px){h1{font-size:28px}.wrap{padding:20px 16px 48px}}
`;

const runtime = `const COPY = ${JSON.stringify(copy)};
const LANGS = ${JSON.stringify(langs)};
const PAGE = document.body.dataset.page;
function pick(){
  const q = new URLSearchParams(location.search).get('lang');
  const saved = localStorage.getItem('justora-docs-lang');
  const nav = (navigator.language || 'en').toLowerCase();
  const fromNav = LANGS.find((code) => nav === code.toLowerCase() || nav.startsWith(code.toLowerCase().slice(0,2)));
  return LANGS.includes(q) ? q : LANGS.includes(saved) ? saved : fromNav || 'en';
}
function render(lang){
  const t = COPY[lang];
  localStorage.setItem('justora-docs-lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-k]').forEach((node) => {
    const key = node.dataset.k;
    node.textContent = t[key] || '';
  });
  document.querySelectorAll('[data-paras]').forEach((node) => {
    const text = t[node.dataset.paras] || '';
    node.replaceChildren(...text.split('\\n\\n').filter(Boolean).map((part) => {
      const p = document.createElement('p');
      p.textContent = part;
      return p;
    }));
  });
  document.querySelectorAll('.langs button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.lang === lang ? 'true' : 'false');
  });
  const titles = { home: 'Justora', privacy: t.privacyTitle, terms: t.termsTitle, support: t.supportTitle };
  document.title = PAGE === 'home' ? 'Justora' : titles[PAGE] + ' · Justora';
}
const bar = document.querySelector('.langs');
for (const code of LANGS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.lang = code;
  button.textContent = code;
  button.addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('lang', code);
    history.replaceState(null, '', url);
    render(code);
  });
  bar.append(button);
}
render(pick());
`;

function page(name, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Justora</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body data-page="${name}">
<div class="wrap">
  <div class="top">
    <a class="brand" href="index.html">Justora</a>
    <nav class="nav">
      <a href="index.html" data-k="navHome"></a>
      <a href="privacy.html" data-k="navPrivacy"></a>
      <a href="terms.html" data-k="navTerms"></a>
      <a href="support.html" data-k="navSupport"></a>
    </nav>
  </div>
  <div class="langs" aria-label="Language"></div>
  ${body}
</div>
<script src="site.js"></script>
</body>
</html>
`;
}

const docs = join(root, 'docs');
mkdirSync(docs, { recursive: true });
writeFileSync(join(docs, 'styles.css'), css);
writeFileSync(join(docs, 'site.js'), runtime);
writeFileSync(join(docs, 'index.html'), page('home', `<section class="card"><h1 data-k="hero"></h1><p data-k="lead"></p><a class="mail" href="mailto:fishmapss@gmail.com">fishmapss@gmail.com</a></section>`));
writeFileSync(join(docs, 'privacy.html'), page('privacy', `<section class="card"><h1 data-k="privacyTitle"></h1><div data-paras="privacyBody"></div><p data-k="privacyStores"></p><p class="muted" data-k="updated"></p><a class="mail" href="mailto:fishmapss@gmail.com">fishmapss@gmail.com</a></section>`));
writeFileSync(join(docs, 'terms.html'), page('terms', `<section class="card"><h1 data-k="termsTitle"></h1><div data-paras="termsBody"></div><p class="muted" data-k="updated"></p><a class="mail" href="mailto:fishmapss@gmail.com">fishmapss@gmail.com</a></section>`));
writeFileSync(join(docs, 'support.html'), page('support', `<section class="card"><h1 data-k="supportTitle"></h1><p data-k="supportLead"></p><div data-paras="supportBody"></div><a class="mail" href="mailto:fishmapss@gmail.com">fishmapss@gmail.com</a></section>`));
console.log('docs written', langs.length);
