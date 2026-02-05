export type JobRowProps = {
  id?: string;
  title: string;
  status: string;
  department: string;
  companyName: string;
  createdAt: Date | string;
  numberOfCandidates: number;
  onClick?: (jobId: string) => void;
  onStatusChange?: (jobId: string, newStatus: string) => void;
};

export type CreateJobFormProps = {
  onClose: () => void;
  handleCreateJob: (data: JobFormData) => void;
};

export type JobFormData = {
  jobTitle: string;
  department: string;
  description: string;
  employmentType: string;
  expectedClosingDate: string;
};
