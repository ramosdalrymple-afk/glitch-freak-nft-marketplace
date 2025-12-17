import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; // NEW IMPORT

// --- THEME CONSTANTS ---
const THEME = {
  bg: "#0B0F1A",        
  cardBg: "#14161F",    
  accent: "#7CFF00",    // Green (Gamma/Common/Success)
  highlight: "#FF2F92", // Pink (Alpha/Rare/Error)
  secondary: "#00E5FF", // Cyan (Beta/Uncommon)
  text: "#ffffff",
  muted: "#666666",
  border: "#2A2A35",
  danger: "#FF4444"     
};

// --- HELPER: ROBUST ATTRIBUTE EXTRACTOR ---
const getAttribute = (item: any, key: string): string => {
  if (!item || !item.data) return "N/A";

  const content = item.data.content?.fields || {};
  const display = item.data.display?.data || {};
  const searchKey = key.toLowerCase();

  // 1. CHECK DIRECT FIELDS
  for (const fieldName in content) {
    if (fieldName.toLowerCase() === searchKey) return content[fieldName];
  }

  // 2. CHECK DISPLAY METADATA
  for (const displayKey in display) {
    if (displayKey.toLowerCase() === searchKey) return display[displayKey];
  }

  // 3. CHECK ATTRIBUTE VECTORS
  const vectorNames = ["attributes", "metadata", "traits", "properties"];
  for (const vecName of vectorNames) {
      const list = content[vecName];
      if (Array.isArray(list)) {
          const found = list.find((attr: any) => {
              const k = (attr.fields?.key || attr.fields?.name || attr.key || attr.name || "").toString().toLowerCase();
              return k === searchKey;
          });
          if (found) return found.fields?.value || found.value;
      }
  }

  // 4. CHECK PARALLEL ARRAYS
  const keys = content.keys || content.attribute_keys || content.names;
  const values = content.values || content.attribute_values;
  if (Array.isArray(keys) && Array.isArray(values)) {
      const idx = keys.findIndex((k: string) => k.toString().toLowerCase() === searchKey);
      if (idx !== -1 && values[idx]) return values[idx];
  }

  return "N/A";
};

