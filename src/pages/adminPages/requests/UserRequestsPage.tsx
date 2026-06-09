import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import SellerRequests from "../../../components/requests/SellerRequests";
import NewRequestPeriodsTable from "../../../components/requests/NewRequestPeriodsTable";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";

export default function UserRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      <LayoutTabsSlot>
        <Box className="flex h-full">
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            variant="fullWidth"
            textColor="inherit"
            sx={{
              width: "100%"
            }}
          >
            <Tab label="Οι αιτήσεις μου" />
            <Tab label="Νέα αίτηση" />
          </Tabs>
        </Box>
      </LayoutTabsSlot>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        {activeTab === 0 && <SellerRequests />}
        {activeTab === 1 && <NewRequestPeriodsTable />}
      </div>
    </div>
  );
}
