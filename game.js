/**
 * CONNESSIONI - Motore di Gioco Quotidiano & Calendario Reale Mese per Mese
 * Data di inizio stagione: 19/11/2026
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==================== CONFIGURAZIONE & COSTANTI ====================
  const EPOCH_YEAR = 2026;
  const EPOCH_MONTH = 10; // 0-indexed: 10 = Novembre
  const EPOCH_DAY = 19;
  const EPOCH_DATE = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY);

  const MAX_MISTAKES = 4;
  const STORAGE_KEY_GAMES = 'connessioni_games_v1';
  const STORAGE_KEY_THEME = 'connessioni_theme_v1';
  const STORAGE_KEY_HELP = 'connessioni_help_seen_v1';

  const TIER_ORDER = ['yellow', 'green', 'blue', 'purple'];
  const TIER_STYLES = {
    yellow: {
      bg: 'bg-nyt-yellow dark:bg-nyt-yellowDark',
      text: 'text-gray-900',
      emoji: '🟨',
      label: 'Giallo'
    },
    green: {
      bg: 'bg-nyt-green dark:bg-nyt-greenDark',
      text: 'text-gray-900 dark:text-white',
      emoji: '🟩',
      label: 'Verde'
    },
    blue: {
      bg: 'bg-nyt-blue dark:bg-nyt-blueDark',
      text: 'text-gray-900 dark:text-white',
      emoji: '🟦',
      label: 'Blu'
    },
    purple: {
      bg: 'bg-nyt-purple dark:bg-nyt-purpleDark',
      text: 'text-gray-900 dark:text-white',
      emoji: '🟪',
      label: 'Viola'
    }
  };

  const MONTHS_IT = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  const WEEKDAYS_SHORT_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // ==================== STATO APPLICAZIONE ====================
  let todayDate = getNormalizedToday();
  let currentPuzzleDate = new Date(todayDate);
  let viewedCalYear = todayDate.getFullYear();
  let viewedCalMonth = todayDate.getMonth();

  let currentPuzzle = null;
  let remainingWords = [];
  let selectedWords = [];
  let solvedTiers = [];
  let mistakesLeft = MAX_MISTAKES;
  let guessHistory = []; // Array di array di 4 tier (es. ['yellow', 'yellow', 'green', 'yellow'])
  let gameStatus = 'in_progress'; // 'in_progress' | 'won' | 'lost'
  let elapsedSeconds = 0;
  let stopwatchInterval = null;
  let countdownInterval = null;
  let isAnimating = false;

  // ==================== UTILITÀ DATE ====================
  function getNormalizedToday() {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Se per qualsiasi motivo l'orologio di sistema fosse precedente al 19/11/2026, usa la data di lancio
    if (d < EPOCH_DATE) {
      return new Date(EPOCH_DATE);
    }
    return d;
  }

  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function fromDateKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateIT(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  function getPuzzleNumber(date) {
    const utc1 = Date.UTC(EPOCH_DATE.getFullYear(), EPOCH_DATE.getMonth(), EPOCH_DATE.getDate());
    const utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((utc2 - utc1) / 86400000) + 1;
  }

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function isDatePlayable(date) {
    return date >= EPOCH_DATE && date <= todayDate;
  }

  // ==================== GENERATORE DETERMINISTICO ENIGMA ====================
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(array, rng) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generateDailyPuzzle(date) {
    const puzzleNum = getPuzzleNumber(date);
    // Seed univoco per data
    const baseSeed =
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let attempt = 0;

    while (attempt < 50) {
      const rng = mulberry32(baseSeed + attempt * 9973);
      const chosen = {};
      const usedWords = new Set();
      let collision = false;

      for (const tier of TIER_ORDER) {
        const pool = CATEGORIES_DATA[tier];
        const shuffledPool = seededShuffle(pool, rng);
        const validGroup = shuffledPool.find(
          (g) => !g.words.some((w) => usedWords.has(w))
        );

        if (!validGroup) {
          collision = true;
          break;
        }

        chosen[tier] = {
          tier,
          category: validGroup.category,
          words: [...validGroup.words],
          note: validGroup.note || null
        };
        validGroup.words.forEach((w) => usedWords.add(w));
      }

      if (!collision) {
        const allWords = TIER_ORDER.flatMap((t) => chosen[t].words);
        return {
          number: puzzleNum,
          dateKey: toDateKey(date),
          groups: chosen,
          initialWords: seededShuffle(allWords, rng)
        };
      }
      attempt++;
    }

    // Fallback garantito
    const fallbackGroups = {};
    TIER_ORDER.forEach((t, idx) => {
      const g = CATEGORIES_DATA[t][idx % CATEGORIES_DATA[t].length];
      fallbackGroups[t] = {
        tier: t,
        category: g.category,
        words: [...g.words],
        note: g.note || null
      };
    });
    return {
      number: puzzleNum,
      dateKey: toDateKey(date),
      groups: fallbackGroups,
      initialWords: TIER_ORDER.flatMap((t) => fallbackGroups[t].words)
    };
  }

  // ==================== STORAGE & CALCOLO STREAK REALE ====================
  function loadAllGames() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GAMES);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAllGames(games) {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
    } catch (e) {
      console.warn('Impossibile salvare su localStorage:', e);
    }
  }

  function saveCurrentGameState() {
    const games = loadAllGames();
    const key = toDateKey(currentPuzzleDate);
    games[key] = {
      dateKey: key,
      puzzleNumber: currentPuzzle.number,
      remainingWords,
      solvedTiers,
      mistakesLeft,
      guessHistory,
      status: gameStatus,
      elapsedSeconds,
      updatedAt: Date.now()
    };
    saveAllGames(games);
    updateStreakUI();
  }

  /**
   * Calcola le statistiche e le streak reali scorrendo i giorni consecutivi del calendario.
   * La streak corrente conta i giorni consecutivi vinti fino a oggi (o fino a ieri se oggi
   * non è ancora stato completato).
   */
  function calculateStatsAndStreaks() {
    const games = loadAllGames();
    let played = 0;
    let won = 0;
    let maxStreak = 0;
    let runningStreak = 0;

    // Scorre giorno per giorno dal 19/11/2026 fino a oggi per record streak e totali
    const cursor = new Date(EPOCH_DATE);
    while (cursor <= todayDate) {
      const key = toDateKey(cursor);
      const record = games[key];

      if (record && (record.status === 'won' || record.status === 'lost')) {
        played++;
        if (record.status === 'won') {
          won++;
          runningStreak++;
          if (runningStreak > maxStreak) {
            maxStreak = runningStreak;
          }
        } else {
          runningStreak = 0;
        }
      } else {
        // Se non è oggi e non è stato vinto, la serie storica si interrompe
        if (!isSameDay(cursor, todayDate)) {
          runningStreak = 0;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    // Calcolo preciso della streak attiva attuale (partendo da oggi o ieri)
    let currentStreak = 0;
    const checkDate = new Date(todayDate);
    const todayRecord = games[toDateKey(checkDate)];

    if (todayRecord && todayRecord.status === 'won') {
      // Oggi vinto: conta a ritroso da oggi
      while (checkDate >= EPOCH_DATE) {
        const rec = games[toDateKey(checkDate)];
        if (rec && rec.status === 'won') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (!todayRecord || todayRecord.status === 'in_progress') {
      // Oggi ancora in corso o non iniziato: controlla se ieri era vinto per mantenere viva la fiamma
      checkDate.setDate(checkDate.getDate() - 1);
      while (checkDate >= EPOCH_DATE) {
        const rec = games[toDateKey(checkDate)];
        if (rec && rec.status === 'won') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Oggi perso: streak azzerata
      currentStreak = 0;
    }

    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

    return {
      played,
      won,
      winRate,
      currentStreak,
      maxStreak,
      todayCompleted: Boolean(todayRecord && todayRecord.status === 'won')
    };
  }

  function updateStreakUI() {
    const stats = calculateStatsAndStreaks();
    const badge = document.getElementById('header-streak-badge');
    const flame = document.getElementById('header-streak-flame');
    const count = document.getElementById('header-streak-count');
    const archiveStreakVal = document.getElementById('archive-streak-val');

    if (count) count.textContent = stats.currentStreak;
    if (archiveStreakVal) archiveStreakVal.textContent = `${stats.currentStreak} gg`;

    if (badge && flame) {
      if (stats.currentStreak > 0) {
        badge.className =
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 transition';
        flame.className = 'fa-solid fa-fire text-orange-500 animate-pulse';
      } else {
        badge.className =
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-nyt-cardDark text-gray-500 dark:text-gray-400 transition';
        flame.className = 'fa-solid fa-fire text-gray-400';
      }
    }
  }

  // ==================== INIZIALIZZAZIONE PARTITA ====================
  function loadPuzzleForDate(date) {
    stopStopwatch();
    todayDate = getNormalizedToday();
    currentPuzzleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    currentPuzzle = generateDailyPuzzle(currentPuzzleDate);

    const games = loadAllGames();
    const saved = games[toDateKey(currentPuzzleDate)];

    selectedWords = [];
    if (saved) {
      remainingWords = saved.remainingWords || [...currentPuzzle.initialWords];
      solvedTiers = saved.solvedTiers || [];
      mistakesLeft = typeof saved.mistakesLeft === 'number' ? saved.mistakesLeft : MAX_MISTAKES;
      guessHistory = saved.guessHistory || [];
      gameStatus = saved.status || 'in_progress';
      elapsedSeconds = saved.elapsedSeconds || 0;
    } else {
      remainingWords = [...currentPuzzle.initialWords];
      solvedTiers = [];
      mistakesLeft = MAX_MISTAKES;
      guessHistory = [];
      gameStatus = 'in_progress';
      elapsedSeconds = 0;
    }

    updateHeaderBadge();
    renderSolvedCategories();
    renderGrid();
    renderMistakes();
    updateControlButtons();
    updateStopwatchDisplay();
    updateStreakUI();

    if (gameStatus === 'in_progress') {
      startStopwatch();
    } else {
      setTimeout(() => openResultModal(false), 350);
    }
  }

  function updateHeaderBadge() {
    const label = document.getElementById('puzzle-number-label');
    const backBtn = document.getElementById('btn-back-today');
    const badge = document.getElementById('puzzle-badge');
    const isToday = isSameDay(currentPuzzleDate, todayDate);

    if (label) {
      label.textContent = `${formatDateIT(currentPuzzleDate)} • Enigma #${currentPuzzle.number}`;
    }

    if (backBtn && badge) {
      if (isToday) {
        backBtn.classList.add('hidden');
        badge.className =
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      } else {
        backBtn.classList.remove('hidden');
        badge.className =
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      }
    }
  }

  // ==================== RENDERING GRIGLIA & CATEGORIE ====================
  function renderSolvedCategories() {
    const container = document.getElementById('solved-categories');
    if (!container) return;
    container.innerHTML = '';

    solvedTiers.forEach((tier) => {
      const group = currentPuzzle.groups[tier];
      const style = TIER_STYLES[tier];
      const div = document.createElement('div');
      div.className = `${style.bg} ${style.text} rounded-xl p-3 sm:p-3.5 text-center shadow-sm category-reveal`;

      let noteHtml = '';
      if (group.note && gameStatus !== 'in_progress') {
        noteHtml = `<p class="mt-1.5 pt-1.5 border-t border-black/15 text-[11px] font-medium leading-snug opacity-90"><i class="fa-solid fa-lightbulb mr-1"></i>${group.note}</p>`;
      }

      div.innerHTML = `
        <div class="font-extrabold text-xs sm:text-sm tracking-wide uppercase">${group.category}</div>
        <div class="text-xs sm:text-sm font-medium mt-0.5 tracking-wide">${group.words.join(', ')}</div>
        ${noteHtml}
      `;
      container.appendChild(div);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('grid-words');
    if (!grid) return;
    grid.innerHTML = '';

    if (remainingWords.length === 0) {
      grid.classList.add('hidden');
      return;
    }
    grid.classList.remove('hidden');

    // Adatta l'aspect-ratio della griglia in base alle righe rimaste
    const rows = Math.ceil(remainingWords.length / 4);
    grid.style.aspectRatio = `4 / ${rows}`;

    remainingWords.forEach((word) => {
      const isSelected = selectedWords.includes(word);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.word = word;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      const baseClasses =
        'rounded-xl font-extrabold uppercase flex items-center justify-center p-1.5 sm:p-2 transition-all duration-150 select-none cursor-pointer shadow-xs border card-fade';
      const stateClasses = isSelected
        ? 'bg-nyt-cardActive text-white border-nyt-cardActive scale-[0.97] shadow-inner'
        : 'bg-nyt-card dark:bg-nyt-cardDark text-gray-900 dark:text-gray-100 border-transparent hover:brightness-95 dark:hover:brightness-110';

      btn.className = `${baseClasses} ${stateClasses}`;

      const span = document.createElement('span');
      span.className = 'word-fit';
      span.textContent = word;

      // Dimensione dinamica per parole lunghe
      if (word.length >= 12) {
        span.classList.add('text-[10px]', 'sm:text-xs');
      } else if (word.length >= 9) {
        span.classList.add('text-[11px]', 'sm:text-sm');
      } else {
        span.classList.add('text-xs', 'sm:text-base');
      }

      btn.appendChild(span);
      btn.addEventListener('click', () => toggleWordSelection(word));
      grid.appendChild(btn);
    });
  }

  function renderMistakes() {
    const dotsContainer = document.getElementById('mistakes-dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    for (let i = 0; i < MAX_MISTAKES; i++) {
      const dot = document.createElement('span');
      const active = i < mistakesLeft;
      dot.className = active
        ? 'w-3 h-3 rounded-full bg-gray-800 dark:bg-gray-200 transition-all duration-300 scale-100'
        : 'w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300 scale-75 opacity-40';
      dotsContainer.appendChild(dot);
    }
  }

  function updateControlButtons() {
    const btnDeselect = document.getElementById('btn-deselect');
    const btnSubmit = document.getElementById('btn-submit');
    const btnShuffle = document.getElementById('btn-shuffle');

    const isFinished = gameStatus !== 'in_progress';
    if (btnShuffle) btnShuffle.disabled = isFinished;
    if (btnDeselect) btnDeselect.disabled = isFinished || selectedWords.length === 0;
    if (btnSubmit) btnSubmit.disabled = isFinished || selectedWords.length !== 4;
  }

  // ==================== INTERAZIONE DI GIOCO ====================
  function toggleWordSelection(word) {
    if (gameStatus !== 'in_progress' || isAnimating) return;

    const idx = selectedWords.indexOf(word);
    if (idx !== -1) {
      selectedWords.splice(idx, 1);
    } else {
      if (selectedWords.length >= 4) {
        showToast('Puoi selezionare al massimo 4 parole');
        return;
      }
      selectedWords.push(word);
    }

    renderGrid();
    updateControlButtons();
  }

  function shuffleRemainingWords() {
    if (gameStatus !== 'in_progress' || isAnimating) return;
    for (let i = remainingWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingWords[i], remainingWords[j]] = [remainingWords[j], remainingWords[i]];
    }
    renderGrid();
  }

  function deselectAll() {
    if (gameStatus !== 'in_progress' || isAnimating) return;
    selectedWords = [];
    renderGrid();
    updateControlButtons();
  }

  function getWordTier(word) {
    for (const tier of TIER_ORDER) {
      if (currentPuzzle.groups[tier].words.includes(word)) {
        return tier;
      }
    }
    return 'yellow';
  }

  async function submitGuess() {
    if (gameStatus !== 'in_progress' || selectedWords.length !== 4 || isAnimating) return;

    const guessTiers = selectedWords.map((w) => getWordTier(w));

    // Controlla se la combinazione è già stata provata
    const sortedGuessKey = [...selectedWords].sort().join('|');
    const alreadyTried = guessHistory.some(
      (entry) => entry.words && [...entry.words].sort().join('|') === sortedGuessKey
    );
    if (alreadyTried) {
      showToast('Combinazione già provata!');
      return;
    }

    guessHistory.push({
      words: [...selectedWords],
      tiers: guessTiers
    });

    isAnimating = true;
    await animateSelectedHop();

    // Conta occorrenze per tier
    const counts = {};
    guessTiers.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });

    const matchedTier = Object.keys(counts).find((t) => counts[t] === 4);

    if (matchedTier) {
      // Gruppo corretto!
      solvedTiers.push(matchedTier);
      remainingWords = remainingWords.filter((w) => !selectedWords.includes(w));
      selectedWords = [];
      isAnimating = false;

      if (solvedTiers.length === 4) {
        gameStatus = 'won';
        stopStopwatch();
        saveCurrentGameState();
        renderSolvedCategories();
        renderGrid();
        updateControlButtons();
        triggerConfetti();
        setTimeout(() => openResultModal(true), 700);
      } else {
        saveCurrentGameState();
        renderSolvedCategories();
        renderGrid();
        updateControlButtons();
      }
    } else {
      // Errore
      const isOneAway = Object.values(counts).some((c) => c === 3);
      mistakesLeft = Math.max(0, mistakesLeft - 1);
      renderMistakes();
      animateSelectedShake();

      if (mistakesLeft === 0) {
        showToast('Tentativi esauriti!');
        await sleep(650);
        // Rivela i gruppi rimanenti in ordine di difficoltà
        TIER_ORDER.forEach((t) => {
          if (!solvedTiers.includes(t)) {
            solvedTiers.push(t);
          }
        });
        remainingWords = [];
        selectedWords = [];
        gameStatus = 'lost';
        stopStopwatch();
        isAnimating = false;
        saveCurrentGameState();
        renderSolvedCategories();
        renderGrid();
        updateControlButtons();
        setTimeout(() => openResultModal(true), 850);
      } else {
        if (isOneAway) {
          showToast('Quasi! Te ne manca solo una...');
        } else {
          showToast('Nessun collegamento valido');
        }
        await sleep(450);
        isAnimating = false;
        saveCurrentGameState();
        updateControlButtons();
      }
    }
  }

  function animateSelectedHop() {
    return new Promise((resolve) => {
      const buttons = Array.from(document.querySelectorAll('#grid-words button')).filter((b) =>
        selectedWords.includes(b.dataset.word)
      );
      buttons.forEach((btn, idx) => {
        setTimeout(() => {
          btn.classList.add('tile-hop');
        }, idx * 75);
      });
      setTimeout(resolve, buttons.length * 75 + 320);
    });
  }

  function animateSelectedShake() {
    const buttons = Array.from(document.querySelectorAll('#grid-words button')).filter((b) =>
      selectedWords.includes(b.dataset.word)
    );
    buttons.forEach((btn) => {
      btn.classList.remove('shake-anim');
      void btn.offsetWidth;
      btn.classList.add('shake-anim');
    });
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // ==================== CALENDARIO REALE MESE PER MESE + STREAK ====================
  function openCalendarModal() {
    todayDate = getNormalizedToday();
    viewedCalYear = currentPuzzleDate.getFullYear();
    viewedCalMonth = currentPuzzleDate.getMonth();
    renderRealCalendar();
    openModal('modal-archive');
  }

  /**
   * Costruisce un calendario reale mese per mese (Lunedì - Domenica)
   * con navigazione tra i mesi, indicatori di stato giornaliero e connessione visiva delle streak.
   */
  function renderRealCalendar() {
    const container = document.getElementById('archive-grid');
    if (!container) return;

    const games = loadAllGames();
    const stats = calculateStatsAndStreaks();
    const archiveStreakVal = document.getElementById('archive-streak-val');
    if (archiveStreakVal) {
      archiveStreakVal.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'giorno' : 'giorni'}`;
    }

    // Calcola il numero di giorni vinti nel mese visualizzato
    const daysInMonth = new Date(viewedCalYear, viewedCalMonth + 1, 0).getDate();
    let monthWins = 0;
    let monthPlayable = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewedCalYear, viewedCalMonth, day);
      if (isDatePlayable(d)) {
        monthPlayable++;
        const rec = games[toDateKey(d)];
        if (rec && rec.status === 'won') {
          monthWins++;
        }
      }
    }

    // Verifica limiti navigazione mesi (non prima di Novembre 2026, non oltre il mese corrente)
    const canGoPrev =
      viewedCalYear > EPOCH_YEAR ||
      (viewedCalYear === EPOCH_YEAR && viewedCalMonth > EPOCH_MONTH);
    const canGoNext =
      viewedCalYear < todayDate.getFullYear() ||
      (viewedCalYear === todayDate.getFullYear() && viewedCalMonth < todayDate.getMonth());

    // Trasforma l'elenco griglia in contenitore strutturato del calendario mensile reale
    container.className = 'flex flex-col gap-2.5 overflow-y-auto pr-0.5 py-1 flex-1';
    container.innerHTML = '';

    // 1. Barra Navigazione Mese / Anno + Riepilogo Mensile
    const navBar = document.createElement('div');
    navBar.className =
      'flex items-center justify-between bg-gray-100 dark:bg-nyt-darkBg px-3 py-2 rounded-xl border border-nyt-border dark:border-nyt-borderDark';
    navBar.innerHTML = `
      <button id="cal-prev-month" type="button" aria-label="Mese precedente"
        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
          canGoPrev
            ? 'hover:bg-white dark:hover:bg-nyt-cardDark text-gray-800 dark:text-gray-100 cursor-pointer'
            : 'opacity-30 pointer-events-none text-gray-400'
        }">
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      <div class="text-center">
        <div class="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
          ${MONTHS_IT[viewedCalMonth]} ${viewedCalYear}
        </div>
        <div class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          Completati nel mese: <span class="text-emerald-600 dark:text-emerald-400 font-bold">${monthWins}/${monthPlayable}</span>
        </div>
      </div>
      <button id="cal-next-month" type="button" aria-label="Mese successivo"
        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
          canGoNext
            ? 'hover:bg-white dark:hover:bg-nyt-cardDark text-gray-800 dark:text-gray-100 cursor-pointer'
            : 'opacity-30 pointer-events-none text-gray-400'
        }">
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    `;
    container.appendChild(navBar);

    // 2. Intestazione Giorni della Settimana (Lun -> Dom)
    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'grid grid-cols-7 gap-1 text-center';
    WEEKDAYS_SHORT_IT.forEach((dayName) => {
      const cell = document.createElement('div');
      cell.className = 'text-[10px] font-extrabold uppercase tracking-wider text-gray-400 py-1';
      cell.textContent = dayName;
      weekdaysRow.appendChild(cell);
    });
    container.appendChild(weekdaysRow);

    // 3. Griglia Reale dei Giorni del Mese (7 colonne)
    const daysGrid = document.createElement('div');
    daysGrid.className = 'grid grid-cols-7 gap-1.5';

    // Calcola offset del primo giorno del mese (0 = Lunedì ... 6 = Domenica)
    const firstDayOfMonth = new Date(viewedCalYear, viewedCalMonth, 1).getDay();
    const startOffset = (firstDayOfMonth + 6) % 7;

    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'aspect-square';
      daysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewedCalYear, viewedCalMonth, day);
      const dateKey = toDateKey(cellDate);
      const isBeforeLaunch = cellDate < EPOCH_DATE;
      const isFuture = cellDate > todayDate;
      const isPlayable = !isBeforeLaunch && !isFuture;
      const isSelected = isSameDay(cellDate, currentPuzzleDate);
      const isToday = isSameDay(cellDate, todayDate);

      const record = games[dateKey];
      const status = record ? record.status : 'unplayed';

      // Controlla se fa parte di una streak attiva con il giorno precedente o successivo
      const prevDate = new Date(viewedCalYear, viewedCalMonth, day - 1);
      const nextDate = new Date(viewedCalYear, viewedCalMonth, day + 1);
      const prevWon = games[toDateKey(prevDate)]?.status === 'won';
      const nextWon = games[toDateKey(nextDate)]?.status === 'won';
      const isPartOfStreak = status === 'won' && (prevWon || nextWon);

      const cellBtn = document.createElement('button');
      cellBtn.type = 'button';

      if (!isPlayable) {
        cellBtn.disabled = true;
        cellBtn.className =
          'aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold text-gray-300 dark:text-gray-700 bg-gray-50/50 dark:bg-nyt-darkBg/40 cursor-not-allowed select-none';
        cellBtn.innerHTML = `<span>${day}</span>`;
        if (isFuture) {
          cellBtn.title = 'Enigma non ancora disponibile';
        } else {
          cellBtn.title = 'Prima dell\'avvio della stagione (19/11/2026)';
        }
      } else {
        let bgClass =
          'bg-gray-100 dark:bg-nyt-darkBg text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-400';
        let iconHtml = '<i class="fa-regular fa-circle text-[9px] text-gray-400"></i>';

        if (status === 'won') {
          bgClass =
            'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-500/60';
          iconHtml = isPartOfStreak
            ? '<i class="fa-solid fa-fire text-[10px] text-orange-500"></i>'
            : '<i class="fa-solid fa-circle-check text-[10px] text-emerald-500"></i>';
        } else if (status === 'lost') {
          bgClass =
            'bg-rose-500/15 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border-rose-500/60';
          iconHtml = '<i class="fa-solid fa-circle-xmark text-[10px] text-rose-500"></i>';
        } else if (status === 'in_progress') {
          bgClass =
            'bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/60';
          iconHtml = '<i class="fa-solid fa-clock text-[10px] text-amber-500"></i>';
        }

        const ringClass = isSelected
          ? 'ring-2 ring-black dark:ring-white ring-offset-1 dark:ring-offset-nyt-cardDark scale-[1.03]'
          : '';
        const todayDot = isToday
          ? '<span class="w-1 h-1 rounded-full bg-orange-500 absolute top-1 right-1" title="Oggi"></span>'
          : '';

        cellBtn.className = `relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer ${bgClass} ${ringClass}`;
        cellBtn.title = `${formatDateIT(cellDate)} • Enigma #${getPuzzleNumber(cellDate)}`;
        cellBtn.innerHTML = `
          ${todayDot}
          <span class="text-xs sm:text-sm font-extrabold leading-none">${day}</span>
          <span class="leading-none">${iconHtml}</span>
        `;

        cellBtn.addEventListener('click', () => {
          closeModal('modal-archive');
          loadPuzzleForDate(cellDate);
        });
      }

      daysGrid.appendChild(cellBtn);
    }

    container.appendChild(daysGrid);

    // Eventi frecce navigazione mese
    const prevBtn = document.getElementById('cal-prev-month');
    const nextBtn = document.getElementById('cal-next-month');

    if (prevBtn && canGoPrev) {
      prevBtn.addEventListener('click', () => {
        viewedCalMonth--;
        if (viewedCalMonth < 0) {
          viewedCalMonth = 11;
          viewedCalYear--;
        }
        renderRealCalendar();
      });
    }

    if (nextBtn && canGoNext) {
      nextBtn.addEventListener('click', () => {
        viewedCalMonth++;
        if (viewedCalMonth > 11) {
          viewedCalMonth = 0;
          viewedCalYear++;
        }
        renderRealCalendar();
      });
    }
  }

  function playRandomAvailablePuzzle() {
    const games = loadAllGames();
    const unplayedDates = [];
    const allPlayableDates = [];

    const cursor = new Date(EPOCH_DATE);
    while (cursor <= todayDate) {
      const copy = new Date(cursor);
      allPlayableDates.push(copy);
      const rec = games[toDateKey(copy)];
      if (!rec || rec.status === 'in_progress') {
        unplayedDates.push(copy);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const pool = unplayedDates.length > 0 ? unplayedDates : allPlayableDates;
    if (pool.length === 0) return;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    closeModal('modal-archive');
    loadPuzzleForDate(chosen);
    showToast(`Enigma #${getPuzzleNumber(chosen)} (${formatDateIT(chosen)})`);
  }

  // ==================== STATISTICHE & COMMUNITY ====================
  function getSimulatedCommunityStats(puzzleNum) {
    const rng = mulberry32(puzzleNum * 7919 + 13);
    const totalPlayers = 1240 + Math.floor(rng() * 1850);
    const winRate = 68 + Math.floor(rng() * 22);
    const perfectPct = 14 + Math.floor(rng() * 18);
    const oneMistakePct = 24 + Math.floor(rng() * 15);
    const twoMistakesPct = 20 + Math.floor(rng() * 12);
    const threeMistakesPct = Math.max(5, winRate - perfectPct - oneMistakePct - twoMistakesPct);
    const lostPct = 100 - winRate;

    const hardestIdx = rng() > 0.25 ? 3 : 2;
    const hardestTier = TIER_ORDER[hardestIdx];

    return {
      totalPlayers,
      winRate,
      hardestTier,
      distribution: [
        { label: '0 errori (Perfetto)', pct: perfectPct, color: 'bg-emerald-500' },
        { label: '1 errore', pct: oneMistakePct, color: 'bg-lime-500' },
        { label: '2 errori', pct: twoMistakesPct, color: 'bg-amber-500' },
        { label: '3 errori', pct: threeMistakesPct, color: 'bg-orange-500' },
        { label: 'Non risolto', pct: lostPct, color: 'bg-rose-500' }
      ]
    };
  }

  function openStatsModal() {
    const stats = calculateStatsAndStreaks();
    const comm = getSimulatedCommunityStats(currentPuzzle.number);

    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-win-rate').textContent = `${stats.winRate}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;

    const bigStreak = document.getElementById('stats-streak-big');
    const subStreak = document.getElementById('stats-streak-sub');
    if (bigStreak) bigStreak.textContent = `${stats.currentStreak} gg`;
    if (subStreak) {
      subStreak.textContent =
        stats.currentStreak > 0
          ? stats.todayCompleted
            ? 'Ottimo lavoro! Hai mantenuto viva la fiamma oggi.'
            : 'Completa lo schema di oggi per allungare la tua serie!'
          : 'Risolvi lo schema di oggi per iniziare una nuova serie.';
    }

    document.getElementById('stats-community-day').textContent = `Enigma #${currentPuzzle.number}`;
    document.getElementById('stats-community-players').textContent = `${comm.totalPlayers.toLocaleString('it-IT')} giocatori`;

    const barsContainer = document.getElementById('stats-community-bars');
    barsContainer.innerHTML = '';
    comm.distribution.forEach((row) => {
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2';
      div.innerHTML = `
        <span class="w-28 text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate">${row.label}</span>
        <div class="flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full ${row.color} rounded-full" style="width: ${row.pct}%"></div>
        </div>
        <span class="w-8 text-right font-mono font-bold text-[11px]">${row.pct}%</span>
      `;
      barsContainer.appendChild(div);
    });

    const hardestGroup = currentPuzzle.groups[comm.hardestTier];
    document.getElementById('stats-community-insight').innerHTML =
      `<i class="fa-solid fa-fire-flame-curved text-purple-500 mr-1"></i> Il gruppo più ostico per la community è stato <strong>${hardestGroup.category}</strong> (${TIER_STYLES[comm.hardestTier].label}).`;

    openModal('modal-stats');
  }

  // ==================== MODALE RISULTATO & CONDIVISIONE ====================
  function openResultModal() {
    const stats = calculateStatsAndStreaks();
    const comm = getSimulatedCommunityStats(currentPuzzle.number);
    const isWon = gameStatus === 'won';
    const mistakesMade = MAX_MISTAKES - mistakesLeft;

    const iconBox = document.getElementById('result-icon-container');
    const titleEl = document.getElementById('result-title');
    const subtitleEl = document.getElementById('result-subtitle');
    const commentEl = document.getElementById('result-dynamic-comment');

    if (isWon) {
      iconBox.className =
        'w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1.5 text-xl font-bold';
      iconBox.innerHTML = '<i class="fa-solid fa-trophy"></i>';
      titleEl.textContent = 'Enigma Risolto!';
      subtitleEl.textContent = `${formatDateIT(currentPuzzleDate)} • Enigma #${currentPuzzle.number} • Tempo ${formatDuration(elapsedSeconds)}`;

      const comments = [
        'Perfezione assoluta! Zero errori!',
        'Brillante! Solo un piccolo passo falso.',
        'Ottimo colpo d\'occhio!',
        'Preso per un soffio, grande tenacia!'
      ];
      commentEl.textContent = comments[Math.min(mistakesMade, 3)];
    } else {
      iconBox.className =
        'w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-1.5 text-xl font-bold';
      iconBox.innerHTML = '<i class="fa-solid fa-puzzle-piece"></i>';
      titleEl.textContent = 'Ci sei andato vicino!';
      subtitleEl.textContent = `${formatDateIT(currentPuzzleDate)} • Enigma #${currentPuzzle.number}`;
      commentEl.textContent = 'Scopri le connessioni e riprova con un altro giorno!';
    }

    document.getElementById('result-streak-value').textContent = `${stats.currentStreak} gg`;
    document.getElementById('res-community-winrate').textContent = `${comm.winRate}% risolto`;

    const resBars = document.getElementById('res-community-bars');
    resBars.innerHTML = '';
    comm.distribution.slice(0, 4).forEach((row) => {
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2';
      div.innerHTML = `
        <span class="w-24 text-gray-600 dark:text-gray-300 truncate">${row.label}</span>
        <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full ${row.color} rounded-full" style="width: ${row.pct}%"></div>
        </div>
        <span class="w-7 text-right font-mono font-bold">${row.pct}%</span>
      `;
      resBars.appendChild(div);
    });

    const hardestGroup = currentPuzzle.groups[comm.hardestTier];
    document.getElementById('res-community-hardest').innerHTML =
      `Categoria più difficile: <strong>${hardestGroup.category}</strong>`;

    // Griglia Emoji dei tentativi
    const emojiGrid = document.getElementById('result-emoji-grid');
    emojiGrid.innerHTML = guessHistory
      .map((entry) =>
        entry.tiers.map((t) => TIER_STYLES[t].emoji).join('')
      )
      .join('<br>');

    openModal('modal-result');
  }

  function shareResult() {
    const stats = calculateStatsAndStreaks();
    const rows = guessHistory
      .map((entry) => entry.tiers.map((t) => TIER_STYLES[t].emoji).join(''))
      .join('\n');

    const text = [
      `Connessioni #${currentPuzzle.number} (${formatDateIT(currentPuzzleDate)})`,
      `🔥 Streak: ${stats.currentStreak} gg`,
      '',
      rows,
      '',
      'Gioca su: https://futurewavee.github.io/connessioni/'
    ].join('\n');

    if (navigator.share) {
      navigator
        .share({
          title: `Connessioni #${currentPuzzle.number}`,
          text
        })
        .catch(() => copyToClipboard(text));
    } else {
      copyToClipboard(text);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('Risultato copiato negli appunti!'))
        .catch(() => showToast('Impossibile copiare il risultato'));
    } else {
      showToast('Risultato pronto per la condivisione');
    }
  }

  // ==================== TIMER & COUNTDOWN MEZZANOTTE ====================
  function startStopwatch() {
    stopStopwatch();
    stopwatchInterval = setInterval(() => {
      if (gameStatus === 'in_progress') {
        elapsedSeconds++;
        updateStopwatchDisplay();
        if (elapsedSeconds % 10 === 0) {
          saveCurrentGameState();
        }
      }
    }, 1000);
  }

  function stopStopwatch() {
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    }
  }

  function formatDuration(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateStopwatchDisplay() {
    const el = document.getElementById('game-stopwatch');
    if (el) {
      el.innerHTML = `<i class="fa-regular fa-clock mr-1" aria-hidden="true"></i>${formatDuration(elapsedSeconds)}`;
    }
  }

  function startMidnightCountdown() {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = Math.max(0, tomorrow - now);

      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      const formatted = `${h}:${m}:${s}`;

      const headerCountdown = document.getElementById('countdown-timer');
      const modalCountdown = document.getElementById('modal-countdown-timer');
      if (headerCountdown) headerCountdown.textContent = `Prossimo tra: ${formatted}`;
      if (modalCountdown) modalCountdown.textContent = formatted;
    };

    update();
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(update, 1000);
  }

  // ==================== TEMA, MODALI & TOAST ====================
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', '-translate-y-3');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', '-translate-y-3');
    }, 2300);
  }

  // ==================== EVENT LISTENERS ====================
  function bindEvents() {
    // Controlli griglia
    document.getElementById('btn-shuffle')?.addEventListener('click', shuffleRemainingWords);
    document.getElementById('btn-deselect')?.addEventListener('click', deselectAll);
    document.getElementById('btn-submit')?.addEventListener('click', submitGuess);

    // Header & Footer
    document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-how-to')?.addEventListener('click', () => openModal('modal-help'));
    document.getElementById('btn-archive')?.addEventListener('click', openCalendarModal);
    document.getElementById('btn-footer-archive')?.addEventListener('click', openCalendarModal);
    document.getElementById('header-streak-badge')?.addEventListener('click', openCalendarModal);
    document.getElementById('btn-stats')?.addEventListener('click', openStatsModal);
    document.getElementById('btn-back-today')?.addEventListener('click', () => {
      loadPuzzleForDate(getNormalizedToday());
    });

    // Modale Calendario
    document.getElementById('btn-close-archive')?.addEventListener('click', () => closeModal('modal-archive'));
    document.getElementById('btn-random-puzzle')?.addEventListener('click', playRandomAvailablePuzzle);

    // Modale Statistiche
    document.getElementById('btn-close-stats')?.addEventListener('click', () => closeModal('modal-stats'));
    document.getElementById('btn-confirm-stats')?.addEventListener('click', () => closeModal('modal-stats'));

    // Modale Regole
    const closeHelp = () => {
      localStorage.setItem(STORAGE_KEY_HELP, '1');
      closeModal('modal-help');
    };
    document.getElementById('btn-close-help')?.addEventListener('click', closeHelp);
    document.getElementById('btn-confirm-help')?.addEventListener('click', closeHelp);

    // Modale Risultato
    document.getElementById('btn-close-result')?.addEventListener('click', () => closeModal('modal-result'));
    document.getElementById('btn-share')?.addEventListener('click', shareResult);
    document.getElementById('btn-play-next-archive')?.addEventListener('click', () => {
      closeModal('modal-result');
      openCalendarModal();
    });

    // Chiusura modali cliccando sullo sfondo
    ['modal-archive', 'modal-stats', 'modal-help', 'modal-result'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        if (e.target.id === id) {
          closeModal(id);
        }
      });
    });

    // Scorciatoie da tastiera
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['modal-archive', 'modal-stats', 'modal-help', 'modal-result'].forEach(closeModal);
      } else if (e.key === 'Enter' && gameStatus === 'in_progress' && selectedWords.length === 4) {
        submitGuess();
      }
    });
  }

  // ==================== AVVIO ====================
  initTheme();
  bindEvents();
  startMidnightCountdown();
  loadPuzzleForDate(todayDate);

  if (!localStorage.getItem(STORAGE_KEY_HELP)) {
    openModal('modal-help');
  }
});
