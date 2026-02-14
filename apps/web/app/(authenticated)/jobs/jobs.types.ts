import type { JobApplicationsResponse } from '@repo/contracts';

export type JobFormData = {
  jobTitle: string;
  location: string;
  department: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  expectedClosingDate: string;
};

export type Job = {
  id: string;
  organization: {
    id: string;
    name: string;
  };
  title: string;
  location: string;
  createdAt: string;
  department: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  expectedClosingDate: string;
  status: 'draft' | 'published' | 'closed';
};

export type JobApplicationItem =
  JobApplicationsResponse['applications'][number];
