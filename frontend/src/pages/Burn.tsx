import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useMemo } from "react";

// --- BURN THEME CONSTANTS ---
const THEME = {
  bg: "#0B0F1A",        // Midnight Ink
  cardBg: "#14161F",    // Charcoal Void
  danger: "#FF4444",    // Danger Red
  warning: "#FF8A00",   // Warning Orange
  text: "#ffffff",
  muted: "#666666",
  border: "#2A2A35"
};

export function Burn({ onSuccess }: { onSuccess: () => void }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: userObjects, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: { showType: true, showDisplay: true, showContent: true },
    },
    { enabled: !!account }
  );

  // 1. Process Data
  const allBurnableItems = useMemo(() => {
    return (userObjects?.data || [])
      .filter((obj) => {
        const type = obj.data?.type || "";
        return (
            type !== "0x2::sui::SUI" && 
            type !== "0x2::coin::Coin<0x2::sui::SUI>" &&
            !type.includes("::package::UpgradeCap")
        );
      })
      .map((obj) => {
        const shortType = obj.data?.type?.split("::").slice(-1)[0] || "Unknown";
        return { ...obj, shortType };
      });
  }, [userObjects]);

  // 2. Extract Categories
  const categories = useMemo(() => {
    const uniqueTypes = new Set(allBurnableItems.map((item) => item.shortType));
    return ["All", ...Array.from(uniqueTypes)];
  }, [allBurnableItems]);

  // 3. Filter
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return allBurnableItems;
    return allBurnableItems.filter((item) => item.shortType === selectedCategory);
  }, [allBurnableItems, selectedCategory]);

  const handleBurn = (objectId: string, objectType: string) => {
    // Custom Confirm logic or just browser confirm is fine for now
    if (!confirm(`⚠️ WARNING: You are about to DESTROY this item.\n\nType: ${objectType}\n\nThis action cannot be undone.`)) return;

    const tx = new Transaction();
    tx.transferObjects(
      [tx.object(objectId)], 
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );

    signAndExecute({ transaction: tx }, {
        onSuccess: () => { alert("ITEM INCINERATED."); refetch(); onSuccess(); },
        onError: (err) => { console.error(err); alert("BURN_FAILED."); },
    });
  };

  const getImageUrl = (obj: any) => {
    const display = obj.data?.display?.data;
    const fields = obj.data?.content?.fields;
    return display?.image_url || display?.url || fields?.url || fields?.image_url || fields?.img_url || null;
  };

  if (!account) return <div style={{ padding: "40px", color: THEME.danger, fontFamily: "monospace", textAlign:"center" }}>/// SECURITY_LOCK: WALLET_NOT_FOUND</div>;

  return (
    <div style={{ 
        padding: "40px 20px", 
        background: THEME.bg, 
        minHeight: "100vh",
        fontFamily: "'Courier New', Courier, monospace"
    }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "flex-end", 
        marginBottom: "40px", borderBottom: `2px solid ${THEME.danger}`, paddingBottom: "20px" 
      }}>
        <div>
            <h2 style={{ 
                fontSize: "42px", margin: 0, textTransform: "uppercase", color: "white",
                textShadow: `3px 3px 0px ${THEME.danger}`
            }}>
                🔥 Incinerator
            </h2>
            <p style={{ color: THEME.warning, margin: "5px 0 0 0", fontSize: "12px" }}>
                /// WARNING: ACTIONS ARE IRREVERSIBLE
            </p>
        </div>
        
        {/* FILTERS */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {categories.map((cat) => {
             const isActive = selectedCategory === cat;
             return (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                        padding: "8px 16px",
                        background: isActive ? THEME.danger : "transparent",
                        color: isActive ? "black" : THEME.danger,
                        border: `1px solid ${THEME.danger}`,
                        cursor: "pointer",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontFamily: "monospace"
                    }}
                >
                    {isActive ? `> ${cat}` : cat}
                </button>
             );
          })}
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div style={{ border: `1px dashed ${THEME.muted}`, padding: "40px", textAlign: "center", color: THEME.muted, borderRadius: "8px" }}>
          CHAMBER EMPTY. NO FUEL DETECTED.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px" }}>
          {filteredItems.map((obj) => {
            const imgUrl = getImageUrl(obj);
            // Internal hover state logic would require a sub-component, 
            // but for brevity we'll use a static "Dangerous" style.

            return (
                <div key={obj.data?.objectId} style={{ 
                    border: `1px solid ${THEME.danger}`, 
                    background: THEME.cardBg, 
                    padding: "12px",
                    position: "relative"
                }}>
                    {/* Image Area */}
                    <div style={{ 
                        height: "180px", background: "#000", marginBottom: "12px", 
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                        borderBottom: `1px solid ${THEME.danger}`
                    }}>
                        {imgUrl ? (
                            <img src={imgUrl} alt="nft" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(120%)" }} />
                        ) : (
                            <span style={{color: THEME.muted, fontSize: "10px"}}>NO_VISUAL</span>
                        )}
                    </div>
                    
                    <div style={{marginBottom: "15px"}}>
                        <div style={{color: THEME.danger, fontWeight: "bold", fontSize:"14px", textTransform: "uppercase"}}>{obj.shortType}</div>
                        <div style={{ fontSize: "10px", color: THEME.muted }}>ID: {obj.data?.objectId.slice(0, 8)}...</div>
                    </div>

                    <button
                        onClick={() => handleBurn(obj.data?.objectId!, obj.data?.type!)}
                        style={{ 
                            width: "100%", padding: "12px", 
                            background: "transparent", 
                            color: THEME.danger, 
                            border: `1px solid ${THEME.danger}`, 
                            cursor: "pointer", 
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = THEME.danger;
                            e.currentTarget.style.color = "black";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = THEME.danger;
                        }}
                    >
                        ❌ DESTROY
                    </button>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}