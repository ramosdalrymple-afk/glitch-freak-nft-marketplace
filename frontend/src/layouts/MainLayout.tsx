import { ConnectButton } from "@mysten/dapp-kit";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 1. Import Framer Motion

interface Props {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: "marketplace" | "inventory" | "burn" | "mint") => void;
}

const THEME = {
  bg: "#0B0F1A",
  accent: "#7CFF00",
  highlight: "#FF2F92",
  secondary: "#00E5FF",
  border: "#2A2A35",
  textMuted: "#666666"
};

// 2. NEW COMPONENT: The Lightning Bolt Animation
const LightningBolt = () => {
  return (
    <motion.svg
      viewBox="0 0 100 50"
      fill="none"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        mixBlendMode: "hard-light" // Makes it look like glowing light
      }}
    >
      {/* Bolt 1: Cyan Main Strike */}
      <motion.path
        d="M-10,0 L30,40 L40,10 L70,50 L110,0" // Zig-zag path across the button
        stroke={THEME.secondary}
        strokeWidth="4"
        strokeLinecap="square"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1.2], // Draw past the end
          opacity: [0, 1, 0]    // Flash on then off
        }}
        transition={{ duration: 0.2, ease: "linear" }}
      />
      
      {/* Bolt 2: Pink Secondary Arcs (for chaos) */}
      <motion.path
        d="M20,0 L40,30 L30,50"
        stroke={THEME.highlight}
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 0.15, delay: 0.05 }}
      />
    </motion.svg>
  );
};

export const MainLayout = ({ children, activeTab, setActiveTab }: Props) => {
  const [glitchingTab, setGlitchingTab] = useState<string | null>(null);

  const handleTabChange = (tab: any) => {
    if (tab === activeTab) return;

    setGlitchingTab(tab);
    setActiveTab(tab);

    setTimeout(() => {
      setGlitchingTab(null);
    }, 300);
  };

  return (
    <div style={{ 
      backgroundColor: THEME.bg, 
      minHeight: "100vh", 
      color: "#ffffff",
      fontFamily: "'Courier New', Courier, monospace",
      backgroundImage: `radial-gradient(${THEME.border} 1px, transparent 1px)`,
      backgroundSize: "20px 20px"
    }}>
      {/* CSS Keyframes for the button SHAKE (The physical impact) */}
      <style>{`
        @keyframes tab-shake {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(3px, -3px); }
          60% { transform: translate(-3px, 0); }
          80% { transform: translate(3px, 0); }
          100% { transform: translate(0); }
        }
        
        .glitch-active {
          animation: tab-shake 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          background-color: #fff !important; /* Flash white when struck */
          color: #000 !important;
          border-color: #fff !important;
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* --- HEADER --- */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 0", borderBottom: `2px solid ${THEME.border}` }}>
          <div style={{ position: "relative" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-1px", margin: 0, fontFamily: "sans-serif", textTransform: "uppercase", fontStyle: "italic", textShadow: `4px 4px 0px ${THEME.highlight}` }}>
              GLITCH <span style={{ color: THEME.secondary }}>FREAK</span>
            </h1>
            <span style={{ position: "absolute", top: "-10px", right: "-20px", fontSize: "10px", background: THEME.accent, color: "black", padding: "2px 4px", fontWeight: "bold", transform: "rotate(10deg)" }}>
              BETA
            </span>
          </div>

          <div style={{ border: `1px solid ${THEME.border}`, padding: "4px", background: "black", boxShadow: "4px 4px 0px rgba(0,0,0,0.5)" }}>
            <ConnectButton />
          </div>
        </header>

        {/* --- NAVIGATION TABS --- */}
        <nav style={{ display: "flex", gap: "12px", marginTop: "30px", marginBottom: "10px" }}>
          {(["marketplace", "inventory", "mint", "burn"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const isGlitching = glitchingTab === tab;
            
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={isGlitching ? "glitch-active" : ""}
                style={{
                  flex: 1,
                  padding: "16px 0",
                  // Important: relative positioning so lightning stays inside (or over) the button
                  position: "relative",
                  overflow: "hidden", 
                  
                  border: isActive ? `2px solid ${THEME.accent}` : `1px solid ${THEME.border}`,
                  background: isActive ? THEME.accent : "rgba(0,0,0,0.3)",
                  color: isActive ? "black" : THEME.textMuted,
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "sans-serif",
                  letterSpacing: "1px",
                  transition: "all 0.1s ease",
                  transform: isActive && !isGlitching ? "translate(-2px, -2px)" : "none",
                  boxShadow: isActive && !isGlitching ? `4px 4px 0px ${THEME.highlight}` : "none",
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)"
                }}
              >
                {/* 3. LIGHTNING OVERLAY: Renders only during glitch state */}
                <AnimatePresence>
                  {isGlitching && <LightningBolt />}
                </AnimatePresence>

                {/* Tab Label (Wrapped in span to ensure z-index stays above bg) */}
                <span style={{ position: "relative", zIndex: 2 }}>
                  {tab === "burn" ? "🔥 INCINERATOR" : 
                   tab === "mint" ? "🧪 LAB (MINT)" : 
                   tab === "inventory" ? "🎒 STASH" : 
                   "📡 MARKET"}
                </span>

                {/* Active Decoration */}
                {isActive && (
                  <span style={{ position: "absolute", top: "2px", left: "2px", width: "4px", height: "4px", background: "white", zIndex: 2 }} />
                )}
              </button>
            );
          })}
        </nav>
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.textMuted, marginBottom: "40px", fontFamily: "monospace" }}>
             <span>/// SYSTEM_ONLINE</span>
             <span>BLOCK_HEIGHT: SYNCED</span>
        </div>

        {/* --- PAGE CONTENT --- */}
        <main style={{ 
            position: "relative", 
            minHeight: "60vh",
            border: `1px dashed ${THEME.border}`,
            background: "rgba(0,0,0,0.2)"
        }}>
            <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "10px", height: "10px", borderTop: `2px solid ${THEME.secondary}`, borderLeft: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "10px", height: "10px", borderTop: `2px solid ${THEME.secondary}`, borderRight: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", bottom: "-1px", left: "-1px", width: "10px", height: "10px", borderBottom: `2px solid ${THEME.secondary}`, borderLeft: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "10px", height: "10px", borderBottom: `2px solid ${THEME.secondary}`, borderRight: `2px solid ${THEME.secondary}` }} />
            
            {children}
        </main>

        <footer style={{ marginTop: "60px", padding: "20px 0", borderTop: `1px solid ${THEME.border}`, textAlign: "center", color: THEME.textMuted, fontSize: "12px" }}>
            <p>NO RIGHTS RESERVED. COPYLEFT 2025.</p>
        </footer>
      </div>
    </div>
  );
};