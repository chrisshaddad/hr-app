'use client';

import { useState } from 'react';

import { Chip, Dropdown } from '@/components/atoms';
import { DropdownItem } from '@/common/common.types';
import { JobRowProps, JobStatus } from './JobRow.types';

const JobRow = ({
  id,
  title,
  status,
  onClick,
  createdAt,
  department,
  companyName,
  onStatusChange,
  numberOfCandidates,
}: JobRowProps) => {
  const [jobStatus, setJobStatus] = useState<JobStatus>(status as JobStatus);

  const statusItems: DropdownItem[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Closed', value: 'closed' },
  ];

  const getChipTypeByJobStatus = (status: JobStatus) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'closed':
        return 'error';
    }
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as JobStatus;

    setJobStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(id, value);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleClick}
      className="p-6 rounded-[16px] w-full bg-Others-White gap-4 flex flex-col cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px] h-14">
          <p className="text-GreyScale-900 text-[20px] font-bold">{title}</p>
          <Chip
            variant={getChipTypeByJobStatus(jobStatus)}
            text={jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
          />
        </div>
        <div
          className="flex flex-col items-end gap-2"
          onClick={handleDropdownClick}
        >
          <div onClick={handleDropdownClick}>
            <Dropdown
              align="end"
              value={jobStatus}
              items={statusItems}
              placeholder="Change Status"
              onChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
      <p className="text-GreyScale-600 font-medium text-sm">
        {department} . {companyName}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-GreyScale-600 font-medium text-sm select-none">
          {numberOfCandidates}{' '}
          {numberOfCandidates === 1 ? 'Candidate' : 'Candidates'} Applied
        </p>
        <p className="text-GreyScale-600 font-medium text-sm select-none">
          Created{' '}
          {new Date(createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export { JobRow };
