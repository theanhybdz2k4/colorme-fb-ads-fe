import { LeadInsights } from './sections/LeadInsights';
import { LeadProvider } from './context/LeadContext';

export function LeadsPage() {
  return (
    <LeadProvider>
      <LeadInsights />
    </LeadProvider>
  );
}
