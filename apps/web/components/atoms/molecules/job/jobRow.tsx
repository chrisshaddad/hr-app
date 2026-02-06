'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

import { JobRowProps } from '../molecules.types';
import { Chip, Dropdown } from '@/components/atoms';

const JobRow = ({
  id,
  title,
  status,
  createdAt,
  department,
  companyName,
  numberOfCandidates,
  onStatusChange,
  onClick,
}: JobRowProps) => {
  const [jobStatus, setJobStatus] = useState(status);

  const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' },
    { label: 'Unactive', value: 'unactive' },
  ];

  const getChipTypeByJobStatus = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      case 'unactive':
        return 'error';
    }
  };

  const handleStatusChange = (value: string) => {
    setJobStatus(value);
    if (id && onStatusChange) {
      onStatusChange(id, value);
    }
  };

  const handleClick = () => {
    if (id && onClick) {
      onClick(id);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMoreVerticalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="p-6 rounded-[16px] w-full bg-Others-White gap-4 flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px] h-14">
          <p className="text-GreyScale-900 text-[20px] font-bold">{title}</p>
          <Chip
            variant={getChipTypeByJobStatus(jobStatus)}
            text={jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
          />
        </div>
        <div className="flex items-center gap-2" onClick={handleDropdownClick}>
          <div onClick={handleDropdownClick}>
            <Dropdown
              align="end"
              value={jobStatus}
              items={statusItems}
              placeholder="Change Status"
              onChange={handleStatusChange}
            />
          </div>
          <div className="cursor-pointer" onClick={handleMoreVerticalClick}>
            <MoreVertical className="h-6 w-6 text-GreyScale-600" />
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
