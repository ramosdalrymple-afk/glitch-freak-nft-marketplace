import { useState } from "react";
import { MainLayout } from "./layouts/MainLayout";

// ✅ FIXED: Using named imports (curly braces) to match "export function Name()"
import { Marketplace } from "./pages/Marketplace";
import { Inventory } from "./pages/Inventory";
import { Burn } from "./pages/Burn";
import { Mint } from "./pages/Mint";

function App() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "inventory" | "burn" | "mint">("marketplace");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper to force a refresh of data when a transaction finishes
  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleMintSuccess = () => {
    handleRefresh();
    setActiveTab("inventory"); 
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={{ minHeight: "60vh" }}>
        {activeTab === "marketplace" && <Marketplace refreshTrigger={refreshTrigger} />}
        {activeTab === "inventory" && <Inventory onSuccess={handleRefresh} />}
        {activeTab === "mint" && <Mint onSuccess={handleMintSuccess} />}
        {activeTab === "burn" && <Burn onSuccess={handleRefresh} />}
      </div>
    </MainLayout>
  );
}

export default App;