import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import DesignRequestSheet from "../../components/requests/DesignRequestSheet";
import UserMarketRequests from "../../components/requests/UserMarketRequests";
import SellerRequests from "../../components/requests/SellerRequests";
import LayoutTabsSlot from "../../shared/components/LayoutTabsSlot";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
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

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        {activeTab === 0 && <SellerRequests />}
        {activeTab === 1 && <DesignRequestSheet />}
        {activeTab === 2 && <UserMarketRequests />}
      </div>
    </div>
  );
}
