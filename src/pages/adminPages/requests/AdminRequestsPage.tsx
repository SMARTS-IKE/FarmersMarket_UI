import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tab, Tabs, Box } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import DesignRequestSheet from "../../../components/requests/DesignRequestSheet";
import MarketPeriods from "../../../components/requests/MarketPeriods";
import SellerRequests from "../../../components/requests/SellerRequests";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const openCreatePage = () => {
    navigate({ to: "/admin/requests/design-form" });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      {activeTab === 1 && (
        <div className="flex w-full justify-end">
          <CustomButton
            title="Δημιουργία Φόρμας Αίτησης"
            width="fit-content"
            onClick={openCreatePage}
          />
        </div>
      )}

      <LayoutTabsSlot>
        <Box className="flex h-full items-center">
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
          </Tabs>
        </Box>
      </LayoutTabsSlot>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        {activeTab === 0 && <SellerRequests />}
        {activeTab === 1 && <DesignRequestSheet />}
      </div>
    </div>
  );
}