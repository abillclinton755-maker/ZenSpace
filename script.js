/* ===================================================================
   ZenSpace — Full-Fledged Mindfulness App
   Features: Navigation, Timer, Breathing, Mood, Journal, Stats,
             Achievements, Focus/Pomodoro, CSV Export, Onboarding
   =================================================================== */

// ===== DATA STORE =====
const Store = {
    get(key, fallback) {
        try { const v = localStorage.getItem('zen_' + key); return v !== null ? JSON.parse(v) : fallback; }
        catch { return fallback; }
    },
    set(key, val) { localStorage.setItem('zen_' + key, JSON.stringify(val)); },
    remove(key) { localStorage.removeItem('zen_' + key); }
};

// ===== BREATHING TECHNIQUES =====
const TECHNIQUES = {
    relaxed:  { name: 'Relaxed',   steps: [{phase:'inhale',dur:4},{phase:'exhale',dur:4}] },
    '478':    { name: '4-7-8',     steps: [{phase:'inhale',dur:4},{phase:'hold',dur:7},{phase:'exhale',dur:8}] },
    box:      { name: 'Box',       steps: [{phase:'inhale',dur:4},{phase:'hold',dur:4},{phase:'exhale',dur:4},{phase:'hold',dur:4}] },
    deep:     { name: 'Deep Calm', steps: [{phase:'inhale',dur:5},{phase:'hold',dur:2},{phase:'exhale',dur:7}] }
};

// ===== ACHIEVEMENT DEFINITIONS =====
const ACHIEVEMENTS = [
    { id:'first_session', icon:'fa-solid fa-seedling',      name:'First Step',     desc:'Complete your first session',           check: s => s.sessions >= 1 },
    { id:'five_sessions', icon:'fa-solid fa-hand-peace',    name:'High Five',      desc:'Complete 5 sessions',                  check: s => s.sessions >= 5 },
    { id:'ten_sessions',  icon:'fa-solid fa-star',          name:'Dedicated',      desc:'Complete 10 sessions',                 check: s => s.sessions >= 10 },
    { id:'fifty_sessions',icon:'fa-solid fa-crown',         name:'Master',         desc:'Complete 50 sessions',                 check: s => s.sessions >= 50 },
    { id:'streak_3',      icon:'fa-solid fa-fire',          name:'On Fire',        desc:'3-day streak',                         check: s => s.streak >= 3 },
    { id:'streak_7',      icon:'fa-solid fa-fire-flame-curved', name:'Weekly Warrior', desc:'7-day streak',                    check: s => s.streak >= 7 },
    { id:'streak_30',     icon:'fa-solid fa-gem',           name:'Monthly Gem',    desc:'30-day streak',                        check: s => s.streak >= 30 },
    { id:'mins_60',       icon:'fa-solid fa-clock',         name:'One Hour',       desc:'60 total minutes meditated',           check: s => s.totalMinutes >= 60 },
    { id:'mins_300',      icon:'fa-solid fa-hourglass-half',name:'Deep Diver',     desc:'300 total minutes meditated',          check: s => s.totalMinutes >= 300 },
    { id:'journal_5',     icon:'fa-solid fa-pen-fancy',     name:'Reflector',      desc:'Write 5 journal entries',              check: s => s.journalCount >= 5 },
    { id:'focus_5',       icon:'fa-solid fa-bullseye',      name:'Focused Mind',   desc:'Complete 5 focus sessions',            check: s => s.focusSessions >= 5 },
    { id:'all_techniques',icon:'fa-solid fa-palette',       name:'Explorer',       desc:'Try all 4 breathing techniques',       check: s => s.techniquesUsed >= 4 }
];

// ===== QUOTES =====
const QUOTES = [
    "Peace comes from within. Do not seek it without.",
    "Quiet the mind, and the soul will speak.",
    "Breathe, let go, and remind yourself that this very moment is the only one you have.",
    "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    "Inhale the future, exhale the past.",
    "The quieter you become, the more you can hear.",
    "Almost everything will work again if you unplug it for a few minutes, including you.",
    "Mindfulness is a way of befriending ourselves and our experience.",
    "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts.",
    "Be where you are, not where you think you should be.",
    "Within you, there is a stillness and sanctuary to which you can retreat at any time."
];

