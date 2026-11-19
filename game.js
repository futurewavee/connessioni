/**
 * CONNESSIONI - Hub Giochi Quotidiani (LEGAMI & INTRUSO)
 * - Schermata iniziale minimale senza barra superiore
 * - Modalità LEGAMI: associazioni quotidiane + calendario reale mese per mese + streak
 * - Modalità INTRUSO: sfida blitz 60s in arancione (4 parole della categoria + 1 intruso)
 * - Effetti sonori minimali sintetizzati con Web Audio API (con tasto mute)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==================== CONFIGURAZIONE & COSTANTI ====================
  const EPOCH_YEAR = 2026;
  const EPOCH_MONTH = 10; // 0-indexed: 10 = Novembre
  const EPOCH_DAY = 19;
  const EPOCH_DATE = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY);

  const MAX_MISTAKES = 4;
  const INTRUSO_DURATION = 60;
  const INTRUSO_PENALTY = 3;

  const STORAGE_KEY_GAMES = 'connessioni_games_v1';
  const STORAGE_KEY_THEME = 'connessioni_theme_v1';
  const STORAGE_KEY_SOUND = 'connessioni_sound_v1';
  const STORAGE_KEY_HELP_LEGAMI = 'connessioni_help_legami_v1';
  const STORAGE_KEY_INTRUSO_BEST = 'connessioni_intruso_best_v1';

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

  // ==================== VERIFICA DATABASE ====================
  function getCategoriesPool() {
    if (typeof CATEGORIES_DATA !== 'undefined' && CATEGORIES_DATA) {
      return CATEGORIES_DATA;
    }
    if (typeof window !== 'undefined' && window.CATEGORIES_DATA) {
      return window.CATEGORIES_DATA;
    }
    return null;
  }

  // ==================== STATO GLOBALE & NAVIGAZIONE ====================
  let activeMode = 'home'; // 'home' | 'legami' | 'intruso'
  let soundEnabled = localStorage.getItem(STORAGE_KEY_SOUND) !== 'muted';
  let audioCtx = null;

  // Stato LEGAMI
  let todayDate = getNormalizedToday();
  let currentPuzzleDate = new Date(todayDate);
  let viewedCalYear = todayDate.getFullYear();
  let viewedCalMonth = todayDate.getMonth();

  let currentPuzzle = null;
  let remainingWords = [];
  let selectedWords = [];
  let solvedTiers = [];
  let mistakesLeft = MAX_MISTAKES;
  let guessHistory = [];
  let gameStatus = 'in_progress'; // 'in_progress' | 'won' | 'lost'
  let elapsedSeconds = 0;
  let stopwatchInterval = null;
  let countdownInterval = null;
  let isAnimating = false;

  // Stato INTRUSO
  let intrusoState = 'idle'; // 'idle' | 'playing' | 'gameover'
  let intrusoTimeLeft = INTRUSO_DURATION;
  let intrusoScore = 0;
  let intrusoBest = parseInt(localStorage.getItem(STORAGE_KEY_INTRUSO_BEST) || '0', 10);
  let intrusoTimerInterval = null;
  let intrusoCurrentRound = null;
  let intrusoLocked = false;

  // ==================== MOTORE EFFETTI SONORI MINIMALI (WEB AUDIO API) ====================
  function ensureAudioContext() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone({ freq = 440, endFreq = null, type = 'sine', duration = 0.09, volume = 0.08, delay = 0 }) {
    if (!soundEnabled) return;
    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (err) {
      // Ignora eventuali restrizioni autoplay del browser
    }
  }

  const SoundFX = {
    select() {
      playTone({ freq: 520, endFreq: 640, type: 'sine', duration: 0.065, volume: 0.07 });
    },
    deselect() {
      playTone({ freq: 440, endFreq: 340, type: 'sine', duration: 0.06, volume: 0.06 });
    },
    shuffle() {
      playTone({ freq: 320, endFreq: 480, type: 'triangle', duration: 0.07, volume: 0.05 });
      playTone({ freq: 420, endFreq: 560, type: 'triangle', duration: 0.07, volume: 0.05, delay: 0.05 });
    },
    groupSolved() {
      playTone({ freq: 523.25, type: 'sine', duration: 0.14, volume: 0.08, delay: 0 });
      playTone({ freq: 659.25, type: 'sine', duration: 0.14, volume: 0.08, delay: 0.08 });
      playTone({ freq: 783.99, type: 'sine', duration: 0.22, volume: 0.09, delay: 0.16 });
    },
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        playTone({ freq: n, type: 'triangle', duration: 0.22, volume: 0.09, delay: idx * 0.09 });
      });
    },
    error() {
      playTone({ freq: 185, endFreq: 135, type: 'sawtooth', duration: 0.14, volume: 0.06, delay: 0 });
      playTone({ freq: 155, endFreq: 115, type: 'sawtooth', duration: 0.16, volume: 0.06, delay: 0.11 });
    },
    tick() {
      playTone({ freq: 880, type: 'sine', duration: 0.04, volume: 0.04 });
    }
  };

  function updateSoundUI() {
    document.querySelectorAll('[data-sound-icon]').forEach((icon) => {
      icon.className = soundEnabled
        ? 'fa-solid fa-volume-high text-base'
        : 'fa-solid fa-volume-xmark text-base text-gray-400';
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled ? 'on' : 'muted');
    updateSoundUI();
    if (soundEnabled) {
      SoundFX.select();
      showToast('Effetti sonori attivati');
    } else {
      showToast('Audio disattivato');
    }
  }

  // ==================== GESTIONE SCHERMATE (HOME / LEGAMI / INTRUSO) ====================
  function switchScreen(mode) {
    activeMode = mode;
    stopStopwatch();
    stopIntrusoTimer();

    const homeScreen = document.getElementById('home-screen');
    const gameHeader = document.getElementById('game-header');
    const gameFooter = document.getElementById('game-footer');
    const viewLegami = document.getElementById('view-legami');
    const viewIntruso = document.getElementById('view-intruso');

    const logoLegami = document.getElementById('logo-legami');
    const logoIntruso = document.getElementById('logo-intruso');
    const btnArchive = document.getElementById('btn-archive');
    const btnStats = document.getElementById('btn-stats');
    const headerStreak = document.getElementById('header-streak-badge');
    const headerIntruso = document.getElementById('header-intruso-badge');
    const footerArchive = document.getElementById('btn-footer-archive');
    const footerSep = document.getElementById('footer-sep');

    if (mode === 'home') {
      homeScreen.classList.remove('hidden');
      gameHeader.classList.add('hidden');
      gameFooter.classList.add('hidden');
      viewLegami.classList.add('hidden');
      viewIntruso.classList.add('hidden');
      updateHomeBadges();
      return;
    }

    const db = getCategoriesPool();
    if (!db) {
      showToast('Errore: file data.js non caricato correttamente');
      return;
    }

    homeScreen.classList.add('hidden');
    gameHeader.classList.remove('hidden');
    gameFooter.classList.remove('hidden');

    if (mode === 'legami') {
      viewLegami.classList.remove('hidden');
      viewIntruso.classList.add('hidden');

      logoLegami.classList.remove('hidden');
      logoIntruso.classList.add('hidden');

      btnArchive.classList.remove('hidden');
      btnStats.classList.remove('hidden');
      headerStreak.classList.remove('hidden');
      headerIntruso.classList.add('hidden');
      footerArchive.classList.remove('hidden');
      footerSep.classList.remove('hidden');

      loadPuzzleForDate(currentPuzzleDate);
      if (!localStorage.getItem(STORAGE_KEY_HELP_LEGAMI)) {
        openHelpModal();
      }
    } else if (mode === 'intruso') {
      viewLegami.classList.add('hidden');
      viewIntruso.classList.remove('hidden');

      logoLegami.classList.add('hidden');
      logoIntruso.classList.remove('hidden');

      btnArchive.classList.add('hidden');
      btnStats.classList.add('hidden');
      headerStreak.classList.add('hidden');
      headerIntruso.classList.remove('hidden');
      footerArchive.classList.add('hidden');
      footerSep.classList.add('hidden');

      resetIntrusoToStart();
    }
  }

  function updateHomeBadges() {
    const stats = calculateStatsAndStreaks();
    const homeStreak = document.getElementById('home-streak-val');
    const homeBest = document.getElementById('home-intruso-best');
    if (homeStreak) homeStreak.textContent = stats.currentStreak;
    if (homeBest) homeBest.textContent = intrusoBest; document.querySelectorAll('[data-sync-intruso-best]').forEach(el => el.textContent = intrusoBest);
  }

  // ==================== UTILITÀ DATE ====================
  function getNormalizedToday() {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

  // ==================== GENERATORE DETERMINISTICO LEGAMI ====================
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
    const db = getCategoriesPool();
    const puzzleNum = getPuzzleNumber(date);
    const baseSeed =
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let attempt = 0;

    while (attempt < 50) {
      const rng = mulberry32(baseSeed + attempt * 9973);
      const chosen = {};
      const usedWords = new Set();
      let collision = false;

      for (const tier of TIER_ORDER) {
        const pool = db[tier];
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

    const fallbackGroups = {};
    TIER_ORDER.forEach((t, idx) => {
      const g = db[t][idx % db[t].length];
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

  function calculateStatsAndStreaks() {
    const games = loadAllGames();
    let played = 0;
    let won = 0;
    let maxStreak = 0;
    let runningStreak = 0;

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
        if (!isSameDay(cursor, todayDate)) {
          runningStreak = 0;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    let currentStreak = 0;
    const checkDate = new Date(todayDate);
    const todayRecord = games[toDateKey(checkDate)];

    if (todayRecord && todayRecord.status === 'won') {
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
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-extrabold border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 transition';
        flame.className = 'fa-solid fa-fire text-orange-500 animate-pulse';
      } else {
        badge.className =
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-extrabold border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-nyt-cardDark text-gray-500 dark:text-gray-400 transition';
        flame.className = 'fa-solid fa-fire text-gray-400';
      }
    }
    updateHomeBadges();
  }

  // ==================== INIZIALIZZAZIONE PARTITA LEGAMI ====================
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
    renderGrid(true);
    renderMistakes();
    updateControlButtons();
    updateStopwatchDisplay();
    updateStreakUI();

    if (gameStatus === 'in_progress') {
      startStopwatch();
    } else if (activeMode === 'legami') {
      setTimeout(() => openResultModal(), 350);
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

  // ==================== RENDERING GRIGLIA & CATEGORIE LEGAMI ====================
  function renderSolvedCategories() {
    const container = document.getElementById('solved-categories');
    if (!container) return;
    container.innerHTML = '';

    solvedTiers.forEach((tier) => {
      const group = currentPuzzle.groups[tier];
      const style = TIER_STYLES[tier];
      const div = document.createElement('div');
      div.className = `${style.bg} ${style.text} border-2 border-[#161412] shadow-[3px_3px_0px_#161412] rounded-xl p-3 sm:p-3.5 text-center category-reveal`;

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

  function renderGrid(withStagger = false) {
    const grid = document.getElementById('grid-words');
    if (!grid) return;
    grid.innerHTML = '';

    if (remainingWords.length === 0) {
      grid.classList.add('hidden');
      return;
    }
    grid.classList.remove('hidden');

    const rows = Math.ceil(remainingWords.length / 4);
    grid.style.aspectRatio = `4 / ${rows}`;

    remainingWords.forEach((word, index) => {
      const isSelected = selectedWords.includes(word);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.word = word;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      const baseClasses =
        'word-tile rounded-xl font-extrabold uppercase flex items-center justify-center p-1.5 sm:p-2 select-none cursor-pointer';
      const stateClasses = isSelected
        ? 'is-selected bg-[#161412] text-[#F6C945] dark:bg-[#F6C945] dark:text-[#161412]'
        : 'bg-nyt-card dark:bg-nyt-cardDark text-paper-ink dark:text-paper-darkInk';
      const animClass = withStagger ? 'tile-pop' : '';

      btn.className = `${baseClasses} ${stateClasses} ${animClass}`;
      if (withStagger) {
        btn.style.animationDelay = `${index * 22}ms`;
      }

      const span = document.createElement('span');
      span.className = 'word-fit';
      span.textContent = word;

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
        ? 'w-3.5 h-3.5 rounded-sm border border-[#161412] bg-[#FF6B2C] transition-all duration-300 scale-100 rotate-3'
        : 'w-3.5 h-3.5 rounded-sm border border-paper-ink/25 bg-transparent transition-all duration-300 scale-75 opacity-35';
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

  // ==================== INTERAZIONE DI GIOCO LEGAMI ====================
  function toggleWordSelection(word) {
    if (gameStatus !== 'in_progress' || isAnimating) return;

    const idx = selectedWords.indexOf(word);
    if (idx !== -1) {
      selectedWords.splice(idx, 1);
      SoundFX.deselect();
    } else {
      if (selectedWords.length >= 4) {
        SoundFX.error();
        showToast('Puoi selezionare al massimo 4 parole');
        return;
      }
      selectedWords.push(word);
      SoundFX.select();
    }

    renderGrid(false);
    updateControlButtons();
  }

  function shuffleRemainingWords() {
    if (gameStatus !== 'in_progress' || isAnimating) return;
    SoundFX.shuffle();
    for (let i = remainingWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingWords[i], remainingWords[j]] = [remainingWords[j], remainingWords[i]];
    }
    renderGrid(true);
  }

  function deselectAll() {
    if (gameStatus !== 'in_progress' || isAnimating) return;
    SoundFX.deselect();
    selectedWords = [];
    renderGrid(false);
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

    const sortedGuessKey = [...selectedWords].sort().join('|');
    const alreadyTried = guessHistory.some(
      (entry) => entry.words && [...entry.words].sort().join('|') === sortedGuessKey
    );
    if (alreadyTried) {
      SoundFX.error();
      showToast('Combinazione già provata!');
      return;
    }

    guessHistory.push({
      words: [...selectedWords],
      tiers: guessTiers
    });

    isAnimating = true;
    await animateSelectedHop();

    const counts = {};
    guessTiers.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });

    const matchedTier = Object.keys(counts).find((t) => counts[t] === 4);

    if (matchedTier) {
      solvedTiers.push(matchedTier);
      remainingWords = remainingWords.filter((w) => !selectedWords.includes(w));
      selectedWords = [];
      isAnimating = false;

      if (solvedTiers.length === 4) {
        gameStatus = 'won';
        stopStopwatch();
        saveCurrentGameState();
        renderSolvedCategories();
        renderGrid(false);
        updateControlButtons();
        SoundFX.victory();
        triggerConfetti();
        setTimeout(() => openResultModal(), 700);
      } else {
        SoundFX.groupSolved();
        saveCurrentGameState();
        renderSolvedCategories();
        renderGrid(false);
        updateControlButtons();
      }
    } else {
      const isOneAway = Object.values(counts).some((c) => c === 3);
      mistakesLeft = Math.max(0, mistakesLeft - 1);
      renderMistakes();
      SoundFX.error();
      animateSelectedShake();

      if (mistakesLeft === 0) {
        showToast('Tentativi esauriti!');
        await sleep(650);
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
        renderGrid(false);
        updateControlButtons();
        setTimeout(() => openResultModal(), 850);
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
          playTone({ freq: 440 + idx * 70, type: 'sine', duration: 0.06, volume: 0.05 });
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

  // ==================== MODALITÀ INTRUSO (BLITZ 60 SECONDI) ====================
  function updateIntrusoHeaderBest() {
    const headerBest = document.getElementById('header-intruso-best');
    const cardBest = document.getElementById('intruso-best-text');
    if (headerBest) headerBest.textContent = intrusoBest;
    if (cardBest) cardBest.textContent = intrusoBest;
    updateHomeBadges();
  }

  function resetIntrusoToStart() {
    stopIntrusoTimer();
    intrusoState = 'idle';
    intrusoTimeLeft = INTRUSO_DURATION;
    intrusoScore = 0;
    intrusoLocked = false;

    document.getElementById('intruso-timer-text').textContent = `${INTRUSO_DURATION}s`;
    document.getElementById('intruso-streak-text').textContent = '0';
    document.getElementById('intruso-timer-bar').style.width = '100%';
    updateIntrusoHeaderBest();

    document.getElementById('intruso-start-card').classList.remove('hidden');
    document.getElementById('intruso-play-card').classList.add('hidden');
    document.getElementById('intruso-gameover-card').classList.add('hidden');
  }

  function startIntrusoGame() {
    SoundFX.select();
    intrusoState = 'playing';
    intrusoTimeLeft = INTRUSO_DURATION;
    intrusoScore = 0;
    intrusoLocked = false;

    document.getElementById('intruso-timer-text').textContent = `${INTRUSO_DURATION}s`;
    document.getElementById('intruso-streak-text').textContent = '0';
    document.getElementById('intruso-timer-bar').style.width = '100%';
    updateIntrusoHeaderBest();

    document.getElementById('intruso-start-card').classList.add('hidden');
    document.getElementById('intruso-gameover-card').classList.add('hidden');
    document.getElementById('intruso-play-card').classList.remove('hidden');

    nextIntrusoRound();

    stopIntrusoTimer();
    intrusoTimerInterval = setInterval(() => {
      if (intrusoState !== 'playing') return;
      intrusoTimeLeft = Math.max(0, intrusoTimeLeft - 1);
      updateIntrusoTimerUI();

      if (intrusoTimeLeft <= 10 && intrusoTimeLeft > 0) {
        SoundFX.tick();
      }
      if (intrusoTimeLeft === 0) {
        finishIntrusoGame();
      }
    }, 1000);
  }

  function stopIntrusoTimer() {
    if (intrusoTimerInterval) {
      clearInterval(intrusoTimerInterval);
      intrusoTimerInterval = null;
    }
  }

  function updateIntrusoTimerUI() {
    const timerText = document.getElementById('intruso-timer-text');
    const timerBar = document.getElementById('intruso-timer-bar');
    const pct = Math.max(0, Math.min(100, (intrusoTimeLeft / INTRUSO_DURATION) * 100));

    if (timerText) timerText.textContent = `${intrusoTimeLeft}s`;
    if (timerBar) timerBar.style.width = `${pct}%`;
  }

  function generateIntrusoRound() {
    const db = getCategoriesPool();
    const allGroups = TIER_ORDER.flatMap((tier) =>
      db[tier].map((g) => ({ ...g, tier }))
    );

    const mainGroup = allGroups[Math.floor(Math.random() * allGroups.length)];
    const mainSet = new Set(mainGroup.words);

    let candidateIntruderGroups = allGroups.filter(
      (g) => g.category !== mainGroup.category && !g.words.some((w) => mainSet.has(w))
    );
    if (candidateIntruderGroups.length === 0) {
      candidateIntruderGroups = allGroups.filter((g) => g.category !== mainGroup.category);
    }

    const intruderGroup =
      candidateIntruderGroups[Math.floor(Math.random() * candidateIntruderGroups.length)];
    const intruderWord =
      intruderGroup.words[Math.floor(Math.random() * intruderGroup.words.length)];

    const items = [
      ...mainGroup.words.map((w) => ({ word: w, isIntruder: false })),
      { word: intruderWord, isIntruder: true }
    ];

    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return {
      mainCategory: mainGroup.category,
      intruderCategory: intruderGroup.category,
      intruderWord,
      items
    };
  }

  function nextIntrusoRound() {
    intrusoLocked = false;
    intrusoCurrentRound = generateIntrusoRound();

    const list = document.getElementById('intruso-words-list');
    const feedback = document.getElementById('intruso-feedback-banner');
    list.innerHTML = '';
    feedback.innerHTML = '4 parole condividono un legame nascosto';

    intrusoCurrentRound.items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.word = item.word;
      btn.className =
        'tactile-btn w-full py-3.5 px-4 rounded-2xl bg-paper-surface dark:bg-paper-darkSurface font-extrabold uppercase tracking-wider text-sm sm:text-base text-paper-ink dark:text-paper-darkInk tile-pop flex items-center justify-between';
      btn.style.animationDelay = `${idx * 35}ms`;

      btn.innerHTML = `
        <span class="w-5"></span>
        <span>${item.word}</span>
        <span class="w-5 text-right text-xs opacity-40"><i class="fa-solid fa-chevron-right"></i></span>
      `;

      btn.addEventListener('click', () => handleIntrusoPick(item, btn));
      list.appendChild(btn);
    });
  }

  function spawnFloatingScore(text, colorClass) {
    const anchor = document.getElementById('intruso-float-anchor');
    if (!anchor) return;
    const badge = document.createElement('span');
    badge.className = `text-sm font-black ${colorClass} score-float`;
    badge.textContent = text;
    anchor.appendChild(badge);
    setTimeout(() => badge.remove(), 680);
  }

  async function handleIntrusoPick(item, btnEl) {
    if (intrusoState !== 'playing' || intrusoLocked) return;
    intrusoLocked = true;

    const feedback = document.getElementById('intruso-feedback-banner');
    const allBtns = Array.from(document.querySelectorAll('#intruso-words-list button'));

    if (item.isIntruder) {
      intrusoScore++;
      document.getElementById('intruso-streak-text').textContent = intrusoScore;
      if (intrusoScore > intrusoBest) {
        intrusoBest = intrusoScore;
        localStorage.setItem(STORAGE_KEY_INTRUSO_BEST, String(intrusoBest));
        updateIntrusoHeaderBest();
      }

      SoundFX.groupSolved();
      spawnFloatingScore('+1', 'text-emerald-500');

      btnEl.className =
        'tactile-btn w-full py-3.5 px-4 rounded-2xl bg-[#70B77E] text-[#161412] font-extrabold uppercase tracking-wider text-sm sm:text-base tile-hop flex items-center justify-between';
      btnEl.innerHTML = `
        <span class="w-5"><i class="fa-solid fa-check"></i></span>
        <span>${item.word}</span>
        <span class="text-[10px] font-bold uppercase tracking-normal">Intruso!</span>
      `;

      feedback.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">Esatto! Le altre 4 erano: <strong>${intrusoCurrentRound.mainCategory}</strong></span>`;

      await sleep(580);
      if (intrusoState === 'playing') {
        nextIntrusoRound();
      }
    } else {
      SoundFX.error();
      intrusoTimeLeft = Math.max(0, intrusoTimeLeft - INTRUSO_PENALTY);
      updateIntrusoTimerUI();
      spawnFloatingScore(`-${INTRUSO_PENALTY}s`, 'text-rose-500');

      btnEl.className =
        'tactile-btn w-full py-3.5 px-4 rounded-2xl bg-rose-500 text-white font-extrabold uppercase tracking-wider text-sm sm:text-base shake-anim flex items-center justify-between';

      const realBtn = allBtns.find((b) => b.dataset.word === intrusoCurrentRound.intruderWord);
      if (realBtn) {
        realBtn.className =
          'tactile-btn w-full py-3.5 px-4 rounded-2xl bg-[#FF6B2C] text-white font-extrabold uppercase tracking-wider text-sm sm:text-base flex items-center justify-between';
      }

      feedback.innerHTML = `<span class="text-rose-600 dark:text-rose-400">L'intruso era <strong>${intrusoCurrentRound.intruderWord}</strong> (${intrusoCurrentRound.mainCategory})</span>`;

      await sleep(950);
      if (intrusoTimeLeft === 0) {
        finishIntrusoGame();
      } else if (intrusoState === 'playing') {
        nextIntrusoRound();
      }
    }
  }

  function finishIntrusoGame() {
    stopIntrusoTimer();
    intrusoState = 'gameover';
    SoundFX.victory();

    if (intrusoScore > 0 && intrusoScore >= intrusoBest) {
      triggerConfetti();
    }

    document.getElementById('intruso-play-card').classList.add('hidden');
    document.getElementById('intruso-gameover-card').classList.remove('hidden');

    document.getElementById('intruso-final-score').textContent = intrusoScore;
    document.getElementById('intruso-final-best').textContent = intrusoBest;
    document.getElementById('intruso-final-subtitle').textContent =
      intrusoScore >= intrusoBest && intrusoScore > 0
        ? 'Nuovo record personale stabilito!'
        : 'Sfida lampo completata!';
  }

  function shareIntrusoResult() {
    const text = [
      'Connessioni • INTRUSO ⚡',
      `🧡 Intrusi scovati in 60s: ${intrusoScore}`,
      `🏆 Record: ${intrusoBest}`,
      '',
      'Gioca su: https://futurewavee.github.io/connessioni/'
    ].join('\n');

    if (navigator.share) {
      navigator.share({ title: 'Connessioni - Intruso', text }).catch(() => copyToClipboard(text));
    } else {
      copyToClipboard(text);
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

  function renderRealCalendar() {
    const container = document.getElementById('archive-grid');
    if (!container) return;

    const games = loadAllGames();
    const stats = calculateStatsAndStreaks();
    const archiveStreakVal = document.getElementById('archive-streak-val');
    if (archiveStreakVal) {
      archiveStreakVal.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'giorno' : 'giorni'}`;
    }

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

    const canGoPrev =
      viewedCalYear > EPOCH_YEAR ||
      (viewedCalYear === EPOCH_YEAR && viewedCalMonth > EPOCH_MONTH);
    const canGoNext =
      viewedCalYear < todayDate.getFullYear() ||
      (viewedCalYear === todayDate.getFullYear() && viewedCalMonth < todayDate.getMonth());

    container.className = 'flex flex-col gap-2.5 overflow-y-auto pr-0.5 py-1 flex-1';
    container.innerHTML = '';

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

    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'grid grid-cols-7 gap-1 text-center';
    WEEKDAYS_SHORT_IT.forEach((dayName) => {
      const cell = document.createElement('div');
      cell.className = 'text-[10px] font-extrabold uppercase tracking-wider text-gray-400 py-1';
      cell.textContent = dayName;
      weekdaysRow.appendChild(cell);
    });
    container.appendChild(weekdaysRow);

    const daysGrid = document.createElement('div');
    daysGrid.className = 'grid grid-cols-7 gap-1.5';

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
          SoundFX.select();
          closeModal('modal-archive');
          loadPuzzleForDate(cellDate);
        });
      }

      daysGrid.appendChild(cellBtn);
    }

    container.appendChild(daysGrid);

    const prevBtn = document.getElementById('cal-prev-month');
    const nextBtn = document.getElementById('cal-next-month');

    if (prevBtn && canGoPrev) {
      prevBtn.addEventListener('click', () => {
        SoundFX.select();
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
        SoundFX.select();
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
    SoundFX.shuffle();
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

  // ==================== STATISTICHE PERSONALI REALI ====================
  function getPersonalDistribution() {
    const games = loadAllGames();
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

    Object.values(games).forEach((rec) => {
      if (rec && rec.status === 'won') {
        const mistakes = Math.min(3, Math.max(0, MAX_MISTAKES - (rec.mistakesLeft ?? MAX_MISTAKES)));
        counts[mistakes]++;
      }
    });

    const maxVal = Math.max(1, ...Object.values(counts));
    return [
      { label: '0 errori (Perfetto)', count: counts[0], pct: Math.round((counts[0] / maxVal) * 100), color: 'bg-emerald-500' },
      { label: '1 errore', count: counts[1], pct: Math.round((counts[1] / maxVal) * 100), color: 'bg-lime-500' },
      { label: '2 errori', count: counts[2], pct: Math.round((counts[2] / maxVal) * 100), color: 'bg-amber-500' },
      { label: '3 errori', count: counts[3], pct: Math.round((counts[3] / maxVal) * 100), color: 'bg-orange-500' }
    ];
  }

  function openStatsModal() {
    const stats = calculateStatsAndStreaks();
    const personalDist = getPersonalDistribution();

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

    const barsContainer = document.getElementById('stats-personal-bars');
    if (barsContainer) {
      barsContainer.innerHTML = '';
      personalDist.forEach((row) => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2';
        div.innerHTML = `
          <span class="w-32 text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate">${row.label}</span>
          <div class="flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full ${row.color} rounded-full transition-all duration-300" style="width: ${row.count > 0 ? Math.max(8, row.pct) : 0}%"></div>
          </div>
          <span class="w-6 text-right font-mono font-bold text-[11px]">${row.count}</span>
        `;
        barsContainer.appendChild(div);
      });
    }

    openModal('modal-stats');
  }

  // ==================== MODALE RISULTATO & CONDIVISIONE LEGAMI ====================
  function openResultModal() {
    const stats = calculateStatsAndStreaks();
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
        "Ottimo colpo d'occhio!",
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

    const emojiGrid = document.getElementById('result-emoji-grid');
    emojiGrid.innerHTML = guessHistory
      .map((entry) => entry.tiers.map((t) => TIER_STYLES[t].emoji).join(''))
      .join('<br>');

    openModal('modal-result');
  }

  function shareResult() {
    const stats = calculateStatsAndStreaks();
    const rows = guessHistory
      .map((entry) => entry.tiers.map((t) => TIER_STYLES[t].emoji).join(''))
      .join('\n');

    const text = [
      `Connessioni • LEGAMI #${currentPuzzle.number} (${formatDateIT(currentPuzzleDate)})`,
      `🔥 Streak: ${stats.currentStreak} gg`,
      '',
      rows,
      '',
      'Gioca su: https://futurewavee.github.io/connessioni/'
    ].join('\n');

    if (navigator.share) {
      navigator
        .share({
          title: `Legami #${currentPuzzle.number}`,
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
      if (activeMode === 'legami' && gameStatus === 'in_progress') {
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
    SoundFX.select();
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }

  function openHelpModal() {
    const legamiHelp = document.getElementById('help-content-legami');
    const intrusoHelp = document.getElementById('help-content-intruso');
    const title = document.getElementById('modal-help-title');

    if (activeMode === 'intruso') {
      title.textContent = 'Regole • Intruso';
      legamiHelp.classList.add('hidden');
      intrusoHelp.classList.remove('hidden');
    } else {
      title.textContent = 'Regole • Legami';
      legamiHelp.classList.remove('hidden');
      intrusoHelp.classList.add('hidden');
    }
    openModal('modal-help');
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
    // Schermata iniziale minimale
    document.getElementById('btn-select-legami')?.addEventListener('click', () => {
      SoundFX.select();
      switchScreen('legami');
    });
    document.getElementById('btn-select-intruso')?.addEventListener('click', () => {
      SoundFX.select();
      switchScreen('intruso');
    });
    document.getElementById('home-btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('home-btn-sound')?.addEventListener('click', toggleSound);

    // Ritorno alla schermata iniziale
    document.getElementById('btn-back-home')?.addEventListener('click', () => {
      SoundFX.deselect();
      switchScreen('home');
    });
    document.getElementById('btn-footer-switch')?.addEventListener('click', () => {
      SoundFX.deselect();
      switchScreen('home');
    });

    // Controlli griglia LEGAMI
    document.getElementById('btn-shuffle')?.addEventListener('click', shuffleRemainingWords);
    document.getElementById('btn-deselect')?.addEventListener('click', deselectAll);
    document.getElementById('btn-submit')?.addEventListener('click', submitGuess);

    // Controlli modalità INTRUSO
    document.getElementById('btn-start-intruso')?.addEventListener('click', startIntrusoGame);
    document.getElementById('btn-restart-intruso')?.addEventListener('click', startIntrusoGame);
    document.getElementById('btn-share-intruso')?.addEventListener('click', shareIntrusoResult);

    // Header & Footer di Gioco
    document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
    document.getElementById('btn-sound')?.addEventListener('click', toggleSound);
    document.getElementById('btn-how-to')?.addEventListener('click', openHelpModal);
    document.getElementById('btn-archive')?.addEventListener('click', openCalendarModal);
    document.getElementById('btn-footer-archive')?.addEventListener('click', openCalendarModal);
    document.getElementById('header-streak-badge')?.addEventListener('click', openCalendarModal);
    document.getElementById('btn-stats')?.addEventListener('click', openStatsModal);
    document.getElementById('btn-back-today')?.addEventListener('click', () => {
      SoundFX.select();
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
      if (activeMode === 'legami') {
        localStorage.setItem(STORAGE_KEY_HELP_LEGAMI, '1');
      }
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
      } else if (
        e.key === 'Enter' &&
        activeMode === 'legami' &&
        gameStatus === 'in_progress' &&
        selectedWords.length === 4
      ) {
        submitGuess();
      }
    });
  }

  // ==================== AVVIO ====================
  initTheme();
  updateSoundUI();
  bindEvents();
  startMidnightCountdown();
  updateStreakUI();
  updateIntrusoHeaderBest();
  switchScreen('home');
});