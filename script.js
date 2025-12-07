// --- Dáta pre náhodný výber ---
const TEMY = [
  "Čo znamená byť užitočný?","Sloboda alebo bezpečnosť?","Treba vždy poslúchať pravidlá?",
  "Kedy je ticho výrečnejšie než slová?","Čo robí dom domovom?","Ako meriame šťastie?",
  "Kedy je riziko opodstatnené?","Ako vzniká dôvera?","Potrebujeme rutinu?","Čo skrýva ticho?",
  "Čo je dôležitejšie: forma alebo obsah?","Kde končí ja a začína my?","Môžeme byť objektívni?",
  "Ako sa sny menia v čase?","Prečo potrebujeme pravidlá hry?","Kedy je mlčanie lepšie než slová?",
  "Čo je ideálny deň?","Kde je hranica zodpovednosti?","Ako chápeme krásu?","Kedy riskovať má zmysel?"
];
const OBJEKTY = [
  "Stolička","Rúra","Dáždnik","Hodiny","Šálka","Kniha","Mobil","Zrkadlo","Kľúč","Lampa",
  "Bicykel","Vankúš","Ruksak","Ceruzka","Kávovar","Rastlina","Kabát","Fľaša","Vysávač","Toster"
];

// --- Pomocné ---
const $ = (id) => document.getElementById(id);
const choice = (arr, exclude) => {
  const pool = exclude ? arr.filter(x => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};

// --- Výber zadania ---
const tema = $("tema"), objA = $("objA"), objB = $("objB");
const temaOut = $("temaOut"), objAOut = $("objAOut"), objBOut = $("objBOut");

function syncAssignment() {
  temaOut.textContent = tema.value || "—";
  objAOut.textContent = objA.value || "—";
  objBOut.textContent = objB.value || "—";
}

$("temaRnd").onclick = () => { tema.value = choice(TEMY); syncAssignment(); };
$("objARnd").onclick = () => { objA.value = choice(OBJEKTY, objB.value); syncAssignment(); };
$("objBRnd").onclick = () => { objB.value = choice(OBJEKTY, objA.value); syncAssignment(); };
[tema, objA, objB].forEach(el => el.addEventListener("input", syncAssignment));

// --- Editor dialógu ---
let who = "A"; // kto je na rade
const whoNow = $("whoNow");
const speakA = $("speakA"), speakB = $("speakB");
const line = $("line"), addLine = $("addLine"), switchBtn = $("switch");
const log = $("log"), clearAll = $("clearAll"), downloadBtn = $("download");

whoNow.textContent = who;

function setWho(n) {
  who = n;
  whoNow.textContent = who;
}
speakA.onclick = () => setWho("A");
speakB.onclick = () => setWho("B");
switchBtn.onclick = () => setWho(who === "A" ? "B" : "A");

// Uložené repliky v pamäti
const entries = []; // {speaker: 'A'|'B', text: string}

// Vloženie riadku
function pushLine() {
  const txt = line.value.trim();
  if (!txt) return;
  entries.push({ speaker: who, text: txt });
  line.value = "";
  renderLog();
  // Po pridaní sa typicky prepíname na druhého
  setWho(who === "A" ? "B" : "A");
  line.focus();
}

// vykreslenie logu
function renderLog() {
  log.innerHTML = "";
  entries.forEach((e, i) => {
    const row = document.createElement("div");
    row.className = "line";
    const badge = document.createElement("div");
    badge.className = "badge " + (e.speaker.toLowerCase());
    badge.textContent = e.speaker;
    const content = document.createElement("div");
    content.className = "content";
    content.textContent = e.text;
    row.appendChild(badge);
    row.appendChild(content);
    log.appendChild(row);
    if (i < entries.length-1) {
      const hr = document.createElement("div");
      hr.className = "hr";
      log.appendChild(hr);
    }
  });
  log.scrollTop = log.scrollHeight;
}

// ovládanie
addLine.onclick = pushLine;
line.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); pushLine();
  }
});
clearAll.onclick = () => { if (confirm("Vyčistiť celý dialóg?")) { entries.length = 0; renderLog(); } };

// stiahnuť .txt
downloadBtn.onclick = () => {
  const temaText = tema.value || "bez_temy";
  const header = `Dialóg predmetov\nTéma: ${tema.value || "—"}\nA: ${objA.value || "—"}\nB: ${objB.value || "—"}\n\n`;
  const body = entries.map(e => `${e.speaker}: ${e.text}`).join("\n");
  const blob = new Blob([header + body + "\n"], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const safe = temaText.toLowerCase().replace(/[^a-z0-9áäčďéíĺľňóôŕšťúýž_-]+/gi, "-");
  a.download = `dialog-predmetov_${safe || "zaznam"}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
};

// init: predvyplň
function init() {
  if (!tema.value) tema.value = choice(TEMY);
  if (!objA.value) objA.value = choice(OBJEKTY);
  if (!objB.value || objB.value === objA.value) objB.value = choice(OBJEKTY, objA.value);
  syncAssignment();
  renderLog();
  line.focus();
}
init();