// ===== APP STATE =====
const state = {
    currentView: 'home',
    selectedMinutes: 5,
    selectedTechnique: 'relaxed',
    sessionMode: 'meditate', // 'meditate' or 'focus'
    isMeditating: false,
    isPaused: false,
    timeLeft: 0,
    totalTime: 0,
    timerInterval: null,
    breathStepIndex: 0,
    breathTimeout: null,
    focusWork: 25,
    focusBreak: 5,
    focusCycle: 0,
    focusTotalCycles: 4,
    isOnBreak: false,
    stats: {
        sessions: Store.get('sessions', 0),
        totalMinutes: Store.get('minutes', 0),
        lastDate: Store.get('last_date', null),
        streak: Store.get('streak', 0),
        focusSessions: Store.get('focus_sessions', 0),
        techniquesUsed: Store.get('techniques_used', []).length
    },
    history: Store.get('history', []),
    journal: Store.get('journal', []),
    badges: Store.get('badges', [])
};

// ===== DOM CACHE =====
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

const DOM = {};
function cacheDom() {
    DOM.greeting = $('#greeting');
    DOM.subtitleDate = $('#subtitle-date');
    DOM.streakCount = $('#streak-count');
    DOM.totalTime = $('#total-time');
    DOM.sessionTotal = $('#session-total');
    DOM.badgeCount = $('#badge-count');
    DOM.dailyQuote = $('#daily-quote');
    DOM.presetBtns = $$('.preset-btn');
    DOM.techBtns = $$('.tech-btn');
    DOM.modeBtns = $$('.mode-btn');
    DOM.customTimeDiv = $('.custom-time-input');
    DOM.customTimeInput = $('#custom-minutes');
    DOM.focusSettings = $('#focus-settings');
    DOM.focusWork = $('#focus-work');
    DOM.focusBreak = $('#focus-break');
    DOM.startBtn = $('#start-btn');
    DOM.timeLeft = $('#time-left');
    DOM.progressRing = $('#progress-ring-circle');
    DOM.pauseBtn = $('#pause-btn');
    DOM.endBtn = $('#end-btn');
    DOM.music = $('#music');
    DOM.alarm = $('#alarm');
    DOM.volumeSlider = $('#volume-slider');
    DOM.themeToggle = $('#theme-toggle');
    DOM.orbContainer = $('.breathing-orb');
    DOM.breathInstruction = $('#breathing-instruction');
    DOM.focusCycleInfo = $('#focus-cycle-info');
    DOM.focusCycleText = $('#focus-cycle-text');
    DOM.navBtns = $$('.nav-btn');
    DOM.journalInput = $('#journal-input');
    DOM.journalSave = $('#journal-save');
    DOM.journalList = $('#journal-list');
    DOM.statsChart = $('#stats-chart');
    DOM.historyList = $('#history-list');
    DOM.exportCsv = $('#export-csv');
    DOM.badgesGrid = $('#badges-grid');
    DOM.resetData = $('#reset-data');
    DOM.onboarding = $('#onboarding-overlay');
    DOM.onboardingNext = $('#onboarding-next');
    DOM.onboardingSkip = $('#onboarding-skip');
    DOM.modal = $('#custom-modal');
    DOM.modalIcon = $('#modal-icon');
    DOM.modalTitle = $('#modal-title');
    DOM.modalMessage = $('#modal-message');
    DOM.modalExtra = $('#modal-extra');
    DOM.modalConfirm = $('#modal-confirm');
    DOM.modalCancel = $('#modal-cancel');
}

// ===== INIT =====
function init() {
    cacheDom();
    updateGreeting();
    updateDateSubtitle();
    updateStatsDisplay();
    setRandomQuote();
    setupEventListeners();
    initProgressRing();
    checkOnboarding();
}

// ===== GREETING & DATE =====
function updateGreeting() {
    const h = new Date().getHours();
    DOM.greeting.textContent = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
}
function updateDateSubtitle() {
    const d = new Date();
    DOM.subtitleDate.textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
}

