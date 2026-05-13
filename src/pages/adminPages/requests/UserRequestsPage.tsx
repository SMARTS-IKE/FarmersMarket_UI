import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import SellerRequests from "../../../components/requests/SellerRequests";
import NewRequestPeriodsTable from "../../../components/requests/NewRequestPeriodsTable";

export default function UserRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, nextValue) => setActiveTab(nextValue)}
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
          <Tab label="Οι αιτήσεις μου" />
          <Tab label="Νέα αίτηση" />
        </Tabs>
      </Box>

      {activeTab === 0 && <SellerRequests />}
      {activeTab === 1 && <NewRequestPeriodsTable />}
    </div>
  );
}
