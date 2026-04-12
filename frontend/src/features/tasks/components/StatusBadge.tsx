import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [TaskStatus.PENDING]: { label: 'Pendente', variant: 'secondary' },
  [TaskStatus.IN_PROGRESS]: { label: 'Em Progresso', variant: 'default' },
  [TaskStatus.COMPLETED]: { label: 'Concluída', variant: 'outline' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
