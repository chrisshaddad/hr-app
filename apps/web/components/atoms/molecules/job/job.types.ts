export type Job = {
  id: string;
  title: string;
  status: string;
  department: string;
  companyName: string;
  createdAt: Date | string;
  numberOfCandidates: number;
};
