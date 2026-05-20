import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import DesignRequestSheet from "../../components/requests/DesignRequestSheet";
import MarketPeriods from "../../components/requests/MarketPeriods";
import SellerRequests from "../../components/requests/SellerRequests";
import LayoutTabsSlot from "../../shared/components/LayoutTabsSlot";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <LayoutTabsSlot>
        <Box>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            textColor="inherit"
            sx={{
              width: "100%",
            }}
          >
            <Tab label="Λίστα αιτήσεων πωλητών" />
            <Tab label="Φόρμες αιτήσεων" />
            <Tab label="Περίοδοι Αιτήσεων" />
          </Tabs>
        </Box>
      </LayoutTabsSlot>

      {activeTab === 0 && <SellerRequests />}
      {activeTab === 1 && <DesignRequestSheet />}
      {activeTab === 2 && <MarketPeriods />}
    </div>
  );
}
