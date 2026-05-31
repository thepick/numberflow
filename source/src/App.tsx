import { useState, useEffect, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, BookOpen, Play, ArrowLeft, X, Sparkles, Check,
  ChevronLeft, ChevronRight, Trophy, RefreshCw,
} from "lucide-react";
import {
  STAGES, STRATEGIES, StageId, Strategy, MathQuestion,
  generateQuestionPoolForStrategy,
} from "./strategies";
import {
  FactStatsMap, chooseNextFact, getPriorityReviewQuestions,
  getStrategyAdaptiveMastery, mergeUniqueQuestions, updateFactStats,
} from "./adaptiveEngine";

// ─── Types ──────────────────────────────────────────────

type StrategyStarAwards = { [key: number]: number };

interface RoundStarResult {
  strategyId: number; earnedStars: number; previousBestStars: number;
  bestStars: number; improved: boolean; reachedThreeStars: boolean;
}

interface SavedProgress {
  viewedStrategyIds: number[]; masteredStrategyIds: number[];
  stars: number; strategyStars?: StrategyStarAwards;
  speedTarget?: number; bestStreaks?: { [key: number]: number };
  bestSpeeds?: { [key: number]: number }; factStats?: FactStatsMap;
}

interface ConfettiPiece {
  id: number; left: number; delay: number; duration: number;
  size: number; color: string; drift: number; spin: number;
}

// ─── Constants ──────────────────────────────────────────

const STARS_PER_STRATEGY = 3;
const CORRECT_ANSWER_HOLD_MS = 275;
const REVEALED_ANSWER_HOLD_MS = 225;
const QUESTION_REVEAL_GRACE = 3.75;
const WRONG_BURST_WINDOW_MS = 9000;
const WRONG_BURST_THRESHOLD = 2;
const SLOW_DOWN_BANNER_MS = 1300;
const SLOW_DOWN_LOCK_MS = 1500;
const clampStars = (v: number) => Math.max(0, Math.min(STARS_PER_STRATEGY, v));
const countStars = (a: StrategyStarAwards) =>
  Object.values(a).reduce((t, v) => t + clampStars(v || 0), 0);

const getStarsForScore = (score: number, target: number) => {
  if (score >= target) return 3;
  if (score >= Math.max(6, Math.round(target * 0.6))) return 2;
  if (score >= Math.max(3, Math.round(target * 0.3))) return 1;
  return 0;
};

// ─── Certificate Print ──────────────────────────────────

const CERTIFICATE_LOGO = "certificates/mental-math-journey-icon.png";

interface CertificateTheme {
  background: string;
  ink: string;
  accent: string;
  medallionTopMm: number;
  medallionSizeMm: number;
  dateBottomMm: number;
  dateWidthMm: number;
}

interface CertificateRequest {
  stageId: StageId;
  stageName: string;
  earnedStars: number;
  maxStars: number;
}