// ===== STATS =====
function updateStatsDisplay() {
    DOM.streakCount.textContent = `${state.stats.streak} Days`;
    DOM.totalTime.textContent = `${state.stats.totalMinutes} Mins`;
    DOM.sessionTotal.textContent = state.stats.sessions;
    const unlocked = ACHIEVEMENTS.filter(a => state.badges.includes(a.id)).length;
    DOM.badgeCount.textContent = unlocked;
}

// ===== QUOTES =====
function setRandomQuote() {
    DOM.dailyQuote.textContent = `"${QUOTES[Math.floor(Math.random() * QUOTES.length)]}"`;
}

// ===== NAVIGATION =====
function navigateTo(viewName) {
    if (state.isMeditating && viewName !== 'session') return; // block nav during session
    state.currentView = viewName;
    $$('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const target = $(`#view-${viewName}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
    DOM.navBtns.forEach(b => b.classList.toggle('active', b.dataset.target === viewName));
    // refresh content on navigate
    if (viewName === 'stats') { renderChart(); renderHistory(); }
    if (viewName === 'journal') renderJournal();
    if (viewName === 'profile') renderBadges();
    if (viewName === 'home') { updateStatsDisplay(); setRandomQuote(); }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    DOM.navBtns.forEach(b => b.addEventListener('click', () => navigateTo(b.dataset.target)));

    // Time presets
    DOM.presetBtns.forEach(btn => btn.addEventListener('click', e => {
        DOM.presetBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const val = e.currentTarget.dataset.time;
        if (val === 'custom') { DOM.customTimeDiv.classList.remove('hidden'); state.selectedMinutes = parseInt(DOM.customTimeInput.value) || 15; }
        else { DOM.customTimeDiv.classList.add('hidden'); state.selectedMinutes = parseInt(val); }
    }));
    DOM.customTimeInput.addEventListener('change', e => {
        let v = parseInt(e.target.value); if (isNaN(v)||v<1) v=1; if(v>120) v=120;
        e.target.value = v; state.selectedMinutes = v;
    });

    // Technique
    DOM.techBtns.forEach(btn => btn.addEventListener('click', e => {
        DOM.techBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.selectedTechnique = e.currentTarget.dataset.technique;
    }));

    // Session mode
    DOM.modeBtns.forEach(btn => btn.addEventListener('click', e => {
        DOM.modeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.sessionMode = e.currentTarget.dataset.mode;
        DOM.focusSettings.classList.toggle('hidden', state.sessionMode !== 'focus');
    }));

    // Start
    DOM.startBtn.addEventListener('click', () => {
        if (state.sessionMode === 'focus') startFocusSession(); else startMeditation();
    });
    DOM.pauseBtn.addEventListener('click', togglePause);
    DOM.endBtn.addEventListener('click', () => showConfirmModal('End current session early?', endMeditationConfirmed));

    // Volume
    DOM.volumeSlider.addEventListener('input', e => { DOM.music.volume = parseFloat(e.target.value); });

    // Theme
    DOM.themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme', !isLight);
        const icon = DOM.themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon', !isLight);
        icon.classList.toggle('fa-sun', isLight);
    });

    // Journal
    DOM.journalSave.addEventListener('click', saveJournalEntry);
    // CSV Export
    DOM.exportCsv.addEventListener('click', exportCSV);
    // Reset
    DOM.resetData.addEventListener('click', () => showConfirmModal('This will erase ALL your data permanently. Continue?', resetAllData));

    // Onboarding
    DOM.onboardingSkip.addEventListener('click', closeOnboarding);
    DOM.onboardingNext.addEventListener('click', advanceOnboarding);
}

