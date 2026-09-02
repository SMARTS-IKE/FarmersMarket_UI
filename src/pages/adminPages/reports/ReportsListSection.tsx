import CustomButton from "../../../shared/components/CustomButton";

export interface ReportRow {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  status: string;
}

interface ReportsListSectionProps {
  reports: ReportRow[];
}

export default function ReportsListSection({ reports }: ReportsListSectionProps) {
  return (
    <div className="rounded-[20px] border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-(--color-text-muted)">Αναφορές</p>
          <p className="mt-1 text-sm text-(--color-text-muted)">Κατάλογος διαθέσιμων αναφορών και εξαγωγών.</p>
        </div>
        <CustomButton title="Νέα αναφορά" backgroundColor="var(--color-primary)" width={140} />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-(--color-border)">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-(--color-bg)">
              <th className="px-4 py-3 font-semibold text-(--color-text-heading)">Αναφορά</th>
              <th className="px-4 py-3 font-semibold text-(--color-text-heading)">Κατηγορία</th>
              <th className="px-4 py-3 font-semibold text-(--color-text-heading)">Ημερομηνία</th>
              <th className="px-4 py-3 font-semibold text-(--color-text-heading)">Κατάσταση</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr
                key={report.id}
                className={index % 2 === 0 ? "bg-(--color-surface)" : "bg-(--color-bg)"}
              >
                <td className="border-t border-(--color-border) px-4 py-3 text-(--color-text-heading)">{report.title}</td>
                <td className="border-t border-(--color-border) px-4 py-3 text-(--color-text)">{report.category}</td>
                <td className="border-t border-(--color-border) px-4 py-3 text-(--color-text)">{report.createdAt}</td>
                <td className="border-t border-(--color-border) px-4 py-3">
                  <span className="rounded-full bg-(--color-primary-subtle) px-2 py-1 text-xs font-medium text-(--color-primary)">
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
