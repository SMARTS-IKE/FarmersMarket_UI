import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tab, Tabs, Box } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import ExportSelector from '../../../shared/components/ExportSelector';
import DesignRequestSheet from "../../../components/requests/DesignRequestSheet";
import SellerRequests from "../../../components/requests/SellerRequests";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
import { useAuthStore } from '../../../store/authStore';

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { ExportFormatLabels } = useGlobalEnums();
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

      {activeTab === 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <ExportSelector onExport={async (format) => {
            try {
              const authToken = useAuthStore.getState().token;
              const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
              const url = `${BASE_URL}/requests?page=1&pageSize=10000&format=${encodeURIComponent((format||'xlsx').toLowerCase())}`;
              const resp = await fetch(url, { method: 'GET', headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
              if (!resp.ok) { const t = await resp.text().catch(()=> 'Export failed'); throw new Error(t); }
              const blob = await resp.blob();
              const disposition = resp.headers.get('Content-Disposition') || '';
              let filename = `requests.${format}`;
              const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/);
              if (match) filename = decodeURIComponent(match[1] || match[2]);
              const downloadUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = downloadUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(downloadUrl);
            } catch (e) { console.error('Export failed', e); alert('Η εξαγωγή απέτυχε.'); }
          }} />
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

      <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '58vh' }}>
        {activeTab === 0 && <SellerRequests />}
        {activeTab === 1 && <DesignRequestSheet />}
      </div>
    </div>
  );
}