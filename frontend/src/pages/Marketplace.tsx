import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // NEW IMPORT

// --- THEME CONSTANTS ---
const THEME = {
  bg: "#0B0F1A",
  cardBg: "#14161F",
  accent: "#7CFF00",
  highlight: "#FF2F92",
  secondary: "#00E5FF",
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

  // 1. Check Direct Fields
  for (const fieldName in content) {
    if (fieldName.toLowerCase() === searchKey) return content[fieldName];
  }

  // 2. Check Display Metadata
  for (const displayKey in display) {
    if (displayKey.toLowerCase() === searchKey) return display[displayKey];
  }

  // 3. Check Attribute Vectors
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

  // 4. Check Parallel Arrays
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
  const title = isSuccess ? "ASSET SECURED" : "CRITICAL FAILURE";
  const icon = isSuccess ? "✓" : "!";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      {/* 3D ENTRY ANIMATION CONTAINER */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          width: "450px", maxWidth: "90%",
          background: THEME.bg,
          position: "relative",
          perspective: "1000px" // Adds depth for the rotation
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
            padding: "2px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* MOVING LIGHT SHEEN EFFECT */}
          <motion.div
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "linear" }}
            style={{
              position: "absolute", top: 0, width: "50%", height: "100%",
              background: `linear-gradient(90deg, transparent, ${primaryColor}20, transparent)`,
              transform: "skewX(-20deg)",
              pointerEvents: "none",
              zIndex: 1
            }}
          />

          {/* DECORATIVE CORNERS (Static) */}
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

            {/* INTERACTIVE BUTTON */}
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
                transition: "color 0.1s" // We use Framer for scale/bg, CSS for fast color swap
              }}
            >
              {isSuccess ? "CONFIRM RECEIPT" : "ACKNOWLEDGE ERROR"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- PARENT COMPONENT: MARKETPLACE ---
export function Marketplace({ refreshTrigger }: { refreshTrigger: number }) {
  const marketplaceId = useNetworkVariable("marketplaceId");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const { data: listings, refetch } = useSuiClientQuery("getDynamicFields", {
    parentId: marketplaceId,
  });

  useEffect(() => {
    if (refreshTrigger > 0) refetch();
  }, [refreshTrigger, refetch]);

  return (
    <div style={{ padding: "40px 20px", background: THEME.bg, minHeight: "100vh", fontFamily: "'Courier New', Courier, monospace" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "40px", borderBottom: `2px solid ${THEME.border}`, paddingBottom: "20px" }}>
        <h2 style={{ fontSize: "42px", textTransform: "uppercase", margin: 0, letterSpacing: "-2px", color: "white", textShadow: `3px 3px 0px ${THEME.highlight}` }}>
          Fresh <span style={{ color: THEME.accent }}>Meat</span>
        </h2>
        <p style={{ color: THEME.secondary, margin: "5px 0 0 0", fontSize: "12px", letterSpacing: "2px" }}>/// MARKETPLACE_PROTOCOL_V1.0</p>
      </div>
      
      {/* GRID */}
      {!listings || listings.data.length === 0 ? (
        <div style={{ border: `1px dashed ${THEME.muted}`, padding: "40px", textAlign: "center", color: THEME.muted, borderRadius: "8px" }}>
          NO SIGNALS DETECTED. MARKETPLACE EMPTY.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
          {listings.data.map((item) => (
             <ListingCard 
                key={item.objectId} 
                listingItem={item} 
                onClick={() => setSelectedItem(item)} 
             />
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {selectedItem && (
        <BuyModal 
            item={selectedItem} 
            onClose={() => { setSelectedItem(null); refetch(); }} 
        />
      )}
    </div>
  );
}

// --- COMPONENT: LISTING CARD ---
function ListingCard({ listingItem, onClick }: { listingItem: any, onClick: () => void }) {
    const { data: listingObject } = useSuiClientQuery("getObject", {
        id: listingItem.objectId, options: { showContent: true }
    });

    const { data: listingFields } = useSuiClientQuery("getDynamicFields", {
        parentId: listingItem.objectId
    });
    const nftId = listingFields?.data?.[0]?.objectId;

    const { data: nftObject } = useSuiClientQuery("getObject", {
        id: nftId || "", options: { showDisplay: true, showContent: true }
    }, { enabled: !!nftId });

    // Extract Data
    const nftName = nftObject?.data?.display?.data?.name || "Unknown Item";
    const imageUrl = nftObject?.data?.display?.data?.image_url;
    
    // Extract Stats
    const mutationClass = getAttribute(nftObject, "MUTATION_CLASS");
    const volatility = getAttribute(nftObject, "VOLATILITY_INDEX");

    // @ts-ignore
    const rawPrice = listingObject?.data?.content?.fields?.ask || listingObject?.data?.content?.fields?.price || "0";
    const priceInSui = (parseInt(rawPrice) / 1_000_000_000).toFixed(2); 

    const [isHovered, setIsHovered] = useState(false);

    // Color Logic
    const rarityColor = mutationClass.includes("ALPHA") ? THEME.highlight : mutationClass.includes("BETA") ? THEME.secondary : THEME.accent;

    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                background: THEME.cardBg,
                border: isHovered ? `2px solid ${rarityColor}` : `2px solid ${THEME.border}`,
                padding: "12px", 
                position: "relative",
                transition: "all 0.15s ease",
                boxShadow: isHovered ? `6px 6px 0px ${rarityColor}40` : "none",
                transform: isHovered ? "translate(-2px, -2px)" : "none",
                cursor: "pointer"
            }}
        >
            {/* IMAGE AREA */}
            <div style={{ height: "220px", background: "#000", marginBottom: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `2px solid ${THEME.border}`, position: "relative" }}>
                {imageUrl ? (
                    <img src={imageUrl} alt="NFT" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isHovered ? "contrast(120%) brightness(110%)" : "none" }} />
                ) : (
                    <span style={{ color: THEME.muted, fontSize: "10px", fontFamily: "monospace" }}>NO_SIGNAL</span>
                )}
                
                {/* Rarity Badge on Image */}
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
                    <p style={{ margin: "0", fontSize: "14px", color: "white", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "bold" }}>
                        {nftName}
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0", fontSize: "10px", color: THEME.muted, textTransform: "uppercase" }}>Price</p>
                      <p style={{ margin: "0", fontSize: "16px", color: THEME.accent, fontWeight: "bold" }}>{priceInSui} SUI</p>
                </div>
            </div>

            {/* MINI STATS GRID */}
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

            {/* HOVER BADGE */}
            <div style={{
                marginTop: "12px",
                background: isHovered ? THEME.highlight : "black",
                color: "white",
                padding: "8px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "background 0.2s"
            }}>
                {isHovered ? ">> ACQUIRE <<" : "VIEW / BUY"}
            </div>
        </div>
    );
}

// --- COMPONENT: BUY MODAL ---
function BuyModal({ item, onClose }: { item: any, onClose: () => void }) {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const packageId = useNetworkVariable("packageId");
    const marketplaceId = useNetworkVariable("marketplaceId");

    const [manualType, setManualType] = useState("");
    const [useManual, setUseManual] = useState(false);

    // Feedback State
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({
        type: null,
        message: ''
    });

    // Fetch Full Data
    const { data: listingObject } = useSuiClientQuery("getObject", {
        id: item.objectId, options: { showType: true, showContent: true }
    });
    const { data: listingFields } = useSuiClientQuery("getDynamicFields", {
        parentId: item.objectId
    });
    const nftId = listingFields?.data?.[0]?.objectId;
    const { data: nftObject, isPending } = useSuiClientQuery("getObject", {
        id: nftId || "", options: { showDisplay: true, showType: true, showContent: true }
    }, { enabled: !!nftId });

    // --- EXTRACT ATTRIBUTES ---
    const dna = getAttribute(nftObject, "DNA_SEQUENCE");
    const mutationClass = getAttribute(nftObject, "MUTATION_CLASS");
    const volatility = getAttribute(nftObject, "VOLATILITY_INDEX");
    
    // Color Helper
    const getClassColor = (c: string) => {
        const val = c.toUpperCase();
        if (val.includes("ALPHA")) return THEME.highlight; 
        if (val.includes("BETA")) return THEME.secondary; 
        if (val.includes("GAMMA")) return THEME.accent;
        return "white";
    };

    // --- BUY LOGIC ---
    const getRealNftType = () => {
        if (nftObject?.data?.type) return nftObject.data.type;
        if (listingFields?.data && listingFields.data.length > 0) return listingFields.data[0].objectType;
        const parentType = listingObject?.data?.type;
        if (parentType) {
            const match = parentType.match(/<(.+)>/);
            if (match) return match[1].trim();
        }
        return null;
    };

    const getPrice = () => {
        // @ts-ignore
        const raw = listingObject?.data?.content?.fields?.ask || listingObject?.data?.content?.fields?.price || "0";
        return (parseInt(raw) / 1_000_000_000).toLocaleString();
    }

    const detectedType = getRealNftType();
    const finalType = useManual ? manualType : detectedType;
    const imageUrl = nftObject?.data?.display?.data?.image_url;

    const handleBuy = () => {
        if (!account) {
            setFeedback({ type: 'error', message: "WALLET_NOT_CONNECTED" });
            return;
        }
        if (!finalType) {
            setFeedback({ type: 'error', message: "NFT_TYPE_DETECTION_FAILED" });
            return;
        }

        // @ts-ignore
        const rawPriceStr = listingObject?.data?.content?.fields?.ask || listingObject?.data?.content?.fields?.price || "0";
        
        try {
            const tx = new Transaction();
            const priceBigInt = BigInt(rawPriceStr); 
            const [coin] = tx.splitCoins(tx.gas, [priceBigInt]);

            tx.moveCall({
                target: `${packageId}::freak_marketplace::buy`,
                typeArguments: [finalType], 
                arguments: [
                    tx.object(marketplaceId),
                    tx.object(item.name.value), 
                    tx.object(coin),
                ],
            });

            signAndExecute({ transaction: tx }, {
                onSuccess: (result) => {
                    setFeedback({ 
                        type: 'success', 
                        message: `DIGEST::${result.digest.slice(0, 15)}...` 
                    });
                },
                onError: (e) => { 
                    console.error(e);
                    setFeedback({ type: 'error', message: e.message || "UNKNOWN_RPC_ERROR" });
                }
            });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message });
        }
    };

    const handleFeedbackClose = () => {
        const wasSuccess = feedback.type === 'success';
        setFeedback({ type: null, message: '' });
        
        // If the buy worked, close the main modal to trigger refetch
        if (wasSuccess) {
            onClose();
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
                    border: `2px solid ${THEME.highlight}`, 
                    boxShadow: `0 0 50px ${THEME.highlight}40`,
                    display: "flex", flexDirection: "column"
                }}>
                    {/* HEADER */}
                    <div style={{ padding: "15px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111" }}>
                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                            <span style={{width:"10px", height:"10px", background:THEME.highlight, borderRadius:"50%", display:"inline-block", boxShadow:`0 0 8px ${THEME.highlight}`}}></span>
                            <h3 style={{ margin: 0, color: "white", textTransform: "uppercase", letterSpacing: "2px" }}>ACQUISITION PROTOCOL</h3>
                        </div>
                        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#666", fontSize: "24px", cursor: "pointer" }}>&times;</button>
                    </div>

                    {/* BODY */}
                    <div style={{ padding: "30px", display: "flex", gap: "30px", flexDirection: "row", flexWrap: "wrap" }}>
                        
                        {/* LEFT: IMAGE */}
                        <div style={{ flex: "1", minWidth: "250px" }}>
                            <div style={{ width: "100%", height: "300px", background: "#050505", border: `1px solid ${THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow: "hidden", position: "relative" }}>
                                    {/* Scanline overlay */}
                                    <div style={{position:"absolute", top:0, left:0, right:0, bottom:0, background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)", backgroundSize: "100% 4px", pointerEvents:"none", zIndex:2}}></div>
                                    {imageUrl ? <img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "NO VISUAL"}
                            </div>
                            <div style={{marginTop: "15px", textAlign:"center"}}>
                                <div style={{ fontSize: "10px", color: THEME.muted, letterSpacing: "2px" }}>ITEM ID</div>
                                <div style={{ fontFamily: "monospace", color: THEME.secondary, fontSize: "12px", wordBreak: "break-all" }}>
                                    {item.name.value.toString().slice(0,14)}...
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: DETAILS */}
                        <div style={{ flex: "1.2", display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            {/* NAME & PRICE */}
                            <div style={{ borderBottom: `1px dashed ${THEME.border}`, paddingBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                    <label style={{ fontSize: "10px", color: THEME.muted, textTransform: "uppercase" }}>TARGET</label>
                                    <div style={{ color: "white", fontSize: "24px", fontWeight: "900", textTransform: "uppercase" }}>
                                        {nftObject?.data?.display?.data?.name || "UNKNOWN"}
                                    </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                    <label style={{ fontSize: "10px", color: THEME.muted, textTransform: "uppercase" }}>PRICE</label>
                                    <div style={{ fontSize: "24px", fontWeight: "bold", color: THEME.accent }}>{getPrice()} SUI</div>
                                    </div>
                            </div>

                            {/* --- BIO SCAN RESULTS --- */}
                            <div style={{ background: "#0e1016", padding: "15px", border: `1px solid ${THEME.border}` }}>
                                <div style={{ color: THEME.secondary, fontSize: "12px", fontWeight: "bold", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                                    <span>/// BIO_SCAN_RESULTS</span>
                                    <span>STATUS: LISTED</span>
                                </div>

                                {/* DNA */}
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ fontSize: "10px", color: "#555" }}>DNA_SEQUENCE</div>
                                    <div style={{ fontFamily: "monospace", color: "#ddd", fontSize: "14px", letterSpacing: "1px", wordBreak: "break-all" }}>
                                        {dna !== "N/A" ? dna : <span style={{color: "#444"}}>ENCRYPTED</span>}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "20px" }}>
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#555" }}>MUTATION_CLASS</div>
                                        <div style={{ color: getClassColor(mutationClass), fontSize: "16px", fontWeight: "bold", textShadow: `0 0 5px ${getClassColor(mutationClass)}` }}>
                                            {mutationClass}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#555" }}>VOLATILITY</div>
                                        <div style={{ color: THEME.accent, fontSize: "16px", fontWeight: "bold" }}>{volatility}</div>
                                    </div>
                                </div>
                            </div>

                            {/* TYPE & BUTTONS */}
                            <div style={{ marginTop: "auto" }}>
                                    <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label style={{ fontSize: "10px", color: THEME.muted }}>NFT TYPE DETECTED</label>
                                    <span onClick={() => setUseManual(!useManual)} style={{ fontSize: "10px", color: THEME.highlight, cursor: "pointer", textDecoration: "underline" }}>
                                        {useManual ? "Auto-Detect" : "Manual Override"}
                                    </span>
                                    </div>
                                    
                                    {useManual && (
                                    <input 
                                        type="text" 
                                        value={manualType} 
                                        onChange={(e) => setManualType(e.target.value)} 
                                        placeholder="Paste NFT Type..."
                                        style={{ width: "100%", background: "#222", border: `1px solid ${THEME.danger}`, color: "white", padding: "8px", marginBottom: "10px", fontFamily: "monospace" }}
                                    />
                                    )}

                                    <button onClick={handleBuy} disabled={isPending} style={{ 
                                    width: "100%", padding: "15px", 
                                    background: finalType ? THEME.highlight : "#333", 
                                    color: "white", border: "none", 
                                    cursor: "pointer", 
                                    fontWeight: "900", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase",
                                    boxShadow: finalType ? `4px 4px 0px ${THEME.secondary}` : "none",
                                    opacity: isPending ? 0.7 : 1
                                    }}>
                                    {isPending ? "SCANNING NETWORK..." : "EXECUTE BUY"}
                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK MODAL (WRAPPED IN ANIMATE PRESENCE FOR EXIT ANIMATIONS) */}
            <AnimatePresence>
                {feedback.type && (
                    <TransactionFeedback 
                        key="feedback-modal"
                        type={feedback.type} 
                        message={feedback.message} 
                        onClose={handleFeedbackClose} 
                    />
                )}
            </AnimatePresence>
        </>
    );
}