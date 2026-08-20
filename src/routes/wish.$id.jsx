import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getWish, unlockWish, getComments, postComment } from "../lib/wish.functions";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
("use client");

import { useEffect, useState, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Lock,
  Loader2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Send,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Mic,
} from "lucide-react";

const THEMES = {
  birthday: {
    bg: "from-[#3a1145] via-[#6b1f5e] to-[#c53a80]",
    emoji: "🎂",
    title: "Happy Birthday!",
  },
  anniversary: {
    bg: "from-rose-400 via-pink-500 to-red-500",
    emoji: "💐",
    title: "Happy Anniversary",
  },
  wedding: { bg: "from-amber-200 via-rose-300 to-rose-500", emoji: "💒", title: "Wedding Wishes" },
  love: { bg: "from-pink-500 via-rose-500 to-red-500", emoji: "💗", title: "With Love" },
  baby: { bg: "from-sky-300 via-pink-300 to-rose-400", emoji: "👶", title: "Baby Shower" },
  christmas: {
    bg: "from-emerald-700 via-emerald-800 to-emerald-900",
    emoji: "🎄",
    title: "Merry Christmas",
  },
  diwali: { bg: "from-amber-400 via-orange-500 to-red-600", emoji: "🪔", title: "Happy Diwali" },
  newyear: {
    bg: "from-yellow-500 via-orange-600 to-red-700",
    emoji: "🎆",
    title: "Happy New Year",
  },
  festival: {
    bg: "from-fuchsia-400 via-purple-500 to-indigo-600",
    emoji: "🎉",
    title: "Celebrations!",
  },
  invitation: {
    bg: "from-indigo-400 via-violet-500 to-purple-600",
    emoji: "💌",
    title: "You are Invited",
  },
  friendship: {
    bg: "from-orange-300 via-pink-400 to-rose-500",
    emoji: "💛",
    title: "To My Friend",
  },
};

/* -------- Slideshow Overlay -------- */
const Slideshow = ({ photos = [], open, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setPlaying(true);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length, onClose]);
  useEffect(() => {
    if (!open || !playing) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [open, playing, photos.length]);
  if (!open) return null;
  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl grid place-items-center">
      <AnimatePresence mode="wait">
        {photos.length > 0 && (
          <motion.img
            key={idx}
            src={photos[idx]}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[92vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
          />
        )}
      </AnimatePresence>
      {/* controls */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white grid place-items-center hover:bg-white/25 transition"
      >
        <X className="w-5 h-5" />
      </button>
      <button
        onClick={prev}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white grid place-items-center hover:bg-white/25 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white grid place-items-center hover:bg-white/25 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-white/15 backdrop-blur border border-white/25 p-1.5 pl-4 text-white">
        <div className="text-sm font-medium tabular-nums">
          {idx + 1} / {photos.length}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
      {/* thumb strip */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-12 h-12 rounded-lg overflow-hidden transition ring-2 ${i === idx ? "ring-white" : "ring-white/20 opacity-60 hover:opacity-100"}`}
          >
            <img src={p} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* -------- Narration Player -------- */
const NarrationButton = ({ src }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
    },
    [],
  );
  if (!src) return null;
  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };
  return (
    <button
      onClick={toggle}
      className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/15 backdrop-blur border border-white/30 hover:bg-white/25 transition text-sm font-medium"
    >
      {playing ? <Pause className="w-4 h-4" /> : <Mic className="w-4 h-4" />}{" "}
      {playing ? "Pause Narration" : "Listen to this wish"}
    </button>
  );
};

/* -------- Password Gate -------- */
const PasswordGate = ({ id, theme, onUnlock }) => {
  const { site } = usePublicSettings();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const t = THEMES[theme] || THEMES.birthday;
  const unlockFn = useServerFn(unlockWish);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const d = await unlockFn({ data: { id, password: pw } });
      if (!d.error) onUnlock(d);
      else setErr(d.error || "Incorrect password");
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${t.bg} text-white grid place-items-center p-6 relative overflow-hidden`}
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-sm w-full rounded-3xl bg-white/15 backdrop-blur-xl border border-white/30 p-8 shadow-2xl text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center border border-white/30 mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2
          className="font-bold text-2xl"
          style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
        >
          Private Wish
        </h2>
        <p className="text-sm text-white/80 mt-1">Enter password to unlock this wish</p>
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          type="password"
          placeholder="Password"
          className="mt-6 w-full h-11 px-4 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/60"
          autoFocus
        />
        {err && (
          <div className="mt-3 text-sm text-rose-100 bg-rose-500/30 rounded-full px-3 py-1.5 inline-block">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-5 w-full h-11 rounded-full bg-white text-purple-700 font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 hover:scale-[1.02] transition"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}{" "}
          Unlock Wish
        </button>
        <Link
          to="/"
          className="mt-4 text-xs text-white/70 hover:text-white inline-flex items-center gap-1 justify-center"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to {site.siteName}
        </Link>
      </motion.form>
    </div>
  );
};

/* -------- Music Player -------- */
const MusicPlayer = ({ url }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.volume = 0.35;
    audioRef.current = a;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [url]);
  if (!url) return null;
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };
  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 p-1.5 shadow-2xl">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/35 grid place-items-center transition"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <button
        onClick={toggleMute}
        className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/35 grid place-items-center transition"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <div className="px-3 text-xs font-medium hidden sm:flex items-center gap-1.5">
        <Music className="w-3.5 h-3.5" />
        Playing
      </div>
    </div>
  );
};

