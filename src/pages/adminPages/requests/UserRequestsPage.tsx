import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import SellerRequests from "../../../components/requests/SellerRequests";
import NewRequestPeriodsTable from "../../../components/requests/NewRequestPeriodsTable";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";

export default function UserRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <LayoutTabsSlot>
        <Box>
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            variant="fullWidth"
            textColor="inherit"
            sx={{
              width: "100%",
            }}
          >
            <Tab label="Οι αιτήσεις μου" />
            <Tab label="Νέα αίτηση" />
          </Tabs>
        </Box>
      </LayoutTabsSlot>

      {activeTab === 0 && <SellerRequests />}
      {activeTab === 1 && <NewRequestPeriodsTable />}
    </div>
  );
}