// ===== PROGRESS RING =====
const RING_R = 100;
const RING_C = 2 * Math.PI * RING_R;
function initProgressRing() {
    if (DOM.progressRing) {
        DOM.progressRing.style.strokeDasharray = `${RING_C} ${RING_C}`;
        DOM.progressRing.style.strokeDashoffset = '0';
    }
}
function setProgress(pct) {
    DOM.progressRing.style.strokeDashoffset = RING_C - (pct / 100) * RING_C;
}
function formatTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ===== MEDITATION =====
function startMeditation() {
    state.totalTime = state.selectedMinutes * 60;
    state.timeLeft = state.totalTime;
    state.isMeditating = true;
    state.isPaused = false;
    navigateTo('session');
    DOM.focusCycleInfo.classList.add('hidden');
    DOM.timeLeft.textContent = formatTime(state.timeLeft);
    setProgress(100);
    DOM.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    DOM.music.volume = parseFloat(DOM.volumeSlider.value);
    DOM.music.currentTime = 0;
    DOM.music.play().catch(() => {});
    runTimer();
    startBreathingCycle();
}

function runTimer() {
    state.timerInterval = setInterval(() => {
        if (!state.isPaused) {
            state.timeLeft--;
            DOM.timeLeft.textContent = formatTime(Math.max(state.timeLeft,0));
            setProgress((state.timeLeft / state.totalTime) * 100);
            if (state.timeLeft <= 0) completeMeditation();
        }
    }, 1000);
}

function togglePause() {
    state.isPaused = !state.isPaused;
    if (state.isPaused) {
        DOM.music.pause();
        DOM.pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearBreathing();
        DOM.breathInstruction.textContent = 'Paused';
    } else {
        DOM.music.play().catch(() => {});
        DOM.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        startBreathingCycle();
    }
}

// ===== BREATHING =====
function startBreathingCycle() {
    const tech = TECHNIQUES[state.selectedTechnique];
    state.breathStepIndex = 0;
    runBreathStep(tech);
}

function runBreathStep(tech) {
    if (state.isPaused || !state.isMeditating) return;
    const step = tech.steps[state.breathStepIndex % tech.steps.length];
    DOM.orbContainer.classList.remove('inhale','hold','exhale');
    DOM.orbContainer.classList.add(step.phase);
    const labels = { inhale:'Breathe In...', hold:'Hold...', exhale:'Breathe Out...' };
    DOM.breathInstruction.textContent = labels[step.phase] || step.phase;
    state.breathTimeout = setTimeout(() => {
        state.breathStepIndex++;
        runBreathStep(tech);
    }, step.dur * 1000);
}

function clearBreathing() {
    clearTimeout(state.breathTimeout);
    DOM.orbContainer.classList.remove('inhale','hold','exhale');
}

// ===== SESSION COMPLETE =====
function completeMeditation() {
    clearInterval(state.timerInterval);
    clearBreathing();
    DOM.music.pause();
    DOM.alarm.currentTime = 0;
    DOM.alarm.play().catch(() => {});

    // Record stats
    state.stats.sessions++;
    state.stats.totalMinutes += state.selectedMinutes;
    updateStreak();
    trackTechnique();

    // Save history
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: state.selectedMinutes,
        technique: state.selectedTechnique,
        mode: state.sessionMode,
        mood: null
    };
    state.history.unshift(entry);
    Store.set('history', state.history);
    saveStats();
    updateStatsDisplay();
    checkAchievements();

    // Show completion modal with mood selector
    showCompletionModal(entry);
}

function showCompletionModal(entry) {
    DOM.modalIcon.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
    DOM.modalIcon.style.color = 'var(--success)';
    DOM.modalTitle.textContent = 'Session Complete!';
    DOM.modalMessage.textContent = `Great job! You meditated for ${entry.duration} minute${entry.duration>1?'s':''}.`;
    DOM.modalExtra.innerHTML = `
        <p style="margin-bottom:8px;font-weight:500;">How are you feeling?</p>
        <div class="mood-selector">
            <button class="mood-btn" data-mood="😔">😔</button>
            <button class="mood-btn" data-mood="😐">😐</button>
            <button class="mood-btn" data-mood="🙂">🙂</button>
            <button class="mood-btn" data-mood="😊">😊</button>
            <button class="mood-btn" data-mood="🤩">🤩</button>
        </div>`;
    DOM.modalCancel.classList.add('hidden');
    DOM.modal.classList.remove('hidden');

    // Mood selection
    DOM.modalExtra.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.modalExtra.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            entry.mood = btn.dataset.mood;
            // update in history
            const idx = state.history.findIndex(h => h.id === entry.id);
            if (idx >= 0) state.history[idx].mood = entry.mood;
            Store.set('history', state.history);
        });
    });

    DOM.modalConfirm.onclick = () => {
        DOM.modal.classList.add('hidden');
        finishSession();
    };
}

// ===== FOCUS / POMODORO =====
function startFocusSession() {
    state.focusWork = parseInt(DOM.focusWork.value) || 25;
    state.focusBreak = parseInt(DOM.focusBreak.value) || 5;
    state.focusCycle = 1;
    state.focusTotalCycles = 4;
    state.isOnBreak = false;
    state.totalTime = state.focusWork * 60;
    state.timeLeft = state.totalTime;
    state.isMeditating = true;
    state.isPaused = false;
    navigateTo('session');
    DOM.focusCycleInfo.classList.remove('hidden');
    updateFocusCycleText();
    DOM.timeLeft.textContent = formatTime(state.timeLeft);
    setProgress(100);
    DOM.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    DOM.breathInstruction.textContent = 'Focus...';
    DOM.orbContainer.classList.add('inhale'); // steady glow
    DOM.music.volume = parseFloat(DOM.volumeSlider.value);
    DOM.music.currentTime = 0;
    DOM.music.play().catch(() => {});
    runFocusTimer();
}

function updateFocusCycleText() {
    DOM.focusCycleText.textContent = state.isOnBreak
        ? `Break ${state.focusCycle}/${state.focusTotalCycles}`
        : `Focus ${state.focusCycle}/${state.focusTotalCycles}`;
}

function runFocusTimer() {
    state.timerInterval = setInterval(() => {
        if (!state.isPaused) {
            state.timeLeft--;
            DOM.timeLeft.textContent = formatTime(Math.max(state.timeLeft, 0));
            setProgress((state.timeLeft / state.totalTime) * 100);
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                DOM.alarm.currentTime = 0;
                DOM.alarm.play().catch(() => {});
                if (!state.isOnBreak && state.focusCycle < state.focusTotalCycles) {
                    // switch to break
                    state.isOnBreak = true;
                    state.totalTime = state.focusBreak * 60;
                    state.timeLeft = state.totalTime;
                    DOM.breathInstruction.textContent = 'Break time! Relax...';
                    DOM.orbContainer.classList.remove('inhale');
                    DOM.orbContainer.classList.add('exhale');
                    updateFocusCycleText();
                    runFocusTimer();
                } else if (state.isOnBreak) {
                    // switch to work
                    state.isOnBreak = false;
                    state.focusCycle++;
                    state.totalTime = state.focusWork * 60;
                    state.timeLeft = state.totalTime;
                    DOM.breathInstruction.textContent = 'Focus...';
                    DOM.orbContainer.classList.remove('exhale');
                    DOM.orbContainer.classList.add('inhale');
                    updateFocusCycleText();
                    runFocusTimer();
                } else {
                    // all cycles done
                    completeFocusSession();
                }
            }
        }
    }, 1000);
}

function completeFocusSession() {
    clearInterval(state.timerInterval);
    clearBreathing();
    DOM.music.pause();
    state.stats.focusSessions = (state.stats.focusSessions || 0) + 1;
    Store.set('focus_sessions', state.stats.focusSessions);
    const totalFocusMinutes = state.focusWork * state.focusTotalCycles;
    state.stats.totalMinutes += totalFocusMinutes;
    state.stats.sessions++;
    updateStreak();
    const entry = {
        id: Date.now(), date: new Date().toISOString(),
        duration: totalFocusMinutes, technique: 'focus', mode: 'focus', mood: null
    };
    state.history.unshift(entry);
    Store.set('history', state.history);
    saveStats();
    updateStatsDisplay();
    checkAchievements();
    showCompletionModal(entry);
}

// ===== END SESSION =====
function endMeditationConfirmed() {
    clearInterval(state.timerInterval);
    clearBreathing();
    DOM.music.pause();
    finishSession();
}

