import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import DesignRequestSheet from "../../components/requests/DesignRequestSheet";
import MarketPeriods from "../../components/requests/MarketPeriods";
import SellerRequests from "../../components/requests/SellerRequests";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          textColor="inherit"
          sx={{
            width: "100%",
            marginBottom: 3,
            borderBottom: "1px solid var(--color-border)",
            "& .MuiTab-root": {
              flex: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "var(--color-text-muted)",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "var(--color-dark)",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-dark)",
            },
          }}
        >
          <Tab label="Λίστα αιτήσεων πωλητών" />
          <Tab label="Φόρμες αιτήσεων" />
          <Tab label="Περίοδοι Αιτήσεων" />
        </Tabs>
      </Box>

      {activeTab === 0 && <SellerRequests />}
      {activeTab === 1 && <DesignRequestSheet />}
      {activeTab === 2 && <MarketPeriods />}
    </div>
  );
}
