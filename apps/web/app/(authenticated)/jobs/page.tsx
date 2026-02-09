'use client';

import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

import { JobFormData } from './jobs.types';
import { fetcher, apiPost } from '@/lib/api';
import { CreateJobForm } from '@/components/molecules';
import { JobRow } from '@/components/molecules/JobRow/JobRow';
import {
  JobListResponse,
  JobResponse,
  CreateJobRequest,
} from '@repo/contracts';
import {
  Button,
  Loader,
  SideModal,
  Skeleton,
  SearchInput,
} from '@/components/atoms';

export default function JobsPage() {
  // const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [jobs, setJobs] = useState<JobListResponse['jobs']>([]);
  const [isJobCreating, setIsJobCreating] = useState<boolean>(false);
  const [isJobsShimmerLoading, setIsJobsShimmerLoading] =
    useState<boolean>(true);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] =
    useState<boolean>(false);

  const fetchAllJobs = async (showShimmer: boolean = true) => {
    if (showShimmer) {
      setIsJobsShimmerLoading(true);
    }

    try {
      const data = (await fetcher('/jobs')) as JobListResponse;

      if (!data || !Array.isArray(data.jobs)) {
        toast.error('Invalid response from server');

        return;
      }

      setJobs(data.jobs);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load jobs';

      toast.error(errorMessage);
    } finally {
      if (showShimmer) {
        setIsJobsShimmerLoading(false);
      }
    }
  };

  const handleCreateJob = async (formData: JobFormData) => {
    setIsJobCreating(true);

    try {
      const payload: CreateJobRequest = {
        title: formData.jobTitle,
        location: formData.location,
        department: formData.department,
        description: formData.description,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        expectedClosingDate: formData.expectedClosingDate,
      };

      await apiPost<JobResponse>('/jobs', payload);

      toast.success('Job created successfully!');
      setIsCreateJobModalOpen(false);

      // Always fetch fresh jobs to ensure we have the correct data with IDs
      await fetchAllJobs(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
    } finally {
      setIsJobCreating(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    // router.push(`/jobs/${jobId}`);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {};

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchAllJobs();
  }, []);

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold text-GreyScale-900">Jobs</p>
              <p className="text-GreyScale-600 text-sm font-medium">
                Manage your company's job postings
              </p>
            </div>
            <div className="flex items-center gap-5">
              <SearchInput
                value={searchTerm}
                className="w-[400px]"
                placeholder="Search jobs by name..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                text="Create Job"
                startIcon={<Plus className="h-5 w-5" />}
                onClick={() => setIsCreateJobModalOpen(true)}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isJobsShimmerLoading ? (
            <div>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="p-6 rounded-[16px] w-full bg-Others-White gap-4 flex flex-col border border-GreyScale-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px] h-14">
                      <Skeleton className="h-6 w-48 bg-GreyScale-200" />
                      <Skeleton className="h-6 w-20 rounded-full bg-GreyScale-200" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-32 bg-GreyScale-200" />
                      <Skeleton className="h-6 w-6 rounded-full bg-GreyScale-200" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-64 bg-GreyScale-200" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40 bg-GreyScale-200" />
                    <Skeleton className="h-4 w-48 bg-GreyScale-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 border border-GreyScale-300 bg-Others-White rounded-lg h-full flex flex-col items-center justify-center gap-6">
              {searchTerm ? (
                <>
                  <p className="text-GreyScale-900 text-3xl font-bold">
                    No jobs found
                  </p>
                  <p className="text-GreyScale-600 text-lg">
                    Try adjusting your search term
                  </p>
                </>
              ) : (
                <>
                  <img src="/icons/noJob.svg" alt="No jobs" />
                  <div className="flex flex-col gap-2">
                    <p className="text-GreyScale-900 text-3xl font-bold">
                      There is no jobs created yet
                    </p>
                    <p className="text-GreyScale-900 text[18px]">
                      Please add new jobs by clicking "Create Job" below
                    </p>
                  </div>
                  <Button
                    text="Create Job"
                    startIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setIsCreateJobModalOpen(true)}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobRow
                  id={job.id}
                  key={job.id}
                  title={job.title}
                  status={job.status}
                  numberOfCandidates={0}
                  onClick={handleJobClick}
                  createdAt={job.createdAt}
                  companyName={job.organization.name}
                  onStatusChange={handleStatusChange}
                  department={job.department || 'N/A'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <SideModal
        width="600px"
        open={isCreateJobModalOpen}
        onOpenChange={setIsCreateJobModalOpen}
      >
        <CreateJobForm
          handleCreateJob={handleCreateJob}
          onClose={() => setIsCreateJobModalOpen(false)}
        />
      </SideModal>
      {isJobCreating && <Loader />}
    </>
  );
}
