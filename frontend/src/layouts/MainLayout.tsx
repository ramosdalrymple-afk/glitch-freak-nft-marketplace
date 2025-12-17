import { ConnectButton } from "@mysten/dapp-kit";
import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: "marketplace" | "inventory" | "burn" | "mint") => void;
}

// --- SHARED THEME CONSTANTS ---
const THEME = {
  bg: "#0B0F1A",        // Midnight Ink
  accent: "#7CFF00",    // Radioactive Green
  highlight: "#FF2F92", // Toxic Pink
  secondary: "#00E5FF", // Glitch Cyan
  border: "#2A2A35",    // Dark Gray Border
  textMuted: "#666666"
};

export const MainLayout = ({ children, activeTab, setActiveTab }: Props) => {
  return (
    <div style={{ 
      backgroundColor: THEME.bg, 
      minHeight: "100vh", 
      color: "#ffffff",
      fontFamily: "'Courier New', Courier, monospace", // Monospace for that "Terminal" feel
      backgroundImage: `radial-gradient(${THEME.border} 1px, transparent 1px)`, // Subtle dot grid background
      backgroundSize: "20px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* --- HEADER --- */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "32px 0",
          borderBottom: `2px solid ${THEME.border}`
        }}>
          {/* Logo Area */}
          <div style={{ position: "relative" }}>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: 900, 
              letterSpacing: "-1px", 
              margin: 0, 
              fontFamily: "sans-serif", // Keep title heavy sans-serif
              textTransform: "uppercase",
              fontStyle: "italic",
              // The Glitch Shadow Effect
              textShadow: `4px 4px 0px ${THEME.highlight}` 
            }}>
              GLITCH <span style={{ color: THEME.secondary }}>FREAK</span>
            </h1>
            <span style={{ 
              position: "absolute", 
              top: "-10px", 
              right: "-20px", 
              fontSize: "10px", 
              background: THEME.accent, 
              color: "black", 
              padding: "2px 4px", 
              fontWeight: "bold",
              transform: "rotate(10deg)"
            }}>
              BETA
            </span>
          </div>

          {/* Connect Button Wrapper - adding a border to make it fit */}
          <div style={{ 
            border: `1px solid ${THEME.border}`, 
            padding: "4px", 
            background: "black",
            boxShadow: "4px 4px 0px rgba(0,0,0,0.5)" 
          }}>
            <ConnectButton />
          </div>
        </header>

        {/* --- NAVIGATION TABS --- */}
        <nav style={{ 
          display: "flex", 
          gap: "12px", 
          marginTop: "30px",
          marginBottom: "10px"
        }}>
          {(["marketplace", "inventory", "mint", "burn"] as const).map((tab) => {
            const isActive = activeTab === tab;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, // Make tabs stretch evenly
                  padding: "16px 0",
                  border: isActive ? `2px solid ${THEME.accent}` : `1px solid ${THEME.border}`,
                  background: isActive ? THEME.accent : "rgba(0,0,0,0.3)",
                  color: isActive ? "black" : THEME.textMuted,
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "sans-serif",
                  letterSpacing: "1px",
                  position: "relative",
                  transition: "all 0.1s ease",
                  // Active tabs pop up and get a hard shadow
                  transform: isActive ? "translate(-2px, -2px)" : "none",
                  boxShadow: isActive ? `4px 4px 0px ${THEME.highlight}` : "none",
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)" // Slight cut corner
                }}
              >
                {/* Decoration for active tab */}
                {isActive && (
                  <span style={{ position: "absolute", top: "2px", left: "2px", width: "4px", height: "4px", background: "white" }} />
                )}
                
                {/* Labels */}
                {tab === "burn" ? "🔥 INCINERATOR" : 
                 tab === "mint" ? "🧪 LAB (MINT)" : 
                 tab === "inventory" ? "🎒 STASH" : 
                 "📡 MARKET"}
              </button>
            );
          })}
        </nav>
        
        {/* Decorative Status Bar below nav */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.textMuted, marginBottom: "40px", fontFamily: "monospace" }}>
             <span>/// SYSTEM_ONLINE</span>
             <span>BLOCK_HEIGHT: SYNCED</span>
        </div>

        {/* --- PAGE CONTENT --- */}
        <main style={{ 
            position: "relative", 
            minHeight: "60vh",
            border: `1px dashed ${THEME.border}`, // Frame the content area
            background: "rgba(0,0,0,0.2)"
        }}>
            {/* Corner Markers for decoration */}
            <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "10px", height: "10px", borderTop: `2px solid ${THEME.secondary}`, borderLeft: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "10px", height: "10px", borderTop: `2px solid ${THEME.secondary}`, borderRight: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", bottom: "-1px", left: "-1px", width: "10px", height: "10px", borderBottom: `2px solid ${THEME.secondary}`, borderLeft: `2px solid ${THEME.secondary}` }} />
            <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "10px", height: "10px", borderBottom: `2px solid ${THEME.secondary}`, borderRight: `2px solid ${THEME.secondary}` }} />
            
            {children}
        </main>

        {/* --- FOOTER --- */}
        <footer style={{ marginTop: "60px", padding: "20px 0", borderTop: `1px solid ${THEME.border}`, textAlign: "center", color: THEME.textMuted, fontSize: "12px" }}>
            <p>NO RIGHTS RESERVED. COPYLEFT 2025.</p>
        </footer>
      </div>
    </div>
  );
};