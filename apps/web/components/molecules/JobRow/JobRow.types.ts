export type JobStatus = 'draft' | 'published' | 'closed';

export type JobRowProps = {
  id: string;
  title: string;
  status: JobStatus;
  department: string;
  companyName: string;
  createdAt: Date | string;
  numberOfCandidates: number;
  onClick?: (jobId: string) => void;
  onStatusChange?: (jobId: string, newStatus: string) => void;
};
