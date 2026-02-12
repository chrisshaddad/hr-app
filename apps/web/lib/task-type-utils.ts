import type { TaskType } from '@repo/contracts';

const TASK_TYPE_CONFIG = {
  CHECKLIST: {
    label: 'Checklist',
    badgeVariant: 'default',
  },
  UPLOAD: {
    label: 'Upload',
    badgeVariant: 'secondary',
  },
  EMPLOYEE_INFORMATION: {
    label: 'Employee Info',
    badgeVariant: 'outline',
  },
} as const;

export const getTaskTypeConfig = (taskType: TaskType) => {
  return TASK_TYPE_CONFIG[taskType];
};
