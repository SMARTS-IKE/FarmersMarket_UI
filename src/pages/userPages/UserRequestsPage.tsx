import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import SellerRequests from "../../components/requests/SellerRequests";
import LayoutTabsSlot from "../../shared/components/LayoutTabsSlot";

export default function UserRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (_: SyntheticEvent, nextValue: number) => {
    if (nextValue === 1) {
      void navigate({ to: "/users/requests/new" });
      return;
    }

    setActiveTab(nextValue);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      <LayoutTabsSlot>
        <Box className="flex h-full">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
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
      </div>
    </div>
  );
}
