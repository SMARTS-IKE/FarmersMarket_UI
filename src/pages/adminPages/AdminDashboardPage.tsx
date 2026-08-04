import MetricsBox from '../../components/MetricsBox';
import { Link } from '@tanstack/react-router';
import CustomButton from '../../shared/components/CustomButton';

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-start px-6 py-6">
      <MetricsBox />

      <div className="flex w-full max-w-6xl items-center gap-6 md:gap-8 mt-20">
        <div className="h-px flex-1 bg-[#b7b3a2]" />

        <p className="max-w-[560px] text-center text-[34px] font-medium leading-[1.25] text-[#8f8f8f]">
          Καλώς ήρθατε στην εφαρμογή διαχείρισης Λαϊκών Αγορών
        </p>

        <div className="h-px flex-1 bg-[#b7b3a2]" />
      </div>
    </div>
  );
}
