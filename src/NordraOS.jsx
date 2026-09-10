import { useState, useEffect } from "react";

function loadSaved(key, fallback) {
  try {
    const raw = window.localStorage.getItem("nordra_" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveOnChange(key, value) {
  try {
    window.localStorage.setItem("nordra_" + key, JSON.stringify(value));
  } catch {
    // storage unavailable (private browsing, etc.) — fail silently, app still works
  }
}

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Sora:wght@400;500;600;700&display=swap');`;

const CAT = {
  personal: "#6C5CE7",
  family: "#FF6F59",
  habits: "#2FBF9F",
  tasks: "#4FA8E8",
  finance: "#F2B134",
  health: "#FF5C8A",
  growth: "#B24BF3",
};

const TINT = {
  habits: "rgba(47,191,159,0.16)",
  tasks: "rgba(79,168,232,0.16)",
  growth: "rgba(178,75,243,0.16)",
  family: "rgba(255,111,89,0.16)",
};

const weekDates = [
  { d: "Sun", n: 5 }, { d: "Mon", n: 6 }, { d: "Tue", n: 7 }, { d: "Wed", n: 8 },
  { d: "Thu", n: 9 }, { d: "Fri", n: 10 }, { d: "Sat", n: 11 },
];
const todayIdx = 3;

const initialTasks = [
  { id: 1, title: "Pay electricity bill", time: "Due today", cat: "personal", done: false, sharedWith: [] },
  { id: 2, title: "Call client", time: "2:00 PM", cat: "tasks", done: false, sharedWith: [] },
  { id: 3, title: "Gym", time: "6:00 PM", cat: "health", done: false, sharedWith: [] },
  { id: 4, title: "Dinner with Sarah", time: "8:00 PM", cat: "family", done: false, sharedWith: [] },
  { id: 5, title: "Book dentist", time: "This week", cat: "health", done: true, sharedWith: [] },
];

const initialHabits = [
  { id: 1, name: "Drink water", week: [true, true, false, true, false, false, false] },
  { id: 2, name: "Read 10 pages", week: [true, false, true, true, false, false, false] },
  { id: 3, name: "Morning stretch", week: [false, true, true, true, false, false, false] },
];

const initialGoals = [
  { id: 1, name: "Personal", cat: "personal", pct: 67 },
  { id: 2, name: "Family", cat: "family", pct: 80 },
  { id: 3, name: "Health", cat: "health", pct: 33 },
  { id: 4, name: "Finance", cat: "finance", pct: 60 },
  { id: 5, name: "Growth", cat: "growth", pct: 40 },
];

const familyPeople = [
  { id: "sam", name: "Sam", initial: "S", color: CAT.family, items: [{ title: "Doctor appointment", meta: "10:30 AM" }, { title: "Grocery run", meta: "This afternoon" }] },
  { id: "mila", name: "Mila", initial: "M", color: CAT.finance, items: [{ title: "School — early pickup", meta: "1:45 PM" }, { title: "Football practice", meta: "5:00 PM" }] },
];

const gridItems = [
  { id: "goals", label: "Goals", color: CAT.personal, live: true },
  { id: "habits", label: "Habits", color: CAT.habits, live: true },
  { id: "tasks", label: "Tasks", color: CAT.tasks, live: true },
  { id: "family", label: "Share", color: CAT.family, live: true },
  { id: "inbox", label: "Inbox", color: CAT.growth, live: true },
  { id: "finance", label: "Finance", color: CAT.finance, live: false },
  { id: "journal", label: "Journal", color: CAT.health, live: false },
  { id: "more", label: "More", color: "#8B93A7", live: false },
];

const tabs = [
  { id: "home", label: "Home" },
  { id: "habits", label: "Habits" },
  { id: "tasks", label: "Tasks" },
  { id: "family", label: "Share" },
];

function currentStreak(week) {
  let n = 0;
  for (let i = todayIdx; i >= 0; i--) { if (week[i]) n++; else break; }
  return n;
}

function TabGlyph({ id, active }) {
  const c = active ? "#F1ECFB" : "#7C7796";
  const glyphs = {
    home: <path d="M3 9l6-5 6 5v6a1 1 0 01-1 1h-3v-4H7v4H4a1 1 0 01-1-1V9z" fill="none" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />,
    habits: <path d="M9 3c1 2-2 2.5-2 4.5a2 2 0 004 0c0-.8-.5-1.3-.5-1.3s.8.4.8 1.8a2.3 2.3 0 01-4.6 0C6.7 6 8.5 5 9 3z" fill="none" stroke={c} strokeWidth="1.3" strokeLinejoin="round" />,
    tasks: <path d="M4 9.5l3 3 6-7" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    family: <><circle cx="6.5" cy="6.5" r="2" fill="none" stroke={c} strokeWidth="1.3" /><circle cx="12" cy="7.3" r="1.5" fill="none" stroke={c} strokeWidth="1.3" /><path d="M3 15c0-2 1.5-3.3 3.3-3.3S9.6 13 9.6 15" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" /><path d="M10.4 15c0-1.5.9-2.5 2.3-2.5S15 13.5 15 15" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 18 18">{glyphs[id]}</svg>;
}

function GridIcon({ id, color, live }) {
  const glyphs = {
    goals: <><circle cx="9" cy="9" r="5" fill="none" stroke="#fff" strokeWidth="1.4" /><circle cx="9" cy="9" r="1.8" fill="#fff" /></>,
    habits: <path d="M9 3c1 2-2 2.5-2 4.5a2 2 0 004 0c0-.8-.5-1.3-.5-1.3s.8.4.8 1.8a2.3 2.3 0 01-4.6 0C6.7 6 8.5 5 9 3z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />,
    tasks: <path d="M4 9.5l3 3 6-7" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    family: <><circle cx="6.5" cy="6.5" r="1.9" fill="none" stroke="#fff" strokeWidth="1.3" /><circle cx="12" cy="7.3" r="1.4" fill="none" stroke="#fff" strokeWidth="1.3" /><path d="M3.3 15c0-2 1.4-3.2 3.2-3.2S9.7 13 9.7 15" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" /></>,
    inbox: <path d="M3 11h3.5l1.5 2h2l1.5-2H15M4 6h10l1 5v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3l1-5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />,
    finance: <path d="M9 3v12M6 6.5h4.5a2 2 0 010 4H7a2 2 0 000 4h5" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />,
    journal: <path d="M5 3.5h8v11H5a1.2 1.2 0 01-1.2-1.2V4.7A1.2 1.2 0 015 3.5z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />,
    more: <><circle cx="5" cy="9" r="1.2" fill="#fff" /><circle cx="9" cy="9" r="1.2" fill="#fff" /><circle cx="13" cy="9" r="1.2" fill="#fff" /></>,
  };
  return (
    <div className="grid-icon" style={{ background: color, opacity: live ? 1 : 0.55 }}>
      <svg width="18" height="18" viewBox="0 0 18 18">{glyphs[id]}</svg>
    </div>
  );
}

function Onboarding({ step, setStep, lifeStage, setLifeStage, finish }) {
  return (
    <div className="ob-wrap">
      <p className="ob-brand">Nordra</p>
      {step === 0 && (
        <>
          <h2 className="ob-title">The structure behind your day.</h2>
          <p className="ob-body">One quiet place for what you need to remember, and — whenever you choose — what you need to coordinate with someone else.</p>
          <button className="ob-btn" onClick={() => setStep(1)}>Continue</button>
        </>
      )}
      {step === 1 && (
        <>
          <h2 className="ob-title">Where are you starting from?</h2>
          <p className="ob-body">This shapes what we show you first — you can change it any time.</p>
          <div className="ob-options">
            {[{ id: "solo", label: "Just me" }, { id: "partner", label: "Me + one other" }, { id: "caregiving", label: "Caregiving" }].map((s) => (
              <button key={s.id} className={`ob-option ${lifeStage === s.id ? "active" : ""}`} onClick={() => setLifeStage(s.id)}>{s.label}</button>
            ))}
          </div>
          <button className="ob-btn" disabled={!lifeStage} onClick={() => setStep(2)}>Continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="ob-title">Private by default.</h2>
          <p className="ob-body">Everything you add stays yours alone until you choose to share it. Nothing — finances, notes, appointments — becomes visible to anyone else automatically.</p>
          <button className="ob-btn" onClick={finish}>Enter Nordra</button>
        </>
      )}
      <div className="ob-dots">{[0, 1, 2].map((i) => <span key={i} className={`ob-dot ${i === step ? "active" : ""}`} />)}</div>
    </div>
  );
}

export default function NordraOS() {
  const [onboarded, setOnboarded] = useState(() => loadSaved("onboarded", false));
  const [obStep, setObStep] = useState(0);
  const [lifeStage, setLifeStage] = useState(() => loadSaved("lifeStage", ""));
  const [tab, setTab] = useState("home");
  const [gridScreen, setGridScreen] = useState(null);
  const [tasks, setTasks] = useState(() => loadSaved("tasks", initialTasks));
  const [habits, setHabits] = useState(() => loadSaved("habits", initialHabits));
  const [goals, setGoals] = useState(() => loadSaved("goals", initialGoals));
  const [inbox, setInbox] = useState(() => loadSaved("inbox", [
    { id: 1, source: "Email · DEWA", title: "Electricity bill — AED 340", detail: "Due September 15" },
    { id: 2, source: "Forwarded", title: "Car registration renewal", detail: "Expires October 3" },
  ]));
  const [points, setPoints] = useState(() => loadSaved("points", 784));
  const [challengeDone, setChallengeDone] = useState(() => loadSaved("challengeDone", false));
  const [toast, setToast] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newInboxTitle, setNewInboxTitle] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [people, setPeople] = useState(() => loadSaved("people", familyPeople));

  useEffect(() => saveOnChange("onboarded", onboarded), [onboarded]);
  useEffect(() => saveOnChange("lifeStage", lifeStage), [lifeStage]);
  useEffect(() => saveOnChange("tasks", tasks), [tasks]);
  useEffect(() => saveOnChange("habits", habits), [habits]);
  useEffect(() => saveOnChange("goals", goals), [goals]);
  useEffect(() => saveOnChange("inbox", inbox), [inbox]);
  useEffect(() => saveOnChange("points", points), [points]);
  useEffect(() => saveOnChange("challengeDone", challengeDone), [challengeDone]);
  useEffect(() => saveOnChange("people", people), [people]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const activeScreen = gridScreen || (tab === "home" ? null : tab);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks((t) => [{ id: Date.now(), title: newTaskTitle.trim(), time: "Added just now", cat: "personal", done: false, sharedWith: [] }, ...t]);
    setNewTaskTitle("");
    flash("Task added");
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits((h) => [...h, { id: Date.now(), name: newHabitName.trim(), week: [false, false, false, false, false, false, false] }]);
    setNewHabitName("");
    flash("Habit added");
  };

  const addGoal = () => {
    if (!newGoalName.trim()) return;
    setGoals((g) => [...g, { id: Date.now(), name: newGoalName.trim(), cat: "personal", pct: 0 }]);
    setNewGoalName("");
    flash("Goal added");
  };

  const personColors = ["#FF6F59", "#F2B134", "#2FBF9F", "#B24BF3", "#FF5C8A"];
  const addPerson = () => {
    if (!newPersonName.trim()) return;
    setPeople((p) => [...p, { id: "p" + Date.now(), name: newPersonName.trim(), initial: newPersonName.trim()[0].toUpperCase(), color: personColors[p.length % personColors.length], items: [] }]);
    setNewPersonName("");
    setShowAddPerson(false);
    flash(`Invite sent to ${newPersonName.trim()}`);
  };

  const toggleTaskDone = (id) => setTasks((t) => t.map((x) => {
    if (x.id !== id) return x;
    if (!x.done) setPoints((p) => p + 10);
    return { ...x, done: !x.done };
  }));
  const [sharePickerTaskId, setSharePickerTaskId] = useState(null);
  const openSharePicker = (taskId) => setSharePickerTaskId(taskId);
  const closeSharePicker = () => setSharePickerTaskId(null);
  const toggleShareWithPerson = (taskId, personId, personName) => {
    setTasks((t) => t.map((x) => {
      if (x.id !== taskId) return x;
      const has = (x.sharedWith || []).includes(personId);
      const next = has ? x.sharedWith.filter((id) => id !== personId) : [...(x.sharedWith || []), personId];
      if (!has) flash(`Shared with ${personName}`);
      return { ...x, sharedWith: next };
    }));
  };
  const removePerson = (personId, name) => {
    setPeople((p) => p.filter((x) => x.id !== personId));
    setTasks((t) => t.map((x) => ({ ...x, sharedWith: (x.sharedWith || []).filter((id) => id !== personId) })));
    flash(`Removed ${name}`);
  };

  const toggleHabit = (id, i) => setHabits((h) => h.map((x) => {
    if (x.id !== id) return x;
    const wasFalse = !x.week[i];
    if (wasFalse) setPoints((p) => p + 5);
    return { ...x, week: x.week.map((v, j) => (j === i ? !v : v)) };
  }));
  const bumpGoal = (id) => setGoals((g) => g.map((x) => (x.id === id ? { ...x, pct: Math.min(100, x.pct + 10) } : x)));
  const completeChallenge = () => { setChallengeDone(true); setPoints((p) => p + 20); flash("+20 points earned"); };
  const resolveInbox = (id) => { setInbox((i) => i.filter((x) => x.id !== id)); flash("Added to tasks"); };
  const addInboxItem = () => {
    if (!newInboxTitle.trim()) return;
    setInbox((i) => [{ id: Date.now(), source: "Manually added", title: newInboxTitle.trim(), detail: "" }, ...i]);
    setNewInboxTitle("");
    flash("Added to inbox");
  };

  const bestStreak = Math.max(...habits.map((h) => currentStreak(h.week)));

  const openGrid = (item) => {
    if (!item.live) { flash(`${item.label} — coming in a later phase`); return; }
    setGridScreen(item.id);
  };

  return (
    <div className="nordra-shell">
      <style>{STYLES}</style>

      <div className="phone">
        {!onboarded ? (
          <Onboarding step={obStep} setStep={setObStep} lifeStage={lifeStage} setLifeStage={setLifeStage} finish={() => setOnboarded(true)} />
        ) : (
        <>
        <div className="phone-header">
          <div className="hdr-left">
            <div className="avatar">D</div>
            <div>
              <p className="hdr-name">Diamond</p>
              <p className="hdr-sub">🔥 {bestStreak}-day streak</p>
            </div>
          </div>
          <div className="hdr-points">
            <span className="pts-dot" /> {points} pts
          </div>
        </div>

        {activeScreen === null && (
          <div className="screen">
            <div className="week-strip">
              {weekDates.map((w, i) => (
                <div key={i} className={`week-pill ${i === todayIdx ? "active" : ""}`}>
                  <span className="wp-day">{w.d[0]}</span>
                  <span className="wp-num">{w.n}</span>
                </div>
              ))}
            </div>

            <p className="greeting">Hello, Diamond.</p>
            <p className="greeting-sub">Wednesday, September 9</p>

            <div className="stat-row">
              <div className="stat-card" style={{ background: TINT.habits }}>
                <p className="stat-value" style={{ color: CAT.habits }}>{bestStreak}</p>
                <p className="stat-label">Day streak</p>
              </div>
              <div className="stat-card" style={{ background: TINT.tasks }}>
                <p className="stat-value" style={{ color: CAT.tasks }}>{tasks.filter((t) => !t.done).length}</p>
                <p className="stat-label">Tasks today</p>
              </div>
              <div className="stat-card" style={{ background: TINT.growth }}>
                <p className="stat-value" style={{ color: CAT.growth }}>{goals.filter((g) => g.pct >= 50).length}</p>
                <p className="stat-label">Goals on track</p>
              </div>
              <div className="stat-card" style={{ background: TINT.family }}>
                <p className="stat-value" style={{ color: CAT.family }}>{tasks.filter((t) => t.sharedWith && t.sharedWith.length > 0).length}</p>
                <p className="stat-label">Shared</p>
              </div>
            </div>

            <p className="section-label">Today</p>
            {tasks.filter((t) => !t.done).slice(0, 3).map((t) => (
              <div className="task-row" key={t.id}>
                <button className="box-check" onClick={() => toggleTaskDone(t.id)} />
                <span className="cat-dot" style={{ background: CAT[t.cat] }} />
                <div className="task-main"><span className="task-title">{t.title}</span><span className="task-time">{t.time}</span></div>
              </div>
            ))}

            <div className="suggestion">
              <p className="suggestion-source">From Nordra</p>
              <p className="suggestion-text">You have 45 minutes free between your 2 o'clock call and the gym — a good window for the bank task.</p>
            </div>

            <p className="section-label">Habits today</p>
            <div className="mini-habits">
              {habits.map((h) => (
                <div className="mini-habit-row" key={h.id}>
                  <button className={`dot-check ${h.week[todayIdx] ? "on" : ""}`} onClick={() => toggleHabit(h.id, todayIdx)}>
                    {h.week[todayIdx] && <svg width="9" height="7" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <span className="mini-habit-name">{h.name}</span>
                  <span className="mini-habit-streak">{currentStreak(h.week)}d</span>
                </div>
              ))}
            </div>

            <div className="challenge-card">
              <div className="challenge-top">
                <span className="challenge-tag">TODAY'S FOCUS · +20 pts</span>
              </div>
              <p className="challenge-title">Evening reflection</p>
              <p className="challenge-body">Write down one thing that went well today.</p>
              <button className={`challenge-btn ${challengeDone ? "done" : ""}`} onClick={completeChallenge} disabled={challengeDone}>
                {challengeDone ? "Completed ✓" : "Complete challenge"}
              </button>
            </div>

            <p className="section-label">Quick access</p>
            <div className="icon-grid">
              {gridItems.map((it) => (
                <button key={it.id} className="grid-item" onClick={() => openGrid(it)}>
                  <GridIcon id={it.id} color={it.color} live={it.live} />
                  <span className="grid-label">{it.label}</span>
                </button>
              ))}
            </div>

            <div className="privacy-strip">
              <svg width="12" height="12" viewBox="0 0 13 13"><rect x="3" y="6" width="7" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" /><path d="M4.5 6V4.3a2 2 0 014 0V6" fill="none" stroke="currentColor" strokeWidth="1.1" /></svg>
              Private by default — you choose what your circle sees
            </div>

            <button className="restart-link" onClick={() => { setOnboarded(false); setObStep(0); setLifeStage(""); }}>Restart tour</button>
          </div>
        )}

        {activeScreen === "goals" && (
          <div className="screen">
            <div className="screen-head"><p className="screen-title">Your goals</p><button className="back-btn" onClick={() => setGridScreen(null)}>Close</button></div>
            <div className="add-task-row">
              <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} placeholder="Add a goal…" />
              <button className="add-task-btn" onClick={addGoal}>Add</button>
            </div>
            {goals.map((g) => (
              <div className="goal-row" key={g.id}>
                <div className="goal-row-top">
                  <span className="goal-sq" style={{ background: CAT[g.cat] }} />
                  <span className="goal-name">{g.name}</span>
                  <span className="goal-pct">{g.pct}%</span>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: g.pct + "%", background: CAT[g.cat] }} /></div>
                <button className="bump-link" onClick={() => bumpGoal(g.id)}>+10%</button>
              </div>
            ))}
          </div>
        )}

        {(activeScreen === "habits" || tab === "habits") && activeScreen !== "tasks" && activeScreen !== "family" && activeScreen !== "goals" && activeScreen !== "inbox" && (
          <div className="screen">
            <div className="screen-head"><p className="screen-title">Habits</p>{gridScreen && <button className="back-btn" onClick={() => setGridScreen(null)}>Close</button>}</div>
            <div className="add-task-row">
              <input value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabit()} placeholder="Add a habit…" />
              <button className="add-task-btn" onClick={addHabit}>Add</button>
            </div>
            {habits.map((h) => (
              <div className="habit-card" key={h.id}>
                <div className="habit-head"><span className="habit-name">{h.name}</span><span className="habit-streak">🔥 {currentStreak(h.week)}d</span></div>
                <div className="habit-week">
                  {weekDates.map((w, i) => (
                    <button key={i} className={`dot-check ${h.week[i] ? "on" : ""} ${i === todayIdx ? "ring" : ""}`} onClick={() => toggleHabit(h.id, i)}>
                      {h.week[i] && <svg width="9" height="7" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeScreen === "tasks" || tab === "tasks") && activeScreen !== "family" && activeScreen !== "goals" && activeScreen !== "habits" && activeScreen !== "inbox" && (
          <div className="screen">
            <div className="screen-head"><p className="screen-title">Tasks</p>{gridScreen && <button className="back-btn" onClick={() => setGridScreen(null)}>Close</button>}</div>
            <p className="greeting-sub" style={{ marginTop: -8 }}>{tasks.filter((t) => !t.done).length} open · {tasks.filter((t) => t.done).length} done this week</p>
            <div className="add-task-row">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task…"
              />
              <button className="add-task-btn" onClick={addTask}>Add</button>
            </div>
            {tasks.map((t) => (
              <div className="task-row" key={t.id}>
                <button className={`box-check ${t.done ? "on" : ""}`} style={t.done ? { background: CAT[t.cat], borderColor: CAT[t.cat] } : {}} onClick={() => toggleTaskDone(t.id)}>
                  {t.done && <svg width="9" height="7" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
                <span className="cat-dot" style={{ background: CAT[t.cat] }} />
                <div className="task-main"><span className={`task-title ${t.done ? "done" : ""}`}>{t.title}</span><span className="task-time">{t.time}</span></div>
                <button className={`share-pill ${t.sharedWith && t.sharedWith.length > 0 ? "on" : ""}`} onClick={() => openSharePicker(t.id)}>
                  {t.sharedWith && t.sharedWith.length > 0 ? `Shared · ${t.sharedWith.length}` : "Share"}
                </button>
              </div>
            ))}
          </div>
        )}

        {(activeScreen === "family" || tab === "family") && activeScreen !== "tasks" && activeScreen !== "goals" && activeScreen !== "habits" && activeScreen !== "inbox" && (
          <div className="screen">
            <div className="screen-head"><p className="screen-title">Share</p>{gridScreen && <button className="back-btn" onClick={() => setGridScreen(null)}>Close</button>}</div>
            <p className="greeting-sub" style={{ marginTop: -8 }}>Your circle — family, a partner, a friend, anyone you've chosen to share with.</p>

            {!showAddPerson ? (
              <button className="add-task-btn" style={{ width: "100%", padding: "10px 0", marginBottom: 16 }} onClick={() => setShowAddPerson(true)}>+ Add someone</button>
            ) : (
              <div className="add-task-row">
                <input value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPerson()} placeholder="Their name…" />
                <button className="add-task-btn" onClick={addPerson}>Invite</button>
              </div>
            )}

            <div className="fam-person">
              <div className="fam-head"><span className="fam-avatar" style={{ background: CAT.personal }}>D</span>Diamond</div>
              {tasks.filter((t) => t.sharedWith && t.sharedWith.length > 0).length === 0 && <p className="empty-note">Nothing shared yet.</p>}
              {tasks.filter((t) => t.sharedWith && t.sharedWith.length > 0).map((t) => (
                <div className="fam-item" key={t.id}>
                  <span className="cat-dot" style={{ background: CAT[t.cat] }} />
                  {t.title}
                  <span className="task-time">
                    {t.sharedWith.map((pid) => people.find((p) => p.id === pid)?.name).filter(Boolean).join(", ")}
                  </span>
                </div>
              ))}
            </div>
            {people.map((p) => (
              <div className="fam-person" key={p.id}>
                <div className="fam-head">
                  <span className="fam-avatar" style={{ background: p.color }}>{p.initial}</span>
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <button className="remove-person-btn" onClick={() => removePerson(p.id, p.name)}>Remove</button>
                </div>
                {p.items.length === 0 && <p className="empty-note">Waiting for them to accept and share something.</p>}
                {p.items.map((it, i) => <div className="fam-item" key={i}><span className="cat-dot" style={{ background: p.color }} />{it.title}<span className="task-time">{it.meta}</span></div>)}
              </div>
            ))}
            <p className="empty-note" style={{ marginTop: 10 }}>Only what's shared appears here — everything else stays private.</p>
          </div>
        )}

        {activeScreen === "inbox" && (
          <div className="screen">
            <div className="screen-head"><p className="screen-title">Inbox</p><button className="back-btn" onClick={() => setGridScreen(null)}>Close</button></div>
            <p className="greeting-sub" style={{ marginTop: -8 }}>In the real app, items land here automatically when you forward an email. For now, add one manually to test the flow:</p>
            <div className="add-task-row">
              <input value={newInboxTitle} onChange={(e) => setNewInboxTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addInboxItem()} placeholder="e.g. Car insurance renewal…" />
              <button className="add-task-btn" onClick={addInboxItem}>Add</button>
            </div>
            {inbox.length === 0 && <p className="empty-note">Nothing waiting.</p>}
            {inbox.map((it) => (
              <div className="inbox-row" key={it.id}>
                <p className="inbox-source">{it.source}</p>
                <p className="task-title">{it.title}</p>
                {it.detail && <p className="task-time" style={{ marginBottom: 8 }}>{it.detail}</p>}
                <button className="challenge-btn small" onClick={() => resolveInbox(it.id)}>Add to tasks</button>
              </div>
            ))}
          </div>
        )}

        {sharePickerTaskId !== null && (() => {
          const task = tasks.find((x) => x.id === sharePickerTaskId);
          if (!task) return null;
          return (
            <div className="modal-overlay" onClick={closeSharePicker}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <p className="modal-title">Share "{task.title}"</p>
                <p className="greeting-sub" style={{ marginTop: -4, marginBottom: 14 }}>Choose who in your Circle can see this — family, a partner, a friend, anyone you've added.</p>
                {people.length === 0 ? (
                  <>
                    <p className="empty-note" style={{ marginBottom: 14 }}>You haven't added anyone yet.</p>
                    <button className="add-task-btn" style={{ width: "100%", padding: "10px 0" }} onClick={() => { closeSharePicker(); setGridScreen("family"); setShowAddPerson(true); }}>+ Add someone</button>
                  </>
                ) : (
                  people.map((p) => {
                    const checked = (task.sharedWith || []).includes(p.id);
                    return (
                      <button key={p.id} className="person-picker-row" onClick={() => toggleShareWithPerson(task.id, p.id, p.name)}>
                        <span className="fam-avatar" style={{ background: p.color }}>{p.initial}</span>
                        <span style={{ flex: 1, textAlign: "left" }}>{p.name}</span>
                        <span className={`picker-check ${checked ? "on" : ""}`}>{checked && "✓"}</span>
                      </button>
                    );
                  })
                )}
                <button className="back-btn" style={{ marginTop: 14 }} onClick={closeSharePicker}>Done</button>
              </div>
            </div>
          );
        })()}

        <div className="tab-bar">
          {tabs.map((t) => (
            <button key={t.id} className={`tab-btn ${tab === t.id && !gridScreen ? "active" : ""}`} onClick={() => { setTab(t.id); setGridScreen(null); }}>
              <TabGlyph id={t.id} active={tab === t.id && !gridScreen} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {toast && <div className="toast">{toast}</div>}
        </>
        )}
      </div>
    </div>
  );
}

const STYLES = `
${FONT_IMPORT}

.nordra-shell {
  --ink: #F1ECFB;
  --muted: #9691B3;
  --line: rgba(255,255,255,0.09);
  --surface: #201A38;
  --surface2: #251E42;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 760px;
  width: 100%;
  padding: 30px 16px;
  background: linear-gradient(160deg, #0A0716 0%, #1D1140 42%, #451A3C 74%, #7A3826 100%);
  font-family: 'Sora', sans-serif;
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
}
.nordra-shell * { box-sizing: border-box; }
.nordra-shell button { font-family: 'Sora', sans-serif; cursor: pointer; }
.nordra-shell button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .nordra-shell * { animation: none !important; transition: none !important; } }

.phone {
  position: relative;
  width: 380px;
  max-width: 100%;
  height: 700px;
  background: #150F26;
  border-radius: 34px;
  box-shadow: 0 30px 70px rgba(0,0,0,0.55), 0 0 0 8px rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.phone-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 14px; }
.hdr-left { display: flex; align-items: center; gap: 10px; }
.avatar { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #6C5CE7, #FF6F59); color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; }
.hdr-name { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0; }
.hdr-sub { font-size: 11px; color: var(--muted); margin: 1px 0 0 0; }
.hdr-points { font-size: 12px; font-weight: 700; color: var(--ink); background: rgba(255,255,255,0.07); padding: 6px 10px; border-radius: 20px; display: flex; align-items: center; gap: 5px; }
.pts-dot { width: 6px; height: 6px; border-radius: 50%; background: #F2B134; }

.screen { flex: 1; overflow-y: auto; padding: 4px 20px 16px; }

.week-strip { display: flex; justify-content: space-between; margin-bottom: 18px; }
.week-pill { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 36px; padding: 8px 0; border-radius: 14px; color: var(--muted); font-size: 11px; }
.week-pill.active { background: linear-gradient(135deg, #6C5CE7, #FF6F59); color: #fff; }
.wp-num { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; }

.greeting { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin: 0; color: var(--ink); animation: rise 0.4s ease-out; }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.greeting-sub { font-size: 12.5px; color: var(--muted); margin: 2px 0 16px 0; }

.stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
.stat-card { border-radius: 14px; padding: 12px 14px; }
.stat-value { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 20px; margin: 0; }
.stat-label { font-size: 10.5px; color: var(--ink); opacity: 0.65; margin: 1px 0 0 0; }

.suggestion { border-radius: 16px; background: rgba(108,92,231,0.14); padding: 14px 16px; margin: 4px 0 20px 0; }
.suggestion-source { font-size: 10.5px; color: #6C5CE7; font-weight: 700; margin: 0 0 5px 0; }
.suggestion-text { font-family: 'Space Grotesk', sans-serif; font-size: 13.5px; line-height: 1.5; margin: 0; color: var(--ink); }

.mini-habits { background: var(--surface); border-radius: 16px; padding: 4px 14px; margin-bottom: 20px; }
.mini-habit-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.mini-habit-row:last-child { border-bottom: none; }
.mini-habit-name { flex: 1; font-size: 12.5px; color: var(--ink); }
.mini-habit-streak { font-size: 10.5px; color: #2FBF9F; font-weight: 700; }

.challenge-card { background: linear-gradient(135deg, #3B2378, #9C3B6E); border-radius: 20px; padding: 18px; color: #fff; margin-bottom: 20px; }
.challenge-tag { font-size: 10.5px; opacity: 0.8; letter-spacing: 0.3px; }
.challenge-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; margin: 8px 0 4px 0; }
.challenge-body { font-size: 12.5px; opacity: 0.85; margin: 0 0 14px 0; line-height: 1.5; }
.challenge-btn { background: #F1ECFB; color: #241B4E; border: none; font-weight: 700; font-size: 12.5px; padding: 10px 16px; border-radius: 12px; width: 100%; transition: transform 0.15s ease; }
.challenge-btn:hover { transform: translateY(-1px); }
.challenge-btn.done { background: rgba(255,255,255,0.25); color: #fff; }
.challenge-btn.small { width: auto; padding: 8px 14px; }

.section-label { font-size: 12px; font-weight: 700; color: var(--ink); margin: 0 0 10px 2px; }
.icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
.grid-item { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.grid-icon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.grid-label { font-size: 10.5px; color: var(--ink); }

.privacy-strip { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--muted); background: rgba(255,255,255,0.06); padding: 9px 12px; border-radius: 12px; }

.screen-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-top: 4px; }
.screen-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 19px; color: var(--ink); margin: 0; }
.back-btn { background: rgba(255,255,255,0.08); border: none; color: var(--ink); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 10px; }

.goal-row { margin-bottom: 16px; }
.goal-row-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.goal-sq { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.goal-name { font-size: 13.5px; font-weight: 600; color: var(--ink); flex: 1; }
.goal-pct { font-size: 12px; color: var(--muted); }
.bar-track { height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.bump-link { background: none; border: none; color: var(--muted); font-size: 10.5px; margin-top: 4px; padding: 0; text-decoration: underline; }

.habit-card { background: var(--surface); border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
.habit-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.habit-name { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.habit-streak { font-size: 11.5px; color: var(--muted); }
.habit-week { display: flex; justify-content: space-between; }
.dot-check { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.22); background: transparent; display: flex; align-items: center; justify-content: center; }
.dot-check.on { background: #2FBF9F; border-color: #2FBF9F; }
.dot-check.ring { box-shadow: 0 0 0 2.5px #6C5CE7; }

.add-task-row { display: flex; gap: 8px; margin: 4px 0 14px 0; }
.add-task-row input { flex: 1; background: var(--surface); border: 1px solid var(--line); color: var(--ink); font-size: 13px; padding: 10px 12px; border-radius: 12px; font-family: 'Sora', sans-serif; }
.add-task-row input::placeholder { color: var(--muted); }
.add-task-row input:focus { outline: none; border-color: #6C5CE7; }
.add-task-btn { background: linear-gradient(135deg, #6C5CE7, #FF6F59); color: #fff; border: none; font-weight: 700; font-size: 12.5px; padding: 0 16px; border-radius: 12px; }

.task-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.box-check { width: 20px; height: 20px; border-radius: 7px; border: 1.5px solid rgba(255,255,255,0.22); background: transparent; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.task-main { flex: 1; display: flex; flex-direction: column; }
.task-title { font-size: 13.5px; color: var(--ink); }
.task-title.done { opacity: 0.4; text-decoration: line-through; }
.task-time { font-size: 11px; color: var(--muted); }
.share-pill { font-size: 10.5px; border: 1px solid var(--line); background: rgba(255,255,255,0.05); color: var(--muted); padding: 5px 9px; border-radius: 10px; flex-shrink: 0; }
.share-pill.on { background: rgba(255,111,89,0.16); border-color: #FF6F59; color: #FF6F59; font-weight: 700; }

.fam-person { margin-bottom: 16px; }
.fam-head { display: flex; align-items: center; gap: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: var(--ink); margin-bottom: 8px; }
.remove-person-btn { background: none; border: 1px solid var(--line); color: var(--muted); font-family: 'Sora', sans-serif; font-weight: 400; font-size: 10.5px; padding: 5px 10px; border-radius: 10px; }
.remove-person-btn:hover { border-color: #FF6F59; color: #FF6F59; }
.fam-avatar { width: 24px; height: 24px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.fam-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--ink); padding: 6px 0; }
.fam-item .task-time { margin-left: auto; }
.empty-note { font-size: 12px; color: var(--muted); font-style: italic; }

.inbox-row { background: var(--surface); border-radius: 14px; padding: 14px; margin-bottom: 10px; }
.inbox-source { font-size: 10.5px; color: var(--muted); margin: 0 0 4px 0; }

.restart-link { background: none; border: none; color: var(--muted); font-size: 10.5px; text-decoration: underline; text-underline-offset: 3px; padding: 0; margin: 4px 0 6px; }

.ob-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 32px 26px; }
.ob-brand { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 20px; color: #6C5CE7; margin: 0 0 22px 0; }
.ob-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; color: var(--ink); margin: 0 0 12px 0; line-height: 1.25; }
.ob-body { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin: 0 0 24px 0; }
.ob-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
.ob-option { background: var(--surface); border: 1.5px solid rgba(255,255,255,0.10); color: var(--ink); padding: 12px 14px; border-radius: 12px; text-align: left; font-size: 13.5px; transition: border-color 0.2s ease, background 0.2s ease; }
.ob-option:hover { border-color: #6C5CE7; }
.ob-option.active { border-color: #6C5CE7; background: rgba(108,92,231,0.16); font-weight: 600; }
.ob-btn { background: linear-gradient(135deg, #6C5CE7, #FF6F59); color: #fff; border: none; padding: 13px 22px; border-radius: 12px; font-size: 14px; font-weight: 700; transition: transform 0.15s ease, opacity 0.15s ease; }
.ob-btn:hover { transform: translateY(-1px); }
.ob-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.ob-dots { display: flex; gap: 6px; margin-top: 26px; }
.ob-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: background 0.2s ease; }
.ob-dot.active { background: #6C5CE7; }

.modal-overlay { position: absolute; inset: 0; background: rgba(5,3,12,0.6); display: flex; align-items: center; justify-content: center; z-index: 30; animation: fadeIn 0.2s ease-out; padding: 24px; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-card { background: var(--surface2); border: 1px solid var(--line); border-radius: 18px; padding: 20px; width: 100%; max-width: 300px; animation: rise 0.2s ease-out; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.modal-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink); margin: 0 0 4px 0; }
.person-picker-row { display: flex; align-items: center; gap: 10px; width: 100%; background: none; border: none; padding: 10px 4px; color: var(--ink); font-size: 13.5px; border-bottom: 1px solid var(--line); }
.person-picker-row:last-of-type { border-bottom: none; }
.picker-check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; flex-shrink: 0; }
.picker-check.on { background: #FF6F59; border-color: #FF6F59; }
.remove-person-btn { margin-left: auto; background: none; border: none; color: var(--muted); font-size: 11px; padding: 4px 8px; text-decoration: underline; }

.tab-bar { display: flex; border-top: 1px solid var(--line); padding: 10px 8px 14px; }
.tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; color: #7C7796; font-size: 10px; }
.tab-btn.active { color: var(--ink); font-weight: 700; }

.toast { position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); background: #2E2652; color: #fff; font-size: 12px; padding: 9px 16px; border-radius: 20px; animation: toastIn 0.2s ease-out; white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
@keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

@media (max-width: 460px) {
  .phone { width: 100%; height: 640px; border-radius: 22px; }
}
`;
