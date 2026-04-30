import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import DesignRequestSheet from "../../components/requests/DesignRequestSheet";
import FetchedSellerRequests from "../../components/requests/SellerRequests";

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "var(--color-text)" } }}
        >
          <Tab label="Design Request Sheet" />
          <Tab label="Fetched Requests from Sellers" />
        </Tabs>
      </Box>

      {activeTab === 0 && <DesignRequestSheet />}
      {activeTab === 1 && <FetchedSellerRequests />}
    </div>
  );
}