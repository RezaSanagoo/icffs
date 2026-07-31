import React from "react";

// ─── آیکون‌ها ───────────────────────────────────────────

const ReelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M3 8h18M8 3l3 5M14 3l3 5" />
    <path d="M10.5 11.5l4.5 3-4.5 3v-6z" fill="#fff" stroke="none" />
  </svg>
);

const BoostIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

const HighlightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
    <path d="M12 8.5l1.2 2.4 2.6.4-1.9 1.9.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.9 2.6-.4L12 8.5z" fill="#fff" stroke="none" />
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

// ─── کامپوننت اصلی ──────────────────────────────────────

export default function InstagramStoryView() {
  return (
    <div style={s.screen}>
      {/* هدر */}

      {/* استیکر منشن */}
      <div style={s.mentionSticker}>@amirhossein.namavar</div>

      {/* اینپوت ریپلای */}
      <div style={s.replyBox}>
        <span style={s.replyText}>Say something...</span>
      </div>

      {/* نوار پایین */}
      <div style={s.bottomBar}>
        <div style={s.bottomItem}>
          <div style={s.activityAvatar}>👤</div>
          <span style={s.bottomLabel}>Activity</span>
        </div>
        <div style={s.bottomActions}>
          <div style={s.bottomItem}>
            <BoostIcon />
            <span style={s.bottomLabel}>Boost</span>
          </div>
          <div style={s.bottomItem}>
            <HighlightIcon />
            <span style={s.bottomLabel}>Highlight</span>
          </div>
          <div style={s.bottomItem}>
            <MoreIcon />
            <span style={s.bottomLabel}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── استایل‌ها ──────────────────────────────────────────

const s = {
  screen: {
    width: 390,
    height: 844,
    margin: "0 auto",
    background: "linear-gradient(180deg,#9a9a9c,#6b6b6d)",
    position: "relative",
    fontFamily: "-apple-system,'Segoe UI',Vazirmatn,sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },

  // هدر
  header: {
    position: "absolute",
    top: 16,
    left: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  dateRow: { display: "flex", gap: 8, alignItems: "baseline" },
  dateText: { color: "#fff", fontWeight: 600, fontSize: 14 },
  timeText: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  reelRow: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 },
  reelText: { color: "#fff", fontSize: 12 },

  // استیکر متنی
  captionSticker: {
    marginTop: 90,
    background: "#1a1a1a",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
  },

  // کارت ویدیو
  videoCard: {
    marginTop: 16,
    width: 260,
    borderRadius: 14,
    background: "#2b2b2e",
    padding: 10,
    position: "relative",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  },
  videoTopBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  videoMeta: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  goldText: {
    color: "#e02b2b",
    fontWeight: 800,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  videoPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 10,
    background: "linear-gradient(135deg,#4a4a4e,#1f1f22)",
  },
  timeBadge: {
    position: "absolute",
    bottom: 18,
    left: 18,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 4,
  },

  // منشن
  mentionSticker: {
    marginTop: 14,
    background: "rgba(255,255,255,0.25)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 14px",
    borderRadius: 8,
    letterSpacing: 0.3,
  },

  // اینپوت ریپلای
  replyBox: {
    position: "absolute",
    bottom: 92,
    left: 16,
    right: 16,
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: 24,
    padding: "12px 18px",
  },
  replyText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },

  // نوار پایین
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
  },
  bottomItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
  },
  bottomActions: { display: "flex", gap: 28 },
  activityAvatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },
  bottomLabel: { color: "#fff", fontSize: 11 },
};