function finishSession() {
    state.isMeditating = false;
    state.isPaused = false;
    DOM.orbContainer.classList.remove('inhale','hold','exhale');
    DOM.focusCycleInfo.classList.add('hidden');
    navigateTo('home');
}

// ===== STREAK LOGIC =====
function updateStreak() {
    const today = new Date().toDateString();
    if (state.stats.lastDate !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (state.stats.lastDate === yesterday.toDateString()) state.stats.streak++;
        else if (state.stats.lastDate !== today) state.stats.streak = 1;
        state.stats.lastDate = today;
    }
}

function trackTechnique() {
    let used = Store.get('techniques_used', []);
    if (!used.includes(state.selectedTechnique)) {
        used.push(state.selectedTechnique);
        Store.set('techniques_used', used);
    }
    state.stats.techniquesUsed = used.length;
}

function saveStats() {
    Store.set('sessions', state.stats.sessions);
    Store.set('minutes', state.stats.totalMinutes);
    Store.set('streak', state.stats.streak);
    Store.set('last_date', state.stats.lastDate);
}

// ===== JOURNAL =====
function saveJournalEntry() {
    const text = DOM.journalInput.value.trim();
    if (!text) return;
    const entry = { id: Date.now(), date: new Date().toISOString(), text };
    state.journal.unshift(entry);
    Store.set('journal', state.journal);
    DOM.journalInput.value = '';
    renderJournal();
    checkAchievements();
}

function deleteJournalEntry(id) {
    state.journal = state.journal.filter(e => e.id !== id);
    Store.set('journal', state.journal);
    renderJournal();
}

function renderJournal() {
    DOM.journalList.innerHTML = state.journal.length === 0
        ? '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No entries yet. Start writing!</p>'
        : state.journal.map(e => `
            <div class="journal-entry">
                <div class="journal-entry-header">
                    <span class="journal-entry-date">${new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                    <button class="journal-delete-btn" onclick="deleteJournalEntry(${e.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                <p class="journal-entry-text">${escapeHTML(e.text)}</p>
            </div>`).join('');
}

// ===== STATS CHART (Canvas) =====
function renderChart() {
    const ctx = DOM.statsChart.getContext('2d');
    const W = DOM.statsChart.width, H = DOM.statsChart.height;
    ctx.clearRect(0, 0, W, H);

    const days = getLast7DaysData();
    const maxVal = Math.max(...days.map(d => d.mins), 1);
    const barW = 50, gap = (W - days.length * barW) / (days.length + 1);
    const chartTop = 40, chartBottom = H - 40;
    const chartH = chartBottom - chartTop;

    // Styles
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const barColor = isDark ? '#38bdf8' : '#0284c7';
    const barGlow = isDark ? 'rgba(56,189,248,0.3)' : 'rgba(2,132,199,0.2)';

    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';

    days.forEach((d, i) => {
        const x = gap + i * (barW + gap);
        const barH = (d.mins / maxVal) * chartH;
        const y = chartBottom - barH;

        // Bar
        ctx.fillStyle = barColor;
        ctx.shadowColor = barGlow;
        ctx.shadowBlur = 12;
        roundRect(ctx, x, y, barW, barH, 8);
        ctx.shadowBlur = 0;

        // Value on top
        ctx.fillStyle = textColor;
        ctx.fillText(`${d.mins}m`, x + barW / 2, y - 8);

        // Day label
        ctx.fillText(d.label, x + barW / 2, chartBottom + 20);
    });
}

function roundRect(ctx, x, y, w, h, r) {
    if (h < 1) h = 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

function getLast7DaysData() {
    const result = [];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const mins = state.history
            .filter(h => new Date(h.date).toDateString() === dateStr)
            .reduce((sum, h) => sum + (h.duration || 0), 0);
        result.push({ label: dayNames[d.getDay()], mins });
    }
    return result;
}