/* -------- Countdown Timer -------- */
const Countdown = ({ date }) => {
  const [rem, setRem] = useState(null);
  useEffect(() => {
    if (!date) return;
    const target = new Date(date).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setRem({ d: 0, h: 0, m: 0, s: 0, done: true });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setRem({ d, h, m, s, done: false });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [date]);
  if (!rem) return null;
  const Cell = ({ v, l }) => (
    <div className="flex flex-col items-center">
      <div
        className="min-w-[70px] px-3 h-16 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 grid place-items-center font-bold text-3xl tabular-nums"
        style={{ fontFamily: "Georgia,serif" }}
      >
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[11px] uppercase tracking-wide mt-1.5 opacity-80">{l}</div>
    </div>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-6"
    >
      <div className="text-center text-sm text-white/80 mb-3">
        {rem.done ? "🎉 The moment is here!" : "Counting down to the big moment"}
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <Cell v={rem.d} l="Days" />
        <Cell v={rem.h} l="Hours" />
        <Cell v={rem.m} l="Mins" />
        <Cell v={rem.s} l="Secs" />
      </div>
    </motion.div>
  );
};

/* -------- Guest Book -------- */
const QUICK_REACTIONS = ["❤️", "🎉", "🌟", "😊", "🥳", "🙏", "🔥", "😍"];
const GuestBook = ({ id, unlockToken }) => {
  const { features, ready: settingsReady } = usePublicSettings();
  const commentsEnabled = !settingsReady || features.commentsEnabled;
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState("");
  const getCommentsFn = useServerFn(getComments);
  const postCommentFn = useServerFn(postComment);
  const load = async () => {
    try {
      const d = await getCommentsFn({ data: { id, unlockToken } });
      setComments(d.comments || []);
    } catch {}
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [id, unlockToken]);

  const post = async ({ reaction, message }) => {
    if (!commentsEnabled) {
      setPostError("Public comments are currently disabled by the administrator.");
      return;
    }
    setBusy(true);
    setPostError("");
    try {
      const d = await postCommentFn({
        data: {
          id,
          name: name || "Guest",
          message: message ?? msg,
          reaction: reaction || "",
          unlockToken,
        },
      });
      if (d.error) throw new Error(d.error);
      if (d.comment) {
        setComments((prev) => [...prev, d.comment]);
        if (!reaction) setMsg("");
      }
    } catch (error) {
      setPostError(error instanceof Error ? error.message : "Could not post your message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/30 p-6 shadow-2xl"
    >
      <div
        className="flex items-center gap-2 text-lg font-bold"
        style={{ fontFamily: "Georgia,serif", fontStyle: "italic" }}
      >
        <MessageCircle className="w-5 h-5" /> Guest Book
      </div>
      {!commentsEnabled && (
        <div
          className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
          data-testid="comments-disabled"
        >
          New comments and reactions are currently disabled.
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {QUICK_REACTIONS.map((r) => (
          <button
            key={r}
            onClick={() => post({ reaction: r })}
            disabled={busy || !commentsEnabled}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 transition text-xl grid place-items-center"
          >
            {r}
          </button>
        ))}
      </div>
      {postError && (
        <div className="mt-3 rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-white">
          {postError}
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          value={name}
          disabled={!commentsEnabled}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="sm:w-40 h-10 px-3 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/40 text-sm"
        />
        <input
          value={msg}
          disabled={!commentsEnabled}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Leave a heartfelt note…"
          maxLength={400}
          onKeyDown={(e) => {
            if (e.key === "Enter" && msg.trim()) post({});
          }}
          className="flex-1 h-10 px-4 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/40 text-sm"
        />
        <button
          onClick={() => msg.trim() && post({})}
          disabled={busy || !msg.trim() || !commentsEnabled}
          className="h-10 px-4 rounded-full bg-white text-purple-700 font-semibold text-sm inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          Post
        </button>
      </div>

      <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center text-white/70 text-sm py-4">
            Be the first to leave a note ✨
          </div>
        ) : (
          comments
            .slice()
            .reverse()
            .map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 border border-white/20"
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 border border-white/30 grid place-items-center font-bold text-sm">
                  {(c.name || "G").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm truncate">{c.name || "Guest"}</div>
                    <div className="text-[10px] text-white/60">
                      {new Date(c.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {c.message && (
                    <div className="text-sm text-white/95 mt-0.5 whitespace-pre-wrap break-words">
                      {c.message}
                    </div>
                  )}
                  {c.reaction && <div className="text-2xl mt-0.5">{c.reaction}</div>}
                </div>
              </motion.div>
            ))
        )}
      </div>
    </motion.div>
  );
};

/* -------- Wish Page -------- */
function WishPage() {
  const { site } = usePublicSettings();
  const [w, setW] = useState(null);
  const [err, setErr] = useState("");
  const [needsPw, setNeedsPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slideOpen, setSlideOpen] = useState(false);

  const getWishFn = useServerFn(getWish);

  // Extract ID from URL for TanStack Router
  const params = useParams({ from: "/wish/$id" });
  const wishId =
    w?.id ||
    params.id ||
    (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "");

  useEffect(() => {
    async function load() {
      console.log("Wish Viewer - Manually extracted ID:", wishId);

      if (!wishId || wishId === "wish") {
        setErr("Wish ID is missing");
        return;
      }

      try {
        const response = await fetch("/api/public/wish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: wishId }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errText}`);
        }

        const d = await response.json();
        console.log("Wish fetch result:", d);

        if (d.error) {
          setErr(d.error);
        } else if (d.protected) {
          setNeedsPw(true);
        } else {
          setW(d);
        }
      } catch (e) {
        console.error("Wish fetch crash detailed:", e);
        setErr("Failed to load: " + (e.message || "Unknown error"));
      }
    }
    load();
  }, [wishId]);

  // Use id for sub-components

  if (err)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Oops!</h1>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-xs mx-auto">
            {typeof err === "string" ? err : JSON.stringify(err)}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 dark:shadow-none"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </div>
    );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (needsPw && !w)
    return (
      <PasswordGate
        id={wishId}
        theme="birthday"
        onUnlock={(d) => {
          setW(d);
          setNeedsPw(false);
        }}
      />
    );
  if (!w)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        Loading…
      </div>
    );

  const t = THEMES[w.theme] || THEMES.birthday;
  const isFuture =
    w.eventDate && new Date(w.eventDate).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${t.bg} text-white relative overflow-hidden`}
      style={{ backgroundAttachment: "fixed" }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/70"
          style={{
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            opacity: 0.4 + (i % 4) * 0.15,
            animation: `floaty ${4 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {site.siteName}
          </Link>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/20 backdrop-blur border border-white/30 text-sm font-medium hover:bg-white/30 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Share
              </>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-8 rounded-[36px] bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden"
        >
          {w.cover && (
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full aspect-[16/8] overflow-hidden"
            >
              <img src={w.cover} alt="cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          )}
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-[80px] leading-none mb-4"
            >
              {t.emoji}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[42px] font-bold leading-tight"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
            >
              {w.title || t.title}
            </motion.h1>
            {w.recipient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 inline-flex items-center gap-1.5 text-lg font-semibold"
              >
                <Heart className="w-4 h-4 fill-pink-200 text-pink-200" /> {w.recipient}
              </motion.div>
            )}

            {isFuture && <Countdown date={w.eventDate} />}

            {w.video && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-6 rounded-2xl overflow-hidden ring-2 ring-white/40 shadow-lg"
              >
                <video
                  src={w.video}
                  controls
                  playsInline
                  className="w-full max-h-[420px] bg-black"
                />
              </motion.div>
            )}

            {w.photos?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <div
                  className={`grid gap-2 ${w.photos.length === 1 ? "grid-cols-1" : w.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
                >
                  {w.photos.slice(0, 6).map((p, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setSlideOpen(true)}
                      className="aspect-square rounded-xl overflow-hidden ring-2 ring-white/40 shadow-lg relative group"
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition grid place-items-center opacity-0 group-hover:opacity-100">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => setSlideOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/15 backdrop-blur border border-white/30 hover:bg-white/25 text-xs font-medium"
                >
                  <Play className="w-3.5 h-3.5" /> Play Slideshow
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <p className="text-white/95 leading-relaxed text-[16px] whitespace-pre-wrap">
                {w.message || "Wishing you all the happiness in the world!"}
              </p>
              {w.details && (
                <p className="mt-4 text-white/80 text-sm leading-relaxed border-t border-white/10 pt-4">
                  {w.details}
                </p>
              )}
            </motion.div>

            <NarrationButton src={w.narration} />

            {w.from && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 text-white/80 italic"
              >
                — with love, {w.from}
              </motion.div>
            )}
          </div>
        </motion.div>

        <GuestBook id={wishId} unlockToken={w.unlockToken} />

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-white text-purple-700 font-semibold text-sm shadow-lg hover:scale-105 transition"
          >
            <Sparkles className="w-4 h-4" /> Create Your Own Wish
          </Link>
          <div className="mt-3 text-white/60 text-xs">
            Powered by {site.siteName} · Viewed {w.views || 1} times
          </div>
        </div>
      </div>

      <MusicPlayer url={w.music} />
      <Slideshow photos={w.photos || []} open={slideOpen} onClose={() => setSlideOpen(false)} />

      <style>{`
        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
}

import { z } from "zod";

export const Route = createFileRoute("/wish/$id")({
  component: WishPage,
});
