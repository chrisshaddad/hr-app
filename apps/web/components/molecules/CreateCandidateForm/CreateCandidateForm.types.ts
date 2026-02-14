export type CandidateFormData = {
  email: string;
  phone: string;
  fullName: string;
  coverLetter: string;
};

export type CreateCandidateFormProps = {
  onClose: () => void;
  handleCreateCandidate: (data: CandidateFormData) => Promise<void>;
};
