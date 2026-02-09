export type CreateJobFormProps = {
  onClose: () => void;
  handleCreateJob: (data: JobFormData) => void;
};

export type JobFormData = {
  jobTitle: string;
  location: string;
  department: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  expectedClosingDate: string;
};