// --- COMPONENT: TRANSACTION FEEDBACK MODAL (ANIMATED) ---
function TransactionFeedback({ type, message, onClose }: { type: 'success' | 'error', message: string, onClose: () => void }) {
  const isSuccess = type === 'success';
  const primaryColor = isSuccess ? THEME.accent : THEME.danger;
  const title = isSuccess ? "ASSET LISTED" : "CRITICAL FAILURE"; 
  const icon = isSuccess ? "✓" : "!";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      {/* 3D ENTRY ANIMATION */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          width: "450px", maxWidth: "90%",
          background: THEME.bg,
          position: "relative",
          perspective: "1000px"
        }}
      >
        {/* PULSING GLOW BORDER */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 10px ${primaryColor}20`,
              `0 0 40px ${primaryColor}60`, // High intensity pulse
              `0 0 10px ${primaryColor}20`
            ],
            borderColor: primaryColor
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            border: `2px solid ${primaryColor}`,
            padding: "2px", // Inner border effect
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* MOVING LIGHT SHEEN EFFECT */}
          <motion.div
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: "linear" }}
            style={{
              position: "absolute", top: 0, width: "50%", height: "100%",
              background: `linear-gradient(90deg, transparent, ${primaryColor}20, transparent)`,
              transform: "skewX(-20deg)",
              pointerEvents: "none",
              zIndex: 1
            }}
          />

          {/* DECORATIVE CORNERS */}
          <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "10px", height: "10px", background: primaryColor, zIndex: 2 }}></div>
          <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", background: primaryColor, zIndex: 2 }}></div>

          {/* HEADER */}
          <div style={{ background: primaryColor, padding: "10px", display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 2 }}>
            <div style={{
              background: "black", color: primaryColor, width: "24px", height: "24px",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
            }}>
              {icon}
            </div>
            <h3 style={{ margin: 0, color: "black", fontSize: "16px", fontWeight: "900", letterSpacing: "2px" }}>
              {title}
            </h3>
          </div>

          {/* BODY */}
          <div style={{ padding: "30px", textAlign: "center", position: "relative", zIndex: 2 }}>
            <p style={{
              fontFamily: "monospace", color: "white", fontSize: "14px", lineHeight: "1.5",
              borderLeft: `2px solid ${THEME.border}`, paddingLeft: "15px", margin: "0 0 20px 0", textAlign: "left"
            }}>
              {type === 'error' ? "ERROR_LOG: " : "TRANSACTION_HASH: "}<br />
              <span style={{ color: type === 'error' ? "#ff8888" : "#ccffcc", wordBreak: "break-all" }}>
                {message}
              </span>
            </p>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05, backgroundColor: primaryColor, color: "black" }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "transparent",
                border: `1px solid ${primaryColor}`,
                color: primaryColor,
                padding: "12px 30px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "1px",
                width: "100%",
              }}
            >
              {isSuccess ? "CONFIRM & CLOSE" : "ACKNOWLEDGE ERROR"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- MAIN COMPONENT: INVENTORY ---
export function Inventory({ onSuccess }: { onSuccess: () => void }) {
  const account = useCurrentAccount();
  const [itemToSell, setItemToSell] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: userObjects, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: { showType: true, showDisplay: true, showContent: true },
    },
    { enabled: !!account }
  );

  const allItems = useMemo(() => {
    return (userObjects?.data || [])
      .filter((obj) => obj.data?.type?.toLowerCase().includes("freak"))
      .map((obj) => {
        const shortType = obj.data?.type?.split("::").slice(-1)[0] || "Unknown";
        return { ...obj, shortType };
      });
  }, [userObjects]);

  const categories = useMemo(() => {
    const uniqueTypes = new Set(allItems.map((item) => item.shortType));
    return ["All", ...Array.from(uniqueTypes)];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return allItems;
    return allItems.filter((item) => item.shortType === selectedCategory);
  }, [allItems, selectedCategory]);

  const getImageUrl = (obj: any) => {
    const display = obj.data?.display?.data;
    const fields = obj.data?.content?.fields;
    return display?.image_url || display?.url || fields?.url || fields?.image_url || fields?.img_url || null;
  };

  const getName = (obj: any) => {
    const display = obj.data?.display?.data;
    const fields = obj.data?.content?.fields;
    return display?.name || fields?.name || obj.shortType || "Unknown Artifact";
  };

  if (!account) return <div style={{ padding: "40px", textAlign: "center", color: THEME.muted, fontFamily: "monospace" }}>/// WALLET_DISCONNECTED</div>;

  return (
    <div style={{ padding: "40px 20px", background: THEME.bg, minHeight: "100vh", fontFamily: "'Courier New', Courier, monospace" }}>
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", borderBottom: `2px solid ${THEME.border}`, paddingBottom: "20px", flexWrap: "wrap", gap: "20px" }}>
        <div>
            <h2 style={{ fontSize: "42px", textTransform: "uppercase", margin: 0, color: "white", textShadow: `3px 3px 0px ${THEME.secondary}` }}>
              Your <span style={{ color: THEME.highlight }}>Stash</span>
            </h2>
            <p style={{ color: THEME.accent, margin: "5px 0 0 0", fontSize: "12px", letterSpacing: "1px" }}>/// ITEM_COUNT: {filteredItems.length}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
                style={{
                    padding: "8px 16px",
                    background: selectedCategory === cat ? THEME.secondary : "transparent",
                    color: selectedCategory === cat ? "black" : THEME.secondary,
                    border: `1px solid ${THEME.secondary}`,
                    cursor: "pointer", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase",
                    boxShadow: selectedCategory === cat ? `0 0 10px ${THEME.secondary}80` : "none",
                    transition: "all 0.2s"
                }}
            >
                {selectedCategory === cat ? `> ${cat}` : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ border: `1px dashed ${THEME.muted}`, padding: "40px", textAlign: "center", color: THEME.muted, borderRadius: "8px" }}>NO ARTIFACTS FOUND IN THIS SECTOR.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px" }}>
          {filteredItems.map((obj) => (
            <InventoryCard 
                key={obj.data?.objectId}
                obj={obj}
                imgUrl={getImageUrl(obj)}
                name={getName(obj)}
                onList={() => setItemToSell({ ...obj, imgUrl: getImageUrl(obj), name: getName(obj) })} 
            />
          ))}
        </div>
      )}

      {itemToSell && (
        <ListModal 
            item={itemToSell} 
            onClose={() => setItemToSell(null)} 
            onSuccess={() => { refetch(); onSuccess(); }}
        />
      )}
    </div>
  );
}

// --- CARD COMPONENT ---
function InventoryCard({ obj, imgUrl, name, onList }: { obj: any, imgUrl: any, name: string, onList: () => void }) {
    const [isHovered, setIsHovered] = useState(false);
    const mutationClass = getAttribute(obj, "MUTATION_CLASS");
    const volatility = getAttribute(obj, "VOLATILITY_INDEX");

    const rarityColor = mutationClass.toUpperCase().includes("ALPHA") ? THEME.highlight 
                      : mutationClass.toUpperCase().includes("BETA") ? THEME.secondary 
                      : THEME.accent;

    return (
        <div 
            onClick={onList}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                background: THEME.cardBg,
                border: isHovered ? `2px solid ${rarityColor}` : `2px solid ${THEME.border}`,
                padding: "12px", 
                transition: "all 0.1s ease",
                boxShadow: isHovered ? `6px 6px 0px ${rarityColor}` : "none",
                transform: isHovered ? "translate(-2px, -2px)" : "none",
                position: "relative",
                cursor: "pointer"
            }}
        >
            {/* IMAGE AREA */}
            <div style={{ 
                height: "220px", 
                background: "#000", 
                marginBottom: "12px", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                overflow: "hidden", borderBottom: `2px solid ${THEME.border}`,
                position: "relative"
            }}>
                {imgUrl ? (
                    <img src={imgUrl} alt="nft" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isHovered ? "grayscale(0%)" : "grayscale(60%)", transition: "filter 0.3s" }} />
                ) : (
                    <span style={{color: THEME.muted, fontSize: "10px"}}>NO_IMAGE_DATA</span>
                )}
                <div style={{ 
                    position: "absolute", top: "5px", right: "5px", 
                    background: "rgba(0,0,0,0.8)", border: `1px solid ${rarityColor}`,
                    color: rarityColor, fontSize: "9px", padding: "2px 6px", fontWeight: "bold"
                }}>
                    {mutationClass !== "N/A" ? mutationClass.split('_')[0] : "UNK"}
                </div>
            </div>
            
            {/* INFO AREA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                <div style={{ overflow: "hidden", maxWidth: "60%" }}>
                    <div style={{ fontSize: "16px", color: "white", fontWeight: "bold", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {name}
                    </div>
                </div>
                 <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0", fontSize: "10px", color: THEME.muted, textTransform: "uppercase" }}>TYPE</p>
                      <p style={{ margin: "0", fontSize: "12px", color: THEME.secondary, fontWeight: "bold" }}>{obj.shortType}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "flex", justifyContent: "space-between", background: "#000", padding: "8px", border: `1px solid ${THEME.border}` }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "9px", color: THEME.muted }}>CLASS</span>
                    <span style={{ fontSize: "10px", color: rarityColor, fontWeight: "bold" }}>{mutationClass === "N/A" ? "---" : mutationClass}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "9px", color: THEME.muted }}>VOLATILITY</span>
                    <span style={{ fontSize: "10px", color: "white", fontWeight: "bold" }}>{volatility === "N/A" ? "---" : volatility}</span>
                </div>
            </div>

            {/* ACTION BAR */}
            <div style={{
                marginTop: "12px",
                background: isHovered ? rarityColor : "black",
                color: isHovered ? "black" : "white", 
                padding: "8px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "background 0.2s"
            }}>
                {isHovered ? ">> OPEN PANEL <<" : "VIEW / SELL"}
            </div>
        </div>
    )
}

// --- UPDATED LIST MODAL ---
function ListModal({ item, onClose, onSuccess }: { item: any, onClose: () => void, onSuccess: () => void }) {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const packageId = useNetworkVariable("packageId");
    const marketplaceId = useNetworkVariable("marketplaceId");
    
    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Feedback State
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const dna = getAttribute(item, "DNA_SEQUENCE");
    const mutationClass = getAttribute(item, "MUTATION_CLASS");
    const volatility = getAttribute(item, "VOLATILITY_INDEX");

    const getClassColor = (c: string) => {
        const val = c.toUpperCase();
        if (val.includes("ALPHA")) return THEME.highlight;
        if (val.includes("BETA")) return THEME.secondary;
        if (val.includes("GAMMA")) return THEME.accent;
        return "white";
    };

    const handleList = () => {
        if (!price) return;
        setIsSubmitting(true);
        try {
            const priceInMist = BigInt(Math.floor(parseFloat(price) * 1_000_000_000));
            const tx = new Transaction();
            tx.moveCall({
                target: `${packageId}::freak_marketplace::list`,
                typeArguments: [item.data.type],
                arguments: [
                    tx.object(marketplaceId),
                    tx.object(item.data.objectId),
                    tx.pure.u64(priceInMist),
                ],
            });
            signAndExecute({ transaction: tx }, {
                onSuccess: (result) => {
                    setIsSubmitting(false);
                    setFeedback({
                        type: 'success',
                        message: `DIGEST::${result.digest.slice(0, 15)}...`
                    });
                },
                onError: (err) => {
                    console.error(err);
                    setIsSubmitting(false);
                    setFeedback({
                        type: 'error',
                        message: err.message || "Transaction rejected by network."
                    });
                },
            });
        } catch (error: any) {
            setIsSubmitting(false);
            setFeedback({
                type: 'error',
                message: error.message || "Invalid input parameters."
            });
        }
    };

    const handleFeedbackClose = () => {
        const wasSuccess = feedback?.type === 'success';
        setFeedback(null);
        if (wasSuccess) {
            onClose(); 
            onSuccess();
        }
    };

    return (
        <>
            <div style={{ 
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
                background: "rgba(0,0,0,0.9)", backdropFilter: "blur(5px)",
                display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 
            }}>
                <div style={{ 
                    width: "800px", maxWidth: "95%", background: "black", 
                    border: `2px solid ${THEME.secondary}`, 
                    boxShadow: `0 0 50px ${THEME.secondary}40`,
                    display: "flex", flexDirection: "column", minHeight: "500px", transition: "all 0.3s"
                }}>
                    {/* MODAL HEADER */}
                    <div style={{ padding: "15px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111" }}>
                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                            <span style={{width:"10px", height:"10px", background: THEME.secondary, borderRadius:"50%", display:"inline-block", boxShadow:`0 0 8px ${THEME.secondary}`}}></span>
                            <h3 style={{ margin: 0, color: "white", textTransform: "uppercase", letterSpacing: "2px" }}>ARTIFACT PROTOCOL</h3>
                        </div>
                        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#666", fontSize: "24px", cursor: "pointer" }}>&times;</button>
                    </div>

                    {/* MODAL BODY (Always Visible) */}
                    <div style={{ padding: "30px", display: "flex", gap: "30px", flexDirection: "row", flexWrap: "wrap", height: "100%" }}>
                        
                        {/* LEFT COLUMN: IMAGE + ID */}
                        <div style={{ flex: "1", minWidth: "250px" }}>
                            <div style={{ width: "100%", height: "300px", background: "#050505", border: `1px solid ${THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow: "hidden", position: "relative" }}>
                                    {/* Scanline overlay */}
                                    <div style={{position:"absolute", top:0, left:0, right:0, bottom:0, background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)", backgroundSize: "100% 4px", pointerEvents:"none", zIndex:2}}></div>
                                    {item.imgUrl ? <img src={item.imgUrl} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "NO VISUAL"}
                            </div>
                            <div style={{marginTop: "15px", textAlign:"center"}}>
                                <div style={{ fontSize: "10px", color: THEME.muted, letterSpacing: "2px" }}>UNIQUE IDENTIFIER</div>
                                <div style={{ fontFamily: "monospace", color: THEME.secondary, fontSize: "12px", wordBreak: "break-all" }}>{item.data.objectId}</div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: DATA & ACTIONS */}
                        <div style={{ flex: "1.2", display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            {/* NAME */}
                            <div style={{ borderBottom: `1px dashed ${THEME.border}`, paddingBottom: "15px" }}>
                                    <label style={{ fontSize: "10px", color: THEME.muted, textTransform: "uppercase" }}>SUBJECT NAME</label>
                                    <div style={{ color: "white", fontSize: "28px", fontWeight: "900", textTransform: "uppercase", textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
                                        {item.name}
                                    </div>
                                    <div style={{ fontSize: "12px", color: THEME.accent, letterSpacing: "1px" }}>TYPE: {item.shortType}</div>
                            </div>

                            {/* --- BIO-SCAN SECTION --- */}
                            <div style={{ background: "#0e1016", padding: "15px", border: `1px solid ${THEME.border}` }}>
                                <div style={{ color: THEME.secondary, fontSize: "12px", fontWeight: "bold", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                                    <span>/// BIO_SCAN_RESULTS</span>
                                    <span>STATUS: STABLE</span>
                                </div>

                                {/* DNA */}
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ fontSize: "10px", color: "#555" }}>DNA_SEQUENCE</div>
                                    <div style={{ fontFamily: "monospace", color: "#ddd", fontSize: "14px", letterSpacing: "1px", wordBreak: "break-all" }}>
                                        {dna !== "N/A" ? dna : <span style={{color: "#444"}}>ENCRYPTED</span>}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "20px" }}>
                                    {/* CLASS */}
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#555" }}>MUTATION_CLASS</div>
                                        <div style={{ 
                                            color: getClassColor(mutationClass), 
                                            fontSize: "16px", fontWeight: "bold", textShadow: `0 0 5px ${getClassColor(mutationClass)}`
                                        }}>
                                            {mutationClass}
                                        </div>
                                    </div>
                                    {/* VOLATILITY */}
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#555" }}>VOLATILITY</div>
                                        <div style={{ color: THEME.accent, fontSize: "16px", fontWeight: "bold" }}>
                                            {volatility}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LISTING ACTION */}
                            <div style={{ marginTop: "auto", background: "#1a1a1a", padding: "15px", borderLeft: `4px solid ${THEME.secondary}` }}>
                                <label style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase" }}>SET LISTING PRICE (SUI)</label>
                                <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                                    <input 
                                        type="number" 
                                        autoFocus
                                        placeholder="0.0" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        style={{ 
                                            flex: 1, background: "transparent", border: "none", color: "white", 
                                            fontSize: "24px", fontFamily: "monospace", outline: "none", fontWeight: "bold"
                                        }}
                                    />
                                    <button onClick={handleList} disabled={isSubmitting || !price} style={{ 
                                        padding: "10px 20px", 
                                        background: THEME.secondary, 
                                        border: "none", 
                                        color: "black", 
                                        fontWeight: "900", fontSize: "14px", textTransform: "uppercase",
                                        cursor: isSubmitting ? "wait" : "pointer", 
                                        opacity: price ? 1 : 0.5
                                    }}>
                                        {isSubmitting ? "PROCESSING..." : "LIST ITEM"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK POPUP - WRAPPED IN ANIMATE PRESENCE FOR EFFECTS */}
            <AnimatePresence>
                {feedback && (
                    <TransactionFeedback 
                        key="feedback-modal" // Required for Framer Motion to track exit
                        type={feedback.type} 
                        message={feedback.message} 
                        onClose={handleFeedbackClose} 
                    />
                )}
            </AnimatePresence>
        </>
    );
}