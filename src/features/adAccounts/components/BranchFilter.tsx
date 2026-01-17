import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';

interface BranchFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function BranchFilter({ value, onChange, className }: BranchFilterProps) {
  const { data: branches, isLoading } = useBranches();

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className={className ?? 'w-48 bg-muted/30 border-border/50'}>
        <SelectValue placeholder="Chọn cơ sở" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả cơ sở</SelectItem>
        {branches?.map((branch) => (
          <SelectItem key={branch.id} value={String(branch.id)}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