const CERTIFICATE_THEMES: { [key: number]: CertificateTheme } = {
  [StageId.StarterIsland]: {
    background: "certificates/starter-island.png",
    ink: "#173a78",
    accent: "#d97706",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
  [StageId.DoublesForest]: {
    background: "certificates/doubles-forest.png",
    ink: "#34511b",
    accent: "#b37b0f",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
  [StageId.BridgeTown]: {
    background: "certificates/bridge-town.png",
    ink: "#174387",
    accent: "#c47b12",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
  [StageId.FamilyVillage]: {
    background: "certificates/family-village.png",
    ink: "#5b2f7f",
    accent: "#d97706",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
  [StageId.BigNumberMountain]: {
    background: "certificates/big-number-mountain.png",
    ink: "#7b2f54",
    accent: "#c47b12",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
  [StageId.TheSummit]: {
    background: "certificates/the-summit.png",
    ink: "#173a78",
    accent: "#b37b0f",
    medallionTopMm: 6.6,
    medallionSizeMm: 36.4,
    dateBottomMm: 14.7,
    dateWidthMm: 90,
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAbsoluteCertificateAssetUrl(path: string): string {
  return new URL(path, new URL("./", window.location.href)).href;
}

function getCertificateMaxStars(stageNum: number): number {
  return STRATEGIES.filter((strategy) => strategy.stageId === stageNum).length * STARS_PER_STRATEGY;
}

function normalizeCertificateStars(earnedStars: number, maxStars: number): { earnedStars: number; maxStars: number } {
  const normalizedMax = Math.max(0, Math.round(maxStars));
  const normalizedEarned = Math.min(normalizedMax, Math.max(0, Math.round(earnedStars)));
  return { earnedStars: normalizedEarned, maxStars: normalizedMax };
}

function formatCertificateStars(earnedStars: number, maxStars: number): string {
  const label = maxStars === 1 ? "Star" : "Stars";
  return `${earnedStars} of ${maxStars} ${label} Earned`;
}

function printCertificate(
  stageNum: number, stageName: string,
  earnedStars: number, maxStars: number, userName: string,
) {
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow popups to print!"); return; }

  const theme = CERTIFICATE_THEMES[stageNum] || CERTIFICATE_THEMES[StageId.StarterIsland];
  const trimmedName = userName.trim();
  if (!trimmedName) { alert("Please enter a name for the certificate."); return; }
  const fallbackMaxStars = getCertificateMaxStars(stageNum);
  const certificateStars = normalizeCertificateStars(earnedStars, maxStars || fallbackMaxStars);
  const safeName = escapeHtml(trimmedName);
  const safeChapter = escapeHtml(`Chapter ${stageNum}: ${stageName}`);
  const safeDate = escapeHtml(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
  const safeBackgroundUrl = escapeHtml(getAbsoluteCertificateAssetUrl(theme.background));
  const safeLogoUrl = escapeHtml(getAbsoluteCertificateAssetUrl(CERTIFICATE_LOGO));
  const safeStarsText = escapeHtml(formatCertificateStars(certificateStars.earnedStars, certificateStars.maxStars));
  const nameClass = safeName.length > 20 ? " xsmall" : safeName.length > 14 ? " small" : "";

  w.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Certificate</title><style>
    @page{size:A4 landscape;margin:0}
    *{box-sizing:border-box}
    html,body{width:100%;min-height:100%;margin:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{display:flex;align-items:center;justify-content:center;padding:16px}
    .certificate-page{position:relative;width:297mm;height:210mm;overflow:hidden;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.18)}
    .certificate-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .overlay{position:absolute;left:50%;transform:translateX(-50%);text-align:center;color:${theme.ink};text-shadow:0 2px 8px rgba(255,255,255,.64),0 1px 1px rgba(255,255,255,.8)}
    .top-brand{top:3.2mm;width:178mm;padding:1.5mm 8mm;border-radius:999mm;background:linear-gradient(90deg,rgba(12,34,80,.03),rgba(12,34,80,.84),rgba(12,34,80,.03));font-size:4.45mm;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:#fff5cf;text-shadow:0 1px 0 #68460b,0 3px 10px rgba(0,0,0,.58);z-index:4}
    .medallion-logo-frame{top:${theme.medallionTopMm}mm;width:${theme.medallionSizeMm}mm;height:${theme.medallionSizeMm}mm;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(circle at 50% 42%,#fffdf2 0%,#fff1b5 62%,#f3c853 100%);box-shadow:inset 0 0 0 .65mm rgba(255,255,255,.86),inset 0 0 0 1.45mm rgba(183,110,16,.9),0 1.2mm 4mm rgba(80,46,10,.26);z-index:3}
    .medallion-logo-frame img{width:100%;height:100%;object-fit:contain;object-position:center center;display:block}
    .chapter-title{top:52mm;width:174mm;padding:2.1mm 8mm;border-radius:999mm;font-family:Georgia,'Times New Roman',serif;font-size:8.6mm;font-weight:900;line-height:1.1;color:#fff;background:linear-gradient(90deg,rgba(9,30,76,0),rgba(9,30,76,.88),rgba(9,30,76,0));text-shadow:0 2px 8px rgba(0,0,0,.52),0 1px 0 rgba(0,0,0,.42);z-index:2}
    .awarded-to{top:74mm;font-size:5.9mm;font-weight:800;color:${theme.ink}}
    .student-name{top:83mm;width:215mm;font-family:Georgia,'Times New Roman',serif;font-size:21mm;font-weight:900;line-height:1;color:${theme.ink};text-shadow:0 2px 0 #fff,0 5px 12px rgba(15,23,42,.2)}
    .student-name.small{font-size:17mm}.student-name.xsmall{font-size:14mm}
    .stars-earned{top:108mm;font-size:7.2mm;font-weight:900;color:${theme.accent};text-shadow:0 2px 6px rgba(255,255,255,.7)}
    .date-field{bottom:${theme.dateBottomMm}mm;width:${theme.dateWidthMm}mm;height:10mm;display:flex;align-items:center;justify-content:center;font-family:Georgia,'Times New Roman',serif;font-size:5.7mm;font-weight:900;color:${theme.ink};text-shadow:0 1px 0 #fff,0 2px 7px rgba(255,255,255,.72)}
    @media print{html,body{width:297mm;height:210mm;background:#fff;padding:0}.certificate-page{width:297mm;height:210mm;box-shadow:none}}
  </style></head><body><div class="certificate-page">
    <img class="certificate-bg" src="${safeBackgroundUrl}" alt="">
    <div class="overlay top-brand">MENTAL MATH JOURNEY</div>
    <div class="overlay medallion-logo-frame" aria-hidden="true"><img src="${safeLogoUrl}" alt=""></div>
    <div class="overlay chapter-title">${safeChapter}</div>
    <div class="overlay awarded-to">Awarded to</div>
    <div class="overlay student-name${nameClass}">${safeName}</div>
    <div class="overlay stars-earned">${safeStarsText}</div>
    <div class="overlay date-field">${safeDate}</div>
  </div><script>
    (function(){
      function printReady(){ setTimeout(function(){ window.focus(); window.print(); }, 350); }
      var imgs = Array.prototype.slice.call(document.images || []);
      var imagePromise = Promise.all(imgs.map(function(img){
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve){ img.onload = resolve; img.onerror = resolve; });
      }));
      var fontPromise = document.fonts && document.fonts.ready ? document.fonts.ready.catch(function(){}) : Promise.resolve();
      Promise.all([imagePromise, fontPromise]).then(printReady).catch(printReady);
    }());
  </script></body></html>`);
  w.document.close();
}

// ─── App ────────────────────────────────────────────────

export default function App() {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const factStatsRef = useRef<FactStatsMap>({});
  const currentQuestionRef = useRef<MathQuestion | null>(null);
  const questionStartedAtRef = useRef<number>(Date.now());
  const answerLockedRef = useRef<boolean>(false);
  const isRoundActiveRef = useRef<boolean>(false);
  const roundCompletedRef = useRef<boolean>(false);
  const countdownTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundAttemptsRef = useRef<number>(0);
  const roundCorrectAttemptsRef = useRef<number>(0);
  const attemptsSinceQuickReviewRef = useRef<number>(0);
  const recentReviewFactIdsRef = useRef<string[]>([]);
  const currentStrategyFactsRef = useRef<MathQuestion[]>([]);
  const questionPoolRef = useRef<MathQuestion[]>([]);
  const confettiClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incorrectFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswerCheckFrameRef = useRef<number | null>(null);
  const pendingAnswerCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswerCheckTokenRef = useRef<number>(0);
  const hasRecordedWrongForQuestionRef = useRef<boolean>(false);
  const questionRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowDownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputCooldownQuestionIdRef = useRef<string | null>(null);
  const inputCooldownActiveRef = useRef<boolean>(false);
  const wrongBurstCountRef = useRef<number>(0);
  const wrongBurstStartRef = useRef<number>(0);
  const answerRevealActiveRef = useRef<boolean>(false);
  const userAnswerRef = useRef<string>("");

  // State — progress
  const [currentStageId, setCurrentStageId] = useState<StageId>(StageId.StarterIsland);
  const [viewedStrategyIds, setViewedStrategyIds] = useState<number[]>([1]);
  const [masteredStrategyIds, setMasteredStrategyIds] = useState<number[]>([]);
  const [stars, setStars] = useState<number>(0);
  const [strategyStars, setStrategyStars] = useState<StrategyStarAwards>({});
  const [lastRoundStarResult, setLastRoundStarResult] = useState<RoundStarResult | null>(null);


  // State — settings
  const [speedTarget, setSpeedTarget] = useState<number>(20);
  const [bestStreaks, setBestStreaks] = useState<{ [key: number]: number }>({});
  const [bestSpeeds, setBestSpeeds] = useState<{ [key: number]: number }>({});

  // State — practice round
  const [activeStrategyRound, setActiveStrategyRound] = useState<Strategy | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [roundAttempts, setRoundAttempts] = useState<number>(0);
  const [roundCorrectAttempts, setRoundCorrectAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [factStats, setFactStats] = useState<FactStatsMap>({});
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreakRound, setBestStreakRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [showSlowDown, setShowSlowDown] = useState<boolean>(false);
  const [isInputCooldown, setIsInputCooldown] = useState<boolean>(false);
  const [answerReveal, setAnswerReveal] = useState<{ questionId: string; text: string } | null>(null);

  // State — UI
  const [isAnimatingCorrect, setIsAnimatingCorrect] = useState<boolean>(false);
  const [isAnimatingIncorrect, setIsAnimatingIncorrect] = useState<boolean>(false);
  const [sparklesList, setSparklesList] = useState<{ id: number; x: number; y: number }[]>([]);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [encouragingText, setEncouragingText] = useState<string>("Let's go!");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showLessonModal, setShowLessonModal] = useState<Strategy | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [certificateNameInput, setCertificateNameInput] = useState<string>("");
  const [certificateRequest, setCertificateRequest] = useState<CertificateRequest | null>(null);
  const [showAllDone, setShowAllDone] = useState<boolean>(false);

  const isTimedQuizInProgress = !!activeStrategyRound && !roundCompleted && (isRoundActive || countdownValue !== null);

  useEffect(() => { userAnswerRef.current = userAnswer; }, [userAnswer]);
  useEffect(() => { isRoundActiveRef.current = isRoundActive; }, [isRoundActive]);

  // ─── Derived ──────────────────────────────────────────

  const activeStage = STAGES.find((s) => s.id === currentStageId) || STAGES[0];
  const activeStrategies = STRATEGIES.filter((s) => s.stageId === currentStageId);
  const chapterProgress = `${activeStrategies.filter((s) => masteredStrategyIds.includes(s.id)).length}/${activeStrategies.length}`;

  const getStrategyStarCount = (id: number) => clampStars(strategyStars[id] || 0);
  const getStageEarnedStars = (stageId: StageId): number =>
    STRATEGIES.filter((s) => s.stageId === stageId).reduce((total, strategy) => total + getStrategyStarCount(strategy.id), 0);
  const getStageMaxStars = (stageId: StageId): number =>
    STRATEGIES.filter((s) => s.stageId === stageId).length * STARS_PER_STRATEGY;
  const isStageUnlocked = (stageId: StageId): boolean => {
    if (stageId === StageId.StarterIsland) return true;
    const prev = STAGES.find((s) => s.id === stageId - 1);
    if (!prev) return true;
    return STRATEGIES.filter((s) => s.stageId === prev.id).every((s) => masteredStrategyIds.includes(s.id));
  };

  const openCertificateModal = (stageId: StageId, stageName: string) => {
    const certificateStars = normalizeCertificateStars(getStageEarnedStars(stageId), getStageMaxStars(stageId));
    setCertificateRequest({
      stageId,
      stageName,
      earnedStars: certificateStars.earnedStars,
      maxStars: certificateStars.maxStars,
    });
    setCertificateNameInput("");
    setShowCertificateModal(true);
  };

  const handlePrintCertificateFromModal = () => {
    if (!certificateRequest) return;
    const trimmedName = certificateNameInput.trim();
    if (!trimmedName) return;
    printCertificate(
      certificateRequest.stageId,
      certificateRequest.stageName,
      certificateRequest.earnedStars,
      certificateRequest.maxStars,
      trimmedName,
    );
    setShowCertificateModal(false);
    setCertificateNameInput("");
  };

  // ─── LocalStorage ─────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mental_math_journey_v2");
      if (!raw) return;
      const p: SavedProgress = JSON.parse(raw);
      if (p.viewedStrategyIds) setViewedStrategyIds(p.viewedStrategyIds);
      if (p.masteredStrategyIds) setMasteredStrategyIds(p.masteredStrategyIds);
      if (p.strategyStars) { setStrategyStars(p.strategyStars); setStars(countStars(p.strategyStars)); }
      else if (typeof p.stars === "number") setStars(p.stars);
      if (typeof p.speedTarget === "number") setSpeedTarget(p.speedTarget);
      if (p.bestStreaks) setBestStreaks(p.bestStreaks);
      if (p.bestSpeeds) setBestSpeeds(p.bestSpeeds);
      if (p.factStats) { setFactStats(p.factStats); factStatsRef.current = p.factStats; }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { factStatsRef.current = factStats; }, [factStats]);

  useEffect(() => () => {
    countdownTimersRef.current.forEach(clearTimeout);
    if (confettiClearTimerRef.current) clearTimeout(confettiClearTimerRef.current);
    if (correctFeedbackTimerRef.current) clearTimeout(correctFeedbackTimerRef.current);
    if (incorrectFeedbackTimerRef.current) clearTimeout(incorrectFeedbackTimerRef.current);
    if (pendingAnswerCheckFrameRef.current !== null) cancelAnimationFrame(pendingAnswerCheckFrameRef.current);
    if (pendingAnswerCheckTimerRef.current) clearTimeout(pendingAnswerCheckTimerRef.current);
    if (questionRevealTimerRef.current) clearTimeout(questionRevealTimerRef.current);
    if (correctAdvanceTimerRef.current) clearTimeout(correctAdvanceTimerRef.current);
    if (slowDownTimerRef.current) clearTimeout(slowDownTimerRef.current);
    document.body.classList.remove("timed-quiz-active");
    document.documentElement.classList.remove("timed-quiz-active");
  }, []);

  const saveProgress = (
    viewed: number[], mastered: number[], tgt: number = speedTarget,
    streaks: { [key: number]: number } = bestStreaks,
    speeds: { [key: number]: number } = bestSpeeds,
    stats: FactStatsMap = factStatsRef.current,
    nextStars: StrategyStarAwards = strategyStars,
  ) => {
    try {
      localStorage.setItem("mental_math_journey_v2", JSON.stringify({
        viewedStrategyIds: viewed, masteredStrategyIds: mastered,
        stars: countStars(nextStars), strategyStars: nextStars,
        speedTarget: tgt, bestStreaks: streaks, bestSpeeds: speeds, factStats: stats,
      }));
    } catch (e) { /* ignore */ }
  };

  // ─── Confetti ─────────────────────────────────────────

  const launchConfetti = () => {
    const colors = ["#22c55e","#3b82f6","#facc15","#fb7185","#a855f7","#f97316"];
    const pieces = Array.from({length: 80}, (_, i) => ({
      id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 300,
      duration: 1400 + Math.random() * 800,
      size: 7 + Math.random() * 7, color: colors[Math.floor(Math.random() * colors.length)],
      drift: (Math.random() - 0.5) * 200, spin: (Math.random() - 0.5) * 720,
    }));
    if (confettiClearTimerRef.current) clearTimeout(confettiClearTimerRef.current);
    setConfettiPieces(pieces);
    confettiClearTimerRef.current = setTimeout(() => { setConfettiPieces([]); confettiClearTimerRef.current = null; }, 2500);
  };

  // ─── Practice Engine ──────────────────────────────────

  const buildPool = (strategy: Strategy) => {
    const currentFacts = generateQuestionPoolForStrategy(strategy.code);
    const earlier = STRATEGIES.filter((s) =>
      s.id < strategy.id && (viewedStrategyIds.includes(s.id) || masteredStrategyIds.includes(s.id)));
    const prevFacts = mergeUniqueQuestions(...earlier.map((s) => generateQuestionPoolForStrategy(s.code)));
    const reviewLimit = Math.max(3, Math.min(10, Math.round(currentFacts.length * 0.16)));
    const priorityReview = getPriorityReviewQuestions(prevFacts, factStatsRef.current, speedTarget, reviewLimit);
    return { currentFacts, practicePool: mergeUniqueQuestions(currentFacts, priorityReview) };
  };

  const getReviewFacts = () => {
    const ids = new Set(currentStrategyFactsRef.current.map((f) => f.id));
    return questionPoolRef.current.filter((f) => !ids.has(f.id));
  };

  const shouldQuickReview = (poolLen: number): boolean => {
    if (poolLen === 0 || roundAttemptsRef.current < 2) return false;
    const since = attemptsSinceQuickReviewRef.current;
    if (since < 3) return false;
    if (since >= 7) return true;
    return Math.random() < Math.min(0.28, 0.16 + poolLen * 0.02);
  };

  const chooseNextRoundFact = (stats: FactStatsMap, prevId?: string): MathQuestion | null => {
    const current = currentStrategyFactsRef.current.length > 0 ? currentStrategyFactsRef.current : questionPoolRef.current;
    const review = getReviewFacts();
    const useReview = shouldQuickReview(review.length);
    const pref = useReview ? review.filter((f) => f.id !== prevId && !recentReviewFactIdsRef.current.includes(f.id)) : current;
    const sel = chooseNextFact(pref.length > 0 ? pref : current, stats, speedTarget, prevId)
      || chooseNextFact(questionPoolRef.current, stats, speedTarget, prevId);
    if (sel && new Set(review.map((f) => f.id)).has(sel.id)) {
      attemptsSinceQuickReviewRef.current = 0;
      recentReviewFactIdsRef.current = [sel.id, ...recentReviewFactIdsRef.current.filter((id) => id !== sel.id)].slice(0, 4);
    } else {
      attemptsSinceQuickReviewRef.current += 1;
    }
    return sel;
  };

  const clearPendingAnswerCheck = () => {
    pendingAnswerCheckTokenRef.current += 1;

    if (pendingAnswerCheckFrameRef.current !== null) {
      cancelAnimationFrame(pendingAnswerCheckFrameRef.current);
      pendingAnswerCheckFrameRef.current = null;
    }

    if (pendingAnswerCheckTimerRef.current) {
      clearTimeout(pendingAnswerCheckTimerRef.current);
      pendingAnswerCheckTimerRef.current = null;
    }
  };

  const clearQuestionRevealTimer = () => {
    if (questionRevealTimerRef.current) {
      clearTimeout(questionRevealTimerRef.current);
      questionRevealTimerRef.current = null;
    }
  };

  const clearCorrectAdvanceTimer = () => {
    if (correctAdvanceTimerRef.current) {
      clearTimeout(correctAdvanceTimerRef.current);
      correctAdvanceTimerRef.current = null;
    }
    answerLockedRef.current = false;
  };

  const clearInputCooldown = () => {
    if (slowDownTimerRef.current) {
      clearTimeout(slowDownTimerRef.current);
      slowDownTimerRef.current = null;
    }

    if (inputCooldownTimerRef.current) {
      clearTimeout(inputCooldownTimerRef.current);
      inputCooldownTimerRef.current = null;
    }

    inputCooldownActiveRef.current = false;
    inputCooldownQuestionIdRef.current = null;
    setIsInputCooldown(false);
    setShowSlowDown(false);
  };

  const clearSlowDownBanner = () => {
    clearInputCooldown();
  };

  const isInputTemporarilyBlocked = () => {
    if (!inputCooldownActiveRef.current) return false;

    const q = currentQuestionRef.current;
    if (!q || inputCooldownQuestionIdRef.current !== q.id) {
      clearInputCooldown();
      return false;
    }

    return true;
  };

  const clearAnswerReveal = () => {
    answerRevealActiveRef.current = false;
    setAnswerReveal(null);
  };

  const getQuestionRevealMs = () => {
    const factsPerMinute = Math.max(1, speedTarget);
    return Math.max(1200, Math.round((60000 / factsPerMinute) * QUESTION_REVEAL_GRACE));
  };

  const startQuestionRevealTimer = () => {
    clearQuestionRevealTimer();

    const q = currentQuestionRef.current;
    if (!q || !isRoundActiveRef.current || roundCompletedRef.current) return;

    const questionId = q.id;
    questionRevealTimerRef.current = setTimeout(() => {
      questionRevealTimerRef.current = null;
      if (!currentQuestionRef.current || currentQuestionRef.current.id !== questionId) return;
      triggerAnswerReveal();
    }, getQuestionRevealMs());
  };

  const activateQ = (q: MathQuestion | null) => {
    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearAnswerReveal();
    clearSlowDownBanner();
    hasRecordedWrongForQuestionRef.current = false;
    wrongBurstCountRef.current = 0;
    wrongBurstStartRef.current = 0;
    currentQuestionRef.current = q; setCurrentQuestion(q);
    const now = Date.now(); questionStartedAtRef.current = now;
    setIsAnimatingCorrect(false);
    setIsAnimatingIncorrect(false);
    setIsShaking(false);
    if (q && isRoundActiveRef.current && !roundCompletedRef.current) startQuestionRevealTimer();
  };

  const recordAttempt = (correct: boolean, timeout = false): FactStatsMap => {
    const f = currentQuestionRef.current; if (!f) return factStatsRef.current;
    const ms = Date.now() - questionStartedAtRef.current;
    const updated = updateFactStats(factStatsRef.current, f, correct, Math.max(1, ms), timeout, speedTarget);
    factStatsRef.current = updated; setFactStats(updated);
    saveProgress(viewedStrategyIds, masteredStrategyIds, speedTarget, bestStreaks, bestSpeeds, updated);
    roundAttemptsRef.current++; setRoundAttempts(roundAttemptsRef.current);
    if (correct) { roundCorrectAttemptsRef.current++; setRoundCorrectAttempts(roundCorrectAttemptsRef.current); }
    return updated;
  };

  const advanceQ = (stats: FactStatsMap = factStatsRef.current) => {
    activateQ(chooseNextRoundFact(stats, currentQuestionRef.current?.id));
    setCurrentQuestionIdx((p) => p + 1);
  };

  const finishRound = () => {
    if (roundCompletedRef.current) return;
    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearCorrectAdvanceTimer();
    clearAnswerReveal();
    clearSlowDownBanner();
    isRoundActiveRef.current = false;
    roundCompletedRef.current = true;
    setRoundCompleted(true);
  };

  const clearCountdown = () => {
    countdownTimersRef.current.forEach(clearTimeout);
    countdownTimersRef.current = [];
    setCountdownValue(null);
  };

  const resetRoundCounters = () => {
    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearCorrectAdvanceTimer();
    clearAnswerReveal();
    clearSlowDownBanner();
    wrongBurstCountRef.current = 0;
    wrongBurstStartRef.current = 0;
    if (correctFeedbackTimerRef.current) { clearTimeout(correctFeedbackTimerRef.current); correctFeedbackTimerRef.current = null; }
    if (incorrectFeedbackTimerRef.current) { clearTimeout(incorrectFeedbackTimerRef.current); incorrectFeedbackTimerRef.current = null; }
    roundCompletedRef.current = false;
    answerLockedRef.current = false;
    const now = Date.now(); questionStartedAtRef.current = now;
    setTimeLeft(60); setRoundScore(0); setRoundAttempts(0); setRoundCorrectAttempts(0);
    roundAttemptsRef.current = 0; roundCorrectAttemptsRef.current = 0;
    attemptsSinceQuickReviewRef.current = 0; recentReviewFactIdsRef.current = [];
    setCurrentQuestionIdx(0); setUserAnswer(""); userAnswerRef.current = ""; setRoundCompleted(false);
    setCurrentStreak(0); setBestStreakRound(0); setConsecutiveErrors(0);
    setIsAnimatingCorrect(false); setIsAnimatingIncorrect(false); setIsShaking(false);
    setSparklesList([]); setShowHint(false);
  };

  const beginRoundNow = () => {
    clearCountdown(); resetRoundCounters(); isRoundActiveRef.current = true; setIsRoundActive(true);
    startQuestionRevealTimer();
    setTimeout(() => { const el = document.activeElement as HTMLElement | null; if (el) el.blur(); }, 0);
  };

  const startCountdown = () => {
    if (isRoundActive || countdownValue !== null) return;
    resetRoundCounters(); isRoundActiveRef.current = false; setIsRoundActive(false); setCountdownValue("3");
    setEncouragingText("Get ready...");
    [
      [1000, "2"], [2000, "1"], [3000, "Go!"], [3700, null, true],
    ].forEach(([delay, val, done]) => {
      countdownTimersRef.current.push(setTimeout(() => {
        if (done) { beginRoundNow(); return; }
        setCountdownValue(val as string);
      }, delay as number));
    });
  };

  const handleStartPractice = (strategy: Strategy) => {
    clearCountdown(); setShowLessonModal(null); setActiveStrategyRound(strategy);
    setLastRoundStarResult(null);
    const { currentFacts, practicePool } = buildPool(strategy);
    currentStrategyFactsRef.current = currentFacts; questionPoolRef.current = practicePool;
    activateQ(chooseNextFact(currentFacts, factStatsRef.current, speedTarget));
    setCurrentQuestionIdx(0); setUserAnswer(""); userAnswerRef.current = ""; setShowHint(false); setRoundCompleted(false);
    roundCompletedRef.current = false; answerLockedRef.current = false; isRoundActiveRef.current = false;
    setRoundScore(0); setRoundAttempts(0); setRoundCorrectAttempts(0);
    roundAttemptsRef.current = 0; roundCorrectAttemptsRef.current = 0;
    attemptsSinceQuickReviewRef.current = 0; recentReviewFactIdsRef.current = [];
    setTimeLeft(60); setConsecutiveErrors(0);
    setIsAnimatingCorrect(false); setIsAnimatingIncorrect(false); setIsShaking(false);
    setSparklesList([]); setEncouragingText("Let's go!");
    setCurrentStreak(0); setBestStreakRound(0); isRoundActiveRef.current = false; setIsRoundActive(false);
    document.body.classList.add("timed-quiz-active");
    document.documentElement.classList.add("timed-quiz-active");
  };

  const exitPractice = () => {
    clearCountdown(); clearPendingAnswerCheck(); clearQuestionRevealTimer(); clearCorrectAdvanceTimer(); clearAnswerReveal(); clearSlowDownBanner();
    isRoundActiveRef.current = false; setIsRoundActive(false); setActiveStrategyRound(null);
    document.body.classList.remove("timed-quiz-active");
    document.documentElement.classList.remove("timed-quiz-active");
  };

  // ─── Timer ────────────────────────────────────────────

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | null = null;
    if (activeStrategyRound && isRoundActive && !roundCompleted) {
      iv = setInterval(() => {
        setTimeLeft((p) => { if (p <= 1) { if (iv) clearInterval(iv); finishRound(); return 0; } return p - 1; });
      }, 1000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [activeStrategyRound, isRoundActive, roundCompleted]);

  // ─── Round Completion ─────────────────────────────────

  useEffect(() => {
    if (!roundCompleted || !activeStrategyRound) return;
    const id = activeStrategyRound.id;
    const goldMilestone = speedTarget;
    const bronzeMilestone = Math.max(3, Math.round(speedTarget * 0.3));
    const starsGained = getStarsForScore(roundScore, speedTarget);
    const prevBest = clampStars(strategyStars[id] || 0);
    const bestStars = Math.max(prevBest, starsGained);
    const updatedStars = { ...strategyStars, [id]: bestStars };
    setLastRoundStarResult({
      strategyId: id, earnedStars: starsGained, previousBestStars: prevBest,
      bestStars, improved: bestStars > prevBest, reachedThreeStars: bestStars >= STARS_PER_STRATEGY,
    });
    setStrategyStars(updatedStars); setStars(countStars(updatedStars));

    const mastery = getStrategyAdaptiveMastery(
      currentStrategyFactsRef.current, factStatsRef.current, speedTarget,
      roundCorrectAttemptsRef.current, roundAttemptsRef.current, bronzeMilestone,
    );

    let curMastered = [...masteredStrategyIds];
    let curViewed = [...viewedStrategyIds];

    if (mastery.isMastered) {
      if (!curMastered.includes(id)) curMastered.push(id);
      const nextId = id + 1;
      if (nextId <= STRATEGIES.length && !curViewed.includes(nextId)) curViewed.push(nextId);
      const stageComplete = STRATEGIES.filter((s) => s.stageId === activeStrategyRound.stageId)
        .every((s) => s.id === id || curMastered.includes(s.id));
      if (stageComplete) launchConfetti();
    }

    setMasteredStrategyIds(curMastered); setViewedStrategyIds(curViewed);

    if (curMastered.length >= STRATEGIES.length && !showAllDone) setShowAllDone(true);

    const activeId = activeStrategyRound.id;
    const currentSpeed = roundScore;
    const updatedStreaks = { ...bestStreaks, [activeId]: Math.max(bestStreaks[activeId] || 0, bestStreakRound) };
    const updatedSpeeds = { ...bestSpeeds, [activeId]: Math.max(bestSpeeds[activeId] || 0, currentSpeed) };
    setBestStreaks(updatedStreaks); setBestSpeeds(updatedSpeeds);
    setEncouragingText(mastery.isMastered ? "Great job!" : "Keep practicing!");

    saveProgress(curViewed, curMastered, speedTarget, updatedStreaks, updatedSpeeds, factStatsRef.current, updatedStars);
  }, [roundCompleted]);

  // ─── Input Handling ───────────────────────────────────

  const getCurrentAnswerDigitLimit = () => {
    const q = currentQuestionRef.current;
    if (!q) return 8;
    return Math.max(1, Math.min(8, String(q.answer).length));
  };

  const setAnswerValue = (next: string) => {
    userAnswerRef.current = next;
    setUserAnswer(next);
  };

  const triggerSlowDownLock = () => {
    const q = currentQuestionRef.current;
    if (!q || roundCompletedRef.current) return;

    clearPendingAnswerCheck();
    setAnswerValue("");
    setShowSlowDown(true);
    setIsInputCooldown(true);
    inputCooldownActiveRef.current = true;
    inputCooldownQuestionIdRef.current = q.id;

    if (slowDownTimerRef.current) {
      clearTimeout(slowDownTimerRef.current);
      slowDownTimerRef.current = null;
    }

    if (inputCooldownTimerRef.current) clearTimeout(inputCooldownTimerRef.current);
    inputCooldownTimerRef.current = setTimeout(() => {
      inputCooldownTimerRef.current = null;

      if (currentQuestionRef.current && currentQuestionRef.current.id === q.id) {
        inputCooldownActiveRef.current = false;
        inputCooldownQuestionIdRef.current = null;
        setIsInputCooldown(false);
        setShowSlowDown(false);
        if (inputRef.current) inputRef.current.focus();
      }
    }, SLOW_DOWN_LOCK_MS);
  };

  const registerWrongBurst = () => {
    const now = Date.now();

    if (!wrongBurstStartRef.current || now - wrongBurstStartRef.current > WRONG_BURST_WINDOW_MS) {
      wrongBurstStartRef.current = now;
      wrongBurstCountRef.current = 1;
    } else {
      wrongBurstCountRef.current += 1;
    }

    if (wrongBurstCountRef.current >= WRONG_BURST_THRESHOLD) {
      triggerSlowDownLock();
      wrongBurstCountRef.current = 0;
      wrongBurstStartRef.current = 0;
    }
  };

  const completeCorrectTransition = (stats: FactStatsMap, questionId: string, holdMs: number) => {
    clearCorrectAdvanceTimer();
    answerLockedRef.current = true;

    correctAdvanceTimerRef.current = setTimeout(() => {
      correctAdvanceTimerRef.current = null;
      if (roundCompletedRef.current) { answerLockedRef.current = false; return; }
      if (!currentQuestionRef.current || currentQuestionRef.current.id !== questionId) { answerLockedRef.current = false; return; }

      answerLockedRef.current = false;
      setAnswerValue("");
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      setShowHint(false);
      advanceQ(stats);
    }, holdMs);
  };

  const handleCorrectAnswer = (submittedValue: string) => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearAnswerReveal();
    clearSlowDownBanner();
    const questionId = currentQuestionRef.current.id;
    const updatedStats = recordAttempt(true);

    setRoundScore((p) => p + 1);
    setCurrentStreak((p) => {
      const next = p + 1;
      setBestStreakRound((b) => Math.max(b, next));
      return next;
    });
    setConsecutiveErrors(0);
    setIsAnimatingCorrect(true);
    setIsAnimatingIncorrect(false);
    setIsShaking(false);
    setAnswerValue(submittedValue);

    if (correctFeedbackTimerRef.current) { clearTimeout(correctFeedbackTimerRef.current); correctFeedbackTimerRef.current = null; }

    completeCorrectTransition(updatedStats, questionId, CORRECT_ANSWER_HOLD_MS);
  };

  const handleRevealedAnswerComplete = (submittedValue: string) => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current) return;

    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearSlowDownBanner();
    const questionId = currentQuestionRef.current.id;
    const stats = factStatsRef.current;

    answerRevealActiveRef.current = false;
    setAnswerReveal(null);
    setCurrentStreak(0);
    setIsAnimatingCorrect(true);
    setIsAnimatingIncorrect(false);
    setIsShaking(false);
    setAnswerValue(submittedValue);

    completeCorrectTransition(stats, questionId, REVEALED_ANSWER_HOLD_MS);
  };

  const handleIncorrectAnswer = () => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    clearPendingAnswerCheck();
    registerWrongBurst();

    let recordedWrongNow = false;
    if (!answerRevealActiveRef.current && !hasRecordedWrongForQuestionRef.current) {
      hasRecordedWrongForQuestionRef.current = true;
      recordAttempt(false);
      recordedWrongNow = true;
    }

    setCurrentStreak(0);
    if (recordedWrongNow) setConsecutiveErrors((p) => p + 1);
    setIsAnimatingIncorrect(true);
    setIsAnimatingCorrect(false);
    setIsShaking(true);
    setAnswerValue("");

    if (incorrectFeedbackTimerRef.current) clearTimeout(incorrectFeedbackTimerRef.current);
    incorrectFeedbackTimerRef.current = setTimeout(() => {
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      incorrectFeedbackTimerRef.current = null;
    }, 400);
  };

  const checkRevealedAnswerValue = (rawValue: string, force = false) => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    const raw = rawValue.trim();
    if (raw === "") {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const expected = currentQuestionRef.current.answer;
    const neededDigits = getCurrentAnswerDigitLimit();

    if (!force && raw.length < neededDigits) {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setAnswerValue("");
      return;
    }

    if (parsed === expected) {
      handleRevealedAnswerComplete(raw);
    } else if (force || raw.length >= neededDigits) {
      setIsAnimatingIncorrect(true);
      setIsAnimatingCorrect(false);
      setIsShaking(true);
      setAnswerValue("");

      if (incorrectFeedbackTimerRef.current) clearTimeout(incorrectFeedbackTimerRef.current);
      incorrectFeedbackTimerRef.current = setTimeout(() => {
        setIsAnimatingIncorrect(false);
        setIsShaking(false);
        incorrectFeedbackTimerRef.current = null;
      }, 400);
    }
  };

  const triggerAnswerReveal = () => {
    const q = currentQuestionRef.current;
    if (!q || !isRoundActiveRef.current || roundCompletedRef.current || answerLockedRef.current) return;

    clearPendingAnswerCheck();
    clearQuestionRevealTimer();
    clearSlowDownBanner();
    answerRevealActiveRef.current = true;

    let recordedTimeoutNow = false;
    if (!hasRecordedWrongForQuestionRef.current) {
      hasRecordedWrongForQuestionRef.current = true;
      recordAttempt(false, true);
      recordedTimeoutNow = true;
    }

    setCurrentStreak(0);
    if (recordedTimeoutNow) setConsecutiveErrors((p) => p + 1);
    setIsAnimatingIncorrect(false);
    setIsAnimatingCorrect(false);
    setIsShaking(false);
    setAnswerValue("");
    setShowHint(false);
    setAnswerReveal({ questionId: q.id, text: `${q.question} = ${q.answer}` });
  };

  const checkAnswerValue = (rawValue: string, force = false) => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    if (answerRevealActiveRef.current) {
      checkRevealedAnswerValue(rawValue, force);
      return;
    }

    const raw = rawValue.trim();
    if (raw === "") {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const expected = currentQuestionRef.current.answer;
    const neededDigits = getCurrentAnswerDigitLimit();

    if (!force && raw.length < neededDigits) {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setAnswerValue("");
      return;
    }

    if (parsed === expected) handleCorrectAnswer(raw);
    else if (force || raw.length >= neededDigits) handleIncorrectAnswer();
  };

  const queueAnswerInputCheck = (nextValue: string) => {
    clearPendingAnswerCheck();

    if (!isRoundActiveRef.current || roundCompletedRef.current || !currentQuestionRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    const raw = nextValue.trim();
    if (!raw) {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const neededDigits = getCurrentAnswerDigitLimit();
    if (raw.length < neededDigits) {
      setIsAnimatingCorrect(false);
      setIsAnimatingIncorrect(false);
      setIsShaking(false);
      return;
    }

    const token = pendingAnswerCheckTokenRef.current;
    const questionId = currentQuestionRef.current.id;
    const submittedValue = raw;

    const runCheck = () => {
      pendingAnswerCheckFrameRef.current = null;
      pendingAnswerCheckTimerRef.current = null;

      if (token !== pendingAnswerCheckTokenRef.current) return;
      if (!currentQuestionRef.current) return;
      if (currentQuestionRef.current.id !== questionId) return;
      if (userAnswerRef.current.trim() !== submittedValue) return;

      checkAnswerValue(submittedValue, false);
    };

    pendingAnswerCheckFrameRef.current = requestAnimationFrame(() => {
      pendingAnswerCheckFrameRef.current = null;
      pendingAnswerCheckTimerRef.current = setTimeout(runCheck, 0);
    });
  };

  const sanitizeAnswerInput = (value: string) => {
    const limit = getCurrentAnswerDigitLimit();
    return value.replace(/\D/g, "").slice(0, limit);
  };

  const handleNumClick = (val: string) => {
    if (!isRoundActiveRef.current || roundCompletedRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;

    const prev = userAnswerRef.current;
    let next = prev;

    if (val === "DEL") {
      next = prev.slice(0, -1);
    } else if (val === "CLR") {
      next = "";
    } else {
      const limit = getCurrentAnswerDigitLimit();
      if (prev.length >= limit) return;
      next = prev + val;
    }

    setAnswerValue(next);
    queueAnswerInputCheck(next);

    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = () => {
    if (isInputTemporarilyBlocked()) return;
    checkAnswerValue(userAnswerRef.current, true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isRoundActiveRef.current || roundCompletedRef.current) return;
      const isQuizKey = e.key === "Enter" || e.key === "Backspace" || /^[0-9]$/.test(e.key);
      if (isInputTemporarilyBlocked()) {
        if (isQuizKey) e.preventDefault();
        return;
      }
      if (e.key === "Enter") { e.preventDefault(); handleSubmit(); return; }
      if (e.key === "Backspace") { e.preventDefault(); handleNumClick("DEL"); return; }
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); handleNumClick(e.key); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRoundActive, roundCompleted]);

  // ─── Helpers ──────────────────────────────────────────

  const starProgressText = `${stars}/${STRATEGIES.length * STARS_PER_STRATEGY}`;
  const roundPassTarget = Math.max(6, Math.round(speedTarget * 0.6));
  const activeRoundBestStars = activeStrategyRound ? getStrategyStarCount(activeStrategyRound.id) : 0;

  const renderStars = (count: number, cls = "w-4 h-4", total = STARS_PER_STRATEGY) =>
    Array.from({ length: total }, (_, i) => (
      <Star key={i} className={`${cls} ${i < count ? "text-yellow-500 fill-yellow-400" : "text-slate-300"}`} />
    ));

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#E0F2FE] text-slate-900 font-sans flex flex-col">
      {/* Confetti */}
      {confettiPieces.length > 0 && (
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map((p) => (
            <span key={p.id} className="confetti-piece" style={{
              left: `${p.left}%`, backgroundColor: p.color, width: p.size, height: p.size,
              animationDelay: `${p.delay}ms`, animationDuration: `${p.duration}ms`,
              "--drift": `${p.drift}px`, "--spin": `${p.spin}deg`,
            } as CSSProperties} />
          ))}
        </div>
      )}

      {/* Header */}
      {!isTimedQuizInProgress && (
        <header className="border-b-4 border-blue-200 bg-white/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎒</span>
              <h1 className="text-xl md:text-2xl font-display font-black text-blue-950 tracking-tight">
                Mental Math Journey
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-[#fdfbe7] px-3 py-1.5 rounded-full border-2 border-[#fbcf22]">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-mono text-lg font-black text-blue-950">{starProgressText}</span>
              <span className="text-xs font-bold text-blue-700 hidden sm:inline">Stars</span>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      {!activeStrategyRound ? (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">

          {/* All Done Banner */}
          {showAllDone && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-yellow-50 to-amber-100 border-4 border-yellow-400 p-6 rounded-3xl text-center space-y-3"
            >
              <span className="text-5xl">👑</span>
              <h2 className="text-2xl font-display font-black text-amber-950">You did it!</h2>
              <p className="text-sm font-bold text-amber-800">
                All {STRATEGIES.length} lessons complete &mdash; amazing work!
              </p>
              <button
                onClick={() => {
                  if (!confirm("Restart from Lesson 1? All stars will be kept.")) return;
                  setMasteredStrategyIds([]); setViewedStrategyIds([1]); setCurrentStageId(StageId.StarterIsland);
                  setShowAllDone(false);
                  saveProgress([1], [], speedTarget, bestStreaks, bestSpeeds, factStatsRef.current, strategyStars);
                }}
                className="bg-[#FF4757] hover:bg-[#FF6B81] text-white font-black py-2.5 px-6 rounded-xl text-sm transition border-2 border-[#D63031] cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Restart
              </button>
            </motion.div>
          )}

          {/* Chapter Navigation */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                const prev = STAGES.find((s) => s.id === currentStageId - 1);
                if (prev && isStageUnlocked(prev.id)) setCurrentStageId(prev.id);
              }}
              disabled={currentStageId <= 1}
              className="p-2 rounded-full bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 overflow-x-auto px-1 py-1">
              {STAGES.map((stage) => {
                const unlocked = isStageUnlocked(stage.id);
                const active = currentStageId === stage.id;
                const done = STRATEGIES.filter((s) => s.stageId === stage.id).every((s) => masteredStrategyIds.includes(s.id));
                return (
                  <button
                    key={stage.id}
                    onClick={() => { if (unlocked) setCurrentStageId(stage.id); }}
                    disabled={!unlocked}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black transition border-2 cursor-pointer ${
                      active
                        ? "bg-white border-yellow-400 shadow-md"
                        : unlocked
                        ? "bg-white border-blue-200 hover:border-blue-300"
                        : "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-lg block text-center">{unlocked ? stage.emoji : "🔒"}</span>
                    <span className={`block mt-0.5 text-center ${active ? "text-blue-900" : "text-slate-600"}`}>
                      {stage.name}
                    </span>
                    {done && <Check className="w-3 h-3 text-emerald-500 mx-auto mt-0.5" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const next = STAGES.find((s) => s.id === currentStageId + 1);
                if (next && isStageUnlocked(next.id)) setCurrentStageId(next.id);
              }}
              disabled={currentStageId >= STAGES.length || !isStageUnlocked((currentStageId + 1) as StageId)}
              className="p-2 rounded-full bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Chapter Header */}
          <div className="text-center">
            <span className="text-4xl">{activeStage.emoji}</span>
            <h2 className="text-xl md:text-2xl font-display font-black text-blue-950 mt-1">
              {activeStage.name}
            </h2>
            <p className="text-sm text-blue-800 font-bold">{activeStage.description}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-black text-blue-900">{chapterProgress} lessons done</span>
            </div>
          </div>

          {/* Lesson Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeStrategies.map((strategy) => {
              const unlocked = strategy.id === 1 || viewedStrategyIds.includes(strategy.id) || masteredStrategyIds.includes(strategy.id);
              const mastered = masteredStrategyIds.includes(strategy.id);
              const sStars = getStrategyStarCount(strategy.id);

              return (
                <div
                  key={strategy.id}
                  className={`p-4 rounded-2xl border-2 transition ${
                    mastered
                      ? "bg-emerald-50 border-emerald-300"
                      : unlocked
                      ? "bg-white border-blue-200 hover:border-blue-300"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className={`font-display font-black text-sm md:text-base ${unlocked ? "text-blue-950" : "text-slate-400"}`}>
                        {!unlocked ? "🔒 " : ""}{strategy.name}
                      </h3>
                      <p className={`text-xs mt-0.5 ${unlocked ? "text-slate-500" : "text-slate-400"}`}>
                        {unlocked ? strategy.explanation : "Finish the lesson before this one"}
                      </p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {renderStars(sStars, "w-3.5 h-3.5")}
                    </div>
                  </div>

                  {unlocked && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setShowLessonModal(strategy)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> How?
                      </button>
                      <button
                        onClick={() => handleStartPractice(strategy)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-black transition cursor-pointer border-2 ${
                          mastered
                            ? "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200"
                            : "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 shadow-sm"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {mastered ? (sStars >= STARS_PER_STRATEGY ? "Play Again" : "Try for 3") : "Play"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-8 text-xs">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
            >
              Settings
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => openCertificateModal(activeStage.id, activeStage.name)}
              className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
            >
              Print Certificate
            </button>
          </div>
        </main>
      ) : (
        /* ─── Practice Screen ─── */
        <main className={`flex-1 max-w-2xl w-full mx-auto ${isTimedQuizInProgress ? "timed-quiz-main p-0 sm:p-4 md:p-6" : "p-4 md:p-6"}`}>
          <div className={isTimedQuizInProgress ? "timed-practice-shell" : ""}>
            {!isTimedQuizInProgress && (
              <div className="flex items-center justify-between mb-4">
                <button onClick={exitPractice} className="text-xs text-blue-800 flex items-center gap-1 bg-white border-2 border-blue-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs bg-white border-2 border-blue-200 px-3 py-1.5 rounded-xl text-blue-900 font-bold">
                  Lesson {activeStrategyRound.id}/{STRATEGIES.length}
                </span>
              </div>
            )}

            <div className={`bg-white rounded-[32px] border-4 border-blue-400 p-5 md:p-7 relative overflow-hidden shadow-lg ${isTimedQuizInProgress ? "timed-quiz-card" : ""}`}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF4757]" />

              {/* Countdown overlay */}
              <AnimatePresence>
                {countdownValue !== null && (
                  <motion.div
                    key="cd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 grid place-items-center bg-white/80 backdrop-blur-sm pointer-events-none"
                  >
                    <div className="rounded-2xl border-4 border-blue-300 bg-white/95 px-8 py-6 text-center shadow-xl">
                      <div className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">Get Ready</div>
                      <motion.div
                        key={countdownValue}
                        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                        className="text-6xl md:text-8xl font-black font-display text-[#FF4757]"
                      >
                        {countdownValue}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!roundCompleted ? (
                <div className="space-y-5">
                  {!isRoundActive ? (
                    /* Pre-round */
                    <div className="text-center py-4 space-y-5">
                      <div>
                        <span className="inline-block bg-blue-100 border-2 border-blue-200 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                          1-Minute Practice
                        </span>
                        <h3 className="text-xl md:text-2xl font-display font-black text-blue-950 mt-2">
                          {activeStrategyRound.name}
                        </h3>
                      </div>

                      <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl max-w-xs mx-auto">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Goals</span>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                          <div className="p-2 bg-white border-2 border-amber-200 rounded-xl">
                            <span className="text-xl block">🥉</span>
                            <span className="text-amber-800 block mt-0.5">Bronze</span>
                            <span className="font-mono text-slate-500">{Math.max(3, Math.round(speedTarget * 0.3))}+</span>
                          </div>
                          <div className="p-2 bg-white border-2 border-slate-300 rounded-xl">
                            <span className="text-xl block">🥈</span>
                            <span className="text-slate-700 block mt-0.5">Silver</span>
                            <span className="font-mono text-slate-500">{roundPassTarget}+</span>
                          </div>
                          <div className="p-2 bg-white border-2 border-yellow-300 rounded-xl">
                            <span className="text-xl block">🥇</span>
                            <span className="text-yellow-800 block mt-0.5">Gold</span>
                            <span className="font-mono text-slate-500">{speedTarget}+</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-800 font-bold mt-2">
                          Best: {renderStars(activeRoundBestStars, "w-3.5 h-3.5 inline")} {activeRoundBestStars}/3
                        </p>
                      </div>

                      <button
                        onClick={() => setShowLessonModal(activeStrategyRound)}
                        className="mx-auto bg-white hover:bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 font-bold py-2 px-5 rounded-xl cursor-pointer transition flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4 text-[#FF4757]" /> How to solve
                      </button>

                      <button
                        onClick={startCountdown}
                        className="w-full max-w-[300px] mx-auto block bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-lg transition border-2 border-emerald-600 shadow-md cursor-pointer"
                      >
                        Start!
                      </button>
                    </div>
                  ) : (
                    /* Active practice */
                    <div className="timed-practice-layout">
                      {/* Stats bar */}
                      <div className="timed-stats-grid flex items-center justify-between gap-2 text-xs font-black text-blue-800 bg-blue-50 p-2.5 rounded-xl border-2 border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg">{timeLeft}s</span>
                          <span>|</span>
                          <span className="font-mono text-lg">{roundScore}</span>
                          <span className="text-slate-400">correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{consecutiveErrors > 0 ? `${consecutiveErrors} miss` : currentStreak > 1 ? `${currentStreak} streak` : ""}</span>
                        </div>
                      </div>

                      {/* Question */}
                      <div className="timed-question-card bg-blue-50/50 rounded-2xl border-2 border-blue-100 p-6 text-center">
                        <h4 className="text-5xl md:text-7xl font-black font-mono text-blue-950 tracking-tight">
                          {currentQuestion?.question || "..."}
                        </h4>
                        <div className="h-14 flex items-center justify-center">
                          <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={userAnswer}
                            onChange={(e) => {
                              if (!isRoundActiveRef.current || roundCompletedRef.current || answerLockedRef.current || isInputTemporarilyBlocked()) return;
                              const next = sanitizeAnswerInput(e.target.value);
                              setAnswerValue(next);
                              queueAnswerInputCheck(next);
                            }}
                            className={`timed-answer-input w-40 text-center text-3xl md:text-4xl font-mono font-black bg-transparent border-b-4 outline-none transition-colors py-2 ${
                              isAnimatingCorrect ? "answer-glow-good border-emerald-400 text-emerald-600" :
                              isAnimatingIncorrect ? "answer-glow-bad border-red-400 text-red-500" :
                              "border-blue-300 text-blue-800 focus:border-blue-500"
                            } ${isShaking ? "animate-pulse" : ""}`}
                            autoFocus
                            autoComplete="off"
                            disabled={isInputCooldown}
                          />
                        </div>
                        <div className="text-xs font-bold text-slate-400 mt-1 flex items-center justify-center gap-2">
                          Question {currentQuestionIdx + 1}
                          {showHint && currentQuestion && (
                            <span className="text-blue-600">{currentQuestion.hint}</span>
                          )}
                          {!showHint && currentQuestion && (
                            <button onClick={() => setShowHint(true)} className="text-blue-400 hover:text-blue-600 cursor-pointer">hint?</button>
                          )}
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="timed-feedback-zone" aria-live="polite">
                        <div className="timed-feedback-layer">
                          <AnimatePresence mode="wait">
                            {answerReveal && (
                              <motion.div
                                key={`answer-reveal-${answerReveal.questionId}`}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="timed-answer-reveal"
                              >
                                <div className="font-black">{answerReveal.text}</div>
                                <div className="text-xs">Type the answer shown to continue</div>
                              </motion.div>
                            )}
                            {!answerReveal && showSlowDown && (
                              <motion.div
                                key="slow-down"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                className="timed-slow-down"
                              >
                                Slow down! Read carefully
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Keypad */}
                      <div className="timed-keypad-wrap">
                        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                          {["1","2","3","DEL","4","5","6","CLR","7","8","9","","","0","",""].map((k, i) => {
                            if (k === "DEL") return <button key={i} onClick={() => handleNumClick("DEL")} disabled={isInputCooldown} className={`p-3 rounded-xl bg-red-100 border-2 border-red-200 text-red-700 font-black text-sm active:bg-red-200 transition ${isInputCooldown ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>⌫</button>;
                            if (k === "CLR") return <button key={i} onClick={() => handleNumClick("CLR")} disabled={isInputCooldown} className={`p-3 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm active:bg-slate-200 transition ${isInputCooldown ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>C</button>;
                            if (k === "") return <div key={i} />;
                            return <button key={i} onClick={() => handleNumClick(k)} disabled={isInputCooldown} className={`p-3 rounded-xl bg-white border-2 border-slate-200 text-blue-900 font-black text-lg hover:bg-blue-50 active:bg-blue-100 transition shadow-sm ${isInputCooldown ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>{k}</button>;
                          })}
                        </div>
                        <button
                          onClick={handleSubmit}
                          disabled={isInputCooldown}
                          className={`w-full max-w-xs mx-auto block mt-2 py-3 bg-[#FF4757] hover:bg-[#FF6B81] text-white font-black rounded-xl text-sm transition border-2 border-[#D63031] shadow-sm ${isInputCooldown ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Round Results */
                <div className="text-center py-6 space-y-4">
                  <span className="text-4xl">{roundScore >= roundPassTarget ? "🎉" : "💪"}</span>
                  <h3 className="text-xl md:text-2xl font-display font-black text-blue-950">
                    {roundScore >= roundPassTarget ? "Great job!" : "Nice try!"}
                  </h3>

                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <span className="text-3xl font-black font-mono text-blue-950 block">{roundScore}</span>
                      <span className="text-xs text-slate-400 font-bold">correct</span>
                    </div>
                    <span className="text-slate-300 text-xl">|</span>
                    <div className="text-center">
                      <span className="text-3xl font-black font-mono text-blue-950 block">{roundAttempts}</span>
                      <span className="text-xs text-slate-400 font-bold">answered</span>
                    </div>
                  </div>

                  {lastRoundStarResult && (
                    <div className="flex items-center justify-center gap-1.5 bg-amber-50 border-2 border-amber-200 px-4 py-2 rounded-full w-fit mx-auto">
                      <span className="text-xs font-bold text-amber-800">
                        {lastRoundStarResult.improved ? "Star improved!" : lastRoundStarResult.earnedStars > 0 ? `${lastRoundStarResult.earnedStars} star${lastRoundStarResult.earnedStars > 1 ? "s" : ""}` : "No new stars"}
                      </span>
                      <span className="flex gap-0.5">{renderStars(lastRoundStarResult.bestStars, "w-4 h-4")}</span>
                    </div>
                  )}

                  {roundScore >= roundPassTarget && (
                    <p className="text-sm font-bold text-emerald-700">Lesson passed! {activeStrategyRound && activeStrategyRound.id < STRATEGIES.length ? "Next lesson unlocked!" : ""}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => activeStrategyRound && handleStartPractice(activeStrategyRound)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 px-6 rounded-xl text-sm transition border-2 border-emerald-600 cursor-pointer shadow-sm"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={exitPractice}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-sm transition border-2 border-slate-200 cursor-pointer"
                    >
                      Back to Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowLessonModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border-4 border-blue-300 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-black text-blue-500">Lesson {showLessonModal.id}</span>
                <button onClick={() => setShowLessonModal(null)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <h3 className="text-xl font-display font-black text-blue-950 mb-1">{showLessonModal.name}</h3>
              <p className="text-sm text-slate-600 font-bold mb-4">{showLessonModal.explanation}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-100">
                  <span className="text-xs font-mono font-black text-[#FF4757] uppercase block mb-1">Example</span>
                  <span className="text-lg font-mono font-black text-blue-950">{showLessonModal.example}</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-100">
                  <span className="text-xs font-mono font-black text-yellow-700 uppercase block mb-1">Think</span>
                  {showLessonModal.thinkSteps.map((step, i) => (
                    <p key={i} className="text-xs text-blue-900 font-bold flex items-start gap-1.5">
                      <span className="text-yellow-500">•</span> {step}
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleStartPractice(showLessonModal)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition border-2 border-emerald-600 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Ready? Play!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificateModal && certificateRequest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowCertificateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border-4 border-amber-300 p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-display font-black text-blue-950">Create Certificate</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Chapter {certificateRequest.stageId}: {certificateRequest.stageName}</p>
                </div>
                <button onClick={() => setShowCertificateModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-4 text-center">
                <p className="text-sm font-black text-amber-700">
                  {formatCertificateStars(certificateRequest.earnedStars, certificateRequest.maxStars)}
                </p>
              </div>

              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Enter your name</label>
              <input
                type="text"
                value={certificateNameInput}
                placeholder="Student name"
                maxLength={32}
                autoFocus
                onChange={(e) => setCertificateNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && certificateNameInput.trim()) handlePrintCertificateFromModal();
                }}
                className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-amber-300"
              />

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition border-2 border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrintCertificateFromModal}
                  disabled={!certificateNameInput.trim()}
                  className={`flex-1 font-black py-2.5 rounded-xl text-sm transition border-2 ${
                    certificateNameInput.trim()
                      ? "bg-amber-400 hover:bg-amber-500 border-amber-500 text-blue-950 cursor-pointer shadow-sm"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Print
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border-4 border-blue-300 p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-black text-blue-950">Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Speed Target ({speedTarget}/min)</label>
                  <input
                    type="range" min="8" max="40" value={speedTarget}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setSpeedTarget(v);
                      saveProgress(viewedStrategyIds, masteredStrategyIds, v, bestStreaks, bestSpeeds, factStatsRef.current);
                    }}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-bold mt-0.5">
                    <span>Easier (8)</span><span>Harder (40)</span>
                  </div>
                </div>


                <button
                  onClick={() => {
                    if (!confirm("Reset ALL progress? This cannot be undone.")) return;
                    setViewedStrategyIds([1]); setMasteredStrategyIds([]); setStars(0);
                    setStrategyStars({}); setBestStreaks({}); setBestSpeeds({}); setFactStats({});
                    factStatsRef.current = {}; setCurrentStageId(StageId.StarterIsland);
                    setShowAllDone(false);
                    saveProgress([1], [], speedTarget, {}, {}, {});
                    setShowSettingsModal(false);
                  }}
                  className="w-full bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-700 font-black py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  Reset All Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}