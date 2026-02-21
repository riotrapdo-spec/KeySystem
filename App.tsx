import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// CONFIG — Edit your links here
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  discordLink: "https://discord.gg/YOUR_DISCORD_INVITE",
  youtubeLink: "https://youtube.com/@YOUR_CHANNEL?sub_confirmation=1",
  linkvertiseUrl: "https://linkvertise.com/YOUR_LINKVERTISE_ID",
  secretSalt: "ZeroTrace_S4lt_2025_xK9m",
  brandName: "ZeroTrace",
};

// ═══════════════════════════════════════════════════════════
// HASH UTILITY — Same algorithm as Lua verifier
// ═══════════════════════════════════════════════════════════
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function generateKey(): Promise<string> {
  const dateStr = getDateString();
  const raw = dateStr + CONFIG.secretSalt;
  const hash = await sha256(raw);
  const hex9 = hash.substring(0, 9).toUpperCase();
  const p1 = hex9.substring(0, 3);
  const p2 = hex9.substring(3, 6);
  const p3 = hex9.substring(6, 9);
  return `[key${p1}-${p2}-${p3}]`;
}

// ═══════════════════════════════════════════════════════════
// PARTICLE BACKGROUND
// ═══════════════════════════════════════════════════════════
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 60, ${p.alpha})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 0, 60, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// SCANLINE OVERLAY
// ═══════════════════════════════════════════════════════════
function ScanlineOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// GLITCH TEXT
// ═══════════════════════════════════════════════════════════
function GlitchText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="glitch-text" data-text={text}>
        {text}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP BUTTON
// ═══════════════════════════════════════════════════════════
function StepButton({
  step,
  label,
  sublabel,
  icon,
  completed,
  counting,
  countdown,
  disabled,
  onClick,
}: {
  step: number;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  completed: boolean;
  counting: boolean;
  countdown: number;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || completed || counting}
      className={`group relative w-full p-5 rounded-xl border transition-all duration-500 text-left
        ${
          completed
            ? "border-green-500/50 bg-green-500/5"
            : counting
              ? "border-yellow-500/50 bg-yellow-500/5 cursor-wait"
              : disabled
                ? "border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed"
                : "border-[#ff003c]/30 bg-[#ff003c]/5 hover:border-[#ff003c]/60 hover:bg-[#ff003c]/10 hover:shadow-[0_0_30px_rgba(255,0,60,0.15)] cursor-pointer"
        }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all duration-500
          ${
            completed
              ? "bg-green-500/20 text-green-400"
              : counting
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-[#ff003c]/20 text-[#ff003c]"
          }`}
        >
          {completed ? (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : counting ? (
            <span className="text-lg tabular-nums">{countdown}</span>
          ) : (
            icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
              Step {step}
            </span>
            {completed && (
              <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                VERIFIED
              </span>
            )}
            {counting && (
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full animate-pulse">
                VERIFYING...
              </span>
            )}
          </div>
          <p className="text-white font-semibold mt-0.5">{label}</p>
          <p className="text-white/40 text-sm mt-0.5">{sublabel}</p>
        </div>
        <div
          className={`flex-shrink-0 transition-all ${completed ? "text-green-400" : counting ? "text-yellow-400" : "text-[#ff003c]/50 group-hover:text-[#ff003c]"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>
      {counting && (
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500/60 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════
function LandingPage() {
  const [discordDone, setDiscordDone] = useState(false);
  const [youtubeDone, setYoutubeDone] = useState(false);
  const [discordCounting, setDiscordCounting] = useState(false);
  const [youtubeCounting, setYoutubeCounting] = useState(false);
  const [discordCountdown, setDiscordCountdown] = useState(5);
  const [youtubeCountdown, setYoutubeCountdown] = useState(5);

  const handleDiscord = useCallback(() => {
    if (discordDone || discordCounting) return;
    window.open(CONFIG.discordLink, "_blank");
    setDiscordCounting(true);
    setDiscordCountdown(5);
    let c = 5;
    const interval = setInterval(() => {
      c--;
      setDiscordCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        setDiscordCounting(false);
        setDiscordDone(true);
      }
    }, 1000);
  }, [discordDone, discordCounting]);

  const handleYoutube = useCallback(() => {
    if (youtubeDone || youtubeCounting) return;
    window.open(CONFIG.youtubeLink, "_blank");
    setYoutubeCounting(true);
    setYoutubeCountdown(5);
    let c = 5;
    const interval = setInterval(() => {
      c--;
      setYoutubeCountdown(c);
      if (c <= 0) {
        clearInterval(interval);
        setYoutubeCounting(false);
        setYoutubeDone(true);
      }
    }, 1000);
  }, [youtubeDone, youtubeCounting]);

  const bothDone = discordDone && youtubeDone;

  const handleGetKey = () => {
    if (!bothDone) return;
    localStorage.setItem("zt_timestamp", Date.now().toString());
    window.location.href = CONFIG.linkvertiseUrl;
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[#ff003c]/20 bg-[#ff003c]/5">
          <span className="w-2 h-2 rounded-full bg-[#ff003c] animate-pulse" />
          <span className="text-xs font-mono text-[#ff003c]/80 tracking-widest uppercase">
            Key System v2.0
          </span>
        </div>
        <GlitchText
          text={CONFIG.brandName}
          className="text-5xl sm:text-7xl font-black tracking-tighter"
        />
        <p className="text-white/30 mt-3 font-mono text-sm max-w-md mx-auto">
          Complete the verification steps below to generate your access key.
          <br />
          <span className="text-[#ff003c]/60">
            All steps are mandatory.
          </span>
        </p>
      </div>

      {/* Steps Container */}
      <div className="w-full max-w-lg space-y-4">
        {/* Step 1 — Discord */}
        <StepButton
          step={1}
          label="Join Our Discord Server"
          sublabel="Connect with the community"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.3 13.3 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028Z" />
            </svg>
          }
          completed={discordDone}
          counting={discordCounting}
          countdown={discordCountdown}
          disabled={false}
          onClick={handleDiscord}
        />

        {/* Step 2 — YouTube */}
        <StepButton
          step={2}
          label="Subscribe on YouTube"
          sublabel="Stay updated with latest scripts"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
            </svg>
          }
          completed={youtubeDone}
          counting={youtubeCounting}
          countdown={youtubeCountdown}
          disabled={!discordDone}
          onClick={handleYoutube}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff003c]/20 to-transparent" />
          <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">
            {bothDone ? "Unlocked" : "Locked"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff003c]/20 to-transparent" />
        </div>

        {/* Get Key Button */}
        <button
          onClick={handleGetKey}
          disabled={!bothDone}
          className={`group relative w-full p-5 rounded-xl border text-center font-bold text-lg transition-all duration-500
            ${
              bothDone
                ? "border-[#ff003c]/60 bg-[#ff003c]/10 text-[#ff003c] hover:bg-[#ff003c]/20 hover:shadow-[0_0_50px_rgba(255,0,60,0.25)] cursor-pointer active:scale-[0.98]"
                : "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
            }`}
        >
          {bothDone && (
            <div className="absolute inset-0 rounded-xl bg-[#ff003c]/5 animate-pulse" />
          )}
          <div className="relative flex items-center justify-center gap-3">
            {bothDone ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
            <span>
              {bothDone
                ? "Get Key via Linkvertise"
                : "Complete Steps to Unlock"}
            </span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-white/15 text-xs font-mono">
          {CONFIG.brandName} © {new Date().getFullYear()} — Anti-Bypass
          Protected
        </p>
      </div>

      {/* Direct Key Page Link (for after Linkvertise redirect) */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            window.location.hash = "#/key";
            window.location.reload();
          }}
          className="text-white/5 hover:text-white/20 text-[10px] font-mono transition-colors"
        >
          ↵
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KEY PAGE
// ═══════════════════════════════════════════════════════════
function KeyPage() {
  const [status, setStatus] = useState<
    "checking" | "bypassed" | "generating" | "ready"
  >("checking");
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    const check = async () => {
      // Simulate checking animation
      await new Promise((r) => setTimeout(r, 1500));

      const tsStr = localStorage.getItem("zt_timestamp");
      if (!tsStr) {
        setErrorDetail("No verification timestamp found. Complete Step 1 & 2 first.");
        setStatus("bypassed");
        return;
      }

      const ts = parseInt(tsStr, 10);
      const elapsed = (Date.now() - ts) / 1000;

      if (elapsed < 15) {
        setErrorDetail(
          `Timestamp too recent (${elapsed.toFixed(1)}s). Minimum 15s required. Ad bypass detected.`
        );
        setStatus("bypassed");
        return;
      }

      // Clear timestamp after successful use (one-time use)
      localStorage.removeItem("zt_timestamp");

      setStatus("generating");
      await new Promise((r) => setTimeout(r, 2000));

      const generatedKey = await generateKey();
      setKey(generatedKey);
      setStatus("ready");
    };
    check();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGoBack = () => {
    window.location.hash = "";
    window.location.reload();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <GlitchText
            text={CONFIG.brandName}
            className="text-4xl sm:text-5xl font-black tracking-tighter"
          />
          <p className="text-white/30 mt-2 font-mono text-xs tracking-widest uppercase">
            Key Generation Terminal
          </p>
        </div>

        {/* Status: Checking */}
        {status === "checking" && (
          <div className="border border-[#ff003c]/20 bg-black/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#ff003c]/30 mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff003c] animate-spin" />
              <svg
                className="w-7 h-7 text-[#ff003c]/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-1">
              Security Verification
            </h2>
            <p className="text-white/40 font-mono text-sm">
              Validating anti-bypass timestamp...
            </p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff003c] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff003c] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff003c] animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Status: Bypass Detected */}
        {status === "bypassed" && (
          <div className="border border-red-500/40 bg-red-500/5 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-red-400 font-bold text-xl mb-2">
              ⚠ BYPASS DETECTED
            </h2>
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-4">
              <p className="text-red-300/70 font-mono text-xs leading-relaxed">
                {errorDetail}
              </p>
            </div>
            <p className="text-white/30 text-sm mb-6">
              Please complete the verification steps properly.
            </p>
            <button
              onClick={handleGoBack}
              className="px-6 py-2.5 rounded-lg border border-[#ff003c]/40 bg-[#ff003c]/10 text-[#ff003c] font-semibold hover:bg-[#ff003c]/20 transition-all cursor-pointer"
            >
              ← Go Back to Verification
            </button>
          </div>
        )}

        {/* Status: Generating */}
        {status === "generating" && (
          <div className="border border-[#ff003c]/20 bg-black/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#ff003c]/20 mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff003c] border-r-[#ff003c]/50 animate-spin" />
              <svg
                className="w-7 h-7 text-[#ff003c]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-1">
              Generating Your Key
            </h2>
            <p className="text-white/40 font-mono text-sm">
              Running cryptographic hash...
            </p>
            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-gradient-to-r from-[#ff003c] to-[#ff003c]/50 rounded-full animate-[loading_2s_ease-in-out]" />
            </div>
          </div>
        )}

        {/* Status: Ready */}
        {status === "ready" && (
          <div className="space-y-4">
            <div className="border border-green-500/30 bg-green-500/5 backdrop-blur-sm rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <svg
                  className="w-7 h-7 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-green-400/80 text-xs font-mono uppercase tracking-widest mb-4">
                Key Generated Successfully
              </p>

              {/* Key Display */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff003c]/20 via-[#ff003c]/10 to-[#ff003c]/20 rounded-xl blur-sm group-hover:blur-md transition-all" />
                <div className="relative bg-black border border-[#ff003c]/30 rounded-xl p-5">
                  <p className="text-[#ff003c] font-mono text-2xl sm:text-3xl font-bold tracking-wider neon-text select-all">
                    {key}
                  </p>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`mt-5 px-8 py-3 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer
                  ${
                    copied
                      ? "bg-green-500/20 border border-green-500/40 text-green-400"
                      : "bg-[#ff003c]/10 border border-[#ff003c]/40 text-[#ff003c] hover:bg-[#ff003c]/20 hover:shadow-[0_0_30px_rgba(255,0,60,0.2)]"
                  }`}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied to Clipboard!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Key
                  </span>
                )}
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-white/5 bg-white/[0.02] rounded-lg p-3 text-center">
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                  Expires
                </p>
                <p className="text-white/60 text-sm font-bold mt-1">24 Hours</p>
              </div>
              <div className="border border-white/5 bg-white/[0.02] rounded-lg p-3 text-center">
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                  Date
                </p>
                <p className="text-white/60 text-sm font-bold mt-1">
                  {getDateString()}
                </p>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="border border-white/5 bg-white/[0.02] rounded-lg p-4">
              <p className="text-white/30 text-xs font-mono mb-2 uppercase tracking-widest">
                How to Use
              </p>
              <ol className="text-white/50 text-sm space-y-1.5 list-decimal list-inside">
                <li>Copy the key above</li>
                <li>
                  Open the script executor in Roblox
                </li>
                <li>Paste the key when prompted</li>
                <li>Enjoy {CONFIG.brandName}!</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/15 text-xs font-mono">
          {CONFIG.brandName} © {new Date().getFullYear()} — Cryptographic Key
          System
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP — Hash-based routing
// ═══════════════════════════════════════════════════════════
export function App() {
  const [page, setPage] = useState<"landing" | "key">("landing");

  useEffect(() => {
    const checkHash = () => {
      if (
        window.location.hash === "#/key" ||
        window.location.hash === "#key"
      ) {
        setPage("key");
      } else {
        setPage("landing");
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticleCanvas />
      <ScanlineOverlay />
      {page === "landing" ? <LandingPage /> : <KeyPage />}
    </div>
  );
}
