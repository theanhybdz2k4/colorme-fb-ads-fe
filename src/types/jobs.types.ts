export interface Job {
    id: number;
    jobType: string;
    status: string;
    accountId: string;
    totalRecords: number | null;
    processedRecords: number | null;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
}

export function getJobStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'COMPLETED': return 'default';
        case 'RUNNING': return 'secondary';
        case 'FAILED': return 'destructive';
        default: return 'outline';
    }
}