// ===== HISTORY =====
function renderHistory() {
    const items = state.history.slice(0, 30);
    DOM.historyList.innerHTML = items.length === 0
        ? '<p style="text-align:center;color:var(--text-secondary);padding:16px;">No sessions yet.</p>'
        : items.map(h => `
            <div class="history-item">
                <span class="history-date">${new Date(h.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} ${new Date(h.date).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>
                <span class="history-details">
                    <span class="history-duration">${h.duration} min</span>
                    ${h.mood ? `<span class="history-mood">${h.mood}</span>` : ''}
                </span>
            </div>`).join('');
}

// ===== CSV EXPORT =====
function exportCSV() {
    if (state.history.length === 0) { showAlertModal('No Data', 'Complete a session first to export data.'); return; }
    const header = 'Date,Duration (min),Technique,Mode,Mood\n';
    const rows = state.history.map(h =>
        `"${new Date(h.date).toLocaleString()}",${h.duration},"${h.technique || ''}","${h.mode || ''}","${h.mood || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zenspace_sessions.csv'; a.click();
    URL.revokeObjectURL(url);
}

// ===== ACHIEVEMENTS =====
function checkAchievements() {
    const checkStats = {
        sessions: state.stats.sessions,
        totalMinutes: state.stats.totalMinutes,
        streak: state.stats.streak,
        focusSessions: state.stats.focusSessions || 0,
        techniquesUsed: state.stats.techniquesUsed || 0,
        journalCount: state.journal.length
    };
    let newBadge = false;
    ACHIEVEMENTS.forEach(a => {
        if (!state.badges.includes(a.id) && a.check(checkStats)) {
            state.badges.push(a.id);
            newBadge = true;
        }
    });
    if (newBadge) {
        Store.set('badges', state.badges);
        updateStatsDisplay();
    }
}

function renderBadges() {
    DOM.badgesGrid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = state.badges.includes(a.id);
        return `
            <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon"><i class="${a.icon}"></i></div>
                <div class="badge-name">${a.name}</div>
                <div class="badge-desc">${a.desc}</div>
            </div>`;
    }).join('');
}

// ===== CUSTOM MODALS =====
function showAlertModal(title, message) {
    DOM.modalIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
    DOM.modalIcon.style.color = 'var(--accent-color)';
    DOM.modalTitle.textContent = title;
    DOM.modalMessage.textContent = message;
    DOM.modalExtra.innerHTML = '';
    DOM.modalCancel.classList.add('hidden');
    DOM.modal.classList.remove('hidden');
    DOM.modalConfirm.onclick = () => DOM.modal.classList.add('hidden');
}

function showConfirmModal(message, onConfirm) {
    DOM.modalIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    DOM.modalIcon.style.color = 'var(--warning)';
    DOM.modalTitle.textContent = 'Confirm';
    DOM.modalMessage.textContent = message;
    DOM.modalExtra.innerHTML = '';
    DOM.modalCancel.classList.remove('hidden');
    DOM.modal.classList.remove('hidden');
    DOM.modalConfirm.onclick = () => { DOM.modal.classList.add('hidden'); onConfirm(); };
    DOM.modalCancel.onclick = () => DOM.modal.classList.add('hidden');
}

// ===== ONBOARDING =====
let onboardingStep = 0;
function checkOnboarding() {
    if (!Store.get('onboarded', false)) DOM.onboarding.classList.remove('hidden');
}
function advanceOnboarding() {
    onboardingStep++;
    if (onboardingStep >= 3) { closeOnboarding(); return; }
    $$('.onboarding-slide').forEach(s => s.classList.toggle('active', parseInt(s.dataset.slide) === onboardingStep));
    $$('.dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.dot) === onboardingStep));
    if (onboardingStep === 2) DOM.onboardingNext.textContent = 'Get Started';
}
function closeOnboarding() {
    DOM.onboarding.classList.add('hidden');
    Store.set('onboarded', true);
}

// ===== RESET DATA =====
function resetAllData() {
    const keys = ['sessions','minutes','last_date','streak','focus_sessions','techniques_used','history','journal','badges','onboarded'];
    keys.forEach(k => Store.remove(k));
    location.reload();
}

// ===== UTILITY =====
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', init);