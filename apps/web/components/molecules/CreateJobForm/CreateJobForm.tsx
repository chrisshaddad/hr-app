'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Input,
  Button,
  Textarea,
  Dropdown,
  DatePicker,
} from '@/components/atoms';
import { DropdownItem } from '@/common/common.types';
import { CreateJobFormProps, JobFormData } from './CreateJobForm.types';

export const CreateJobForm = ({
  onClose,
  handleCreateJob,
}: CreateJobFormProps) => {
  const validationSchema = Yup.object({
    location: Yup.string().required('Location is required'),
    jobTitle: Yup.string().required('Job title is required'),
    department: Yup.string().required('Department is required'),
    description: Yup.string().required('Description is required'),
    employmentType: Yup.string().required('Employment type is required'),
    experienceLevel: Yup.string().required('Experience level is required'),
    expectedClosingDate: Yup.string().required(
      'Expected closing date is required',
    ),
  });

  const formik = useFormik<JobFormData>({
    initialValues: {
      location: '',
      jobTitle: '',
      department: '',
      description: '',
      employmentType: '',
      experienceLevel: '',
      expectedClosingDate: '',
    },
    validationSchema,
    onSubmit: (values) => {
      handleCreateJob(values);
      onClose();
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const employmentTypeItems: DropdownItem[] = [
    { label: 'Full Time', value: 'Full Time' },
    { label: 'Part Time', value: 'Part Time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'Internship' },
  ];

  const departmentItems: DropdownItem[] = [
    { label: 'Design', value: 'Design' },
    { label: 'Development', value: 'Development' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
    { label: 'HR', value: 'HR' },
    { label: 'Finance', value: 'Finance' },
  ];

  const locationItems: DropdownItem[] = [
    { label: 'Remote', value: 'Remote' },
    { label: 'Onsite', value: 'Onsite' },
    { label: 'Hybrid', value: 'Hybrid' },
  ];

  const experienceLevelItems: DropdownItem[] = [
    { label: 'Entry Level', value: 'Entry' },
    { label: 'Mid Level', value: 'Mid' },
    { label: 'Senior Level', value: 'Senior' },
    { label: 'Executive', value: 'Executive' },
  ];

  return (
    <div className="h-full flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-GreyScale-900">Create New Job</p>
      </div>
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            <Input
              required
              name="jobTitle"
              label="Job Title"
              onBlur={formik.handleBlur}
              placeholder="Enter Job Title"
              value={formik.values.jobTitle}
              error={formik.errors.jobTitle}
              touched={formik.touched.jobTitle}
              onChange={(e) => formik.setFieldValue('jobTitle', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                required
                label="Employment Type"
                placeholder="Select type"
                items={employmentTypeItems}
                value={formik.values.employmentType}
                error={formik.errors.employmentType}
                touched={formik.touched.employmentType}
                onChange={(value) =>
                  formik.setFieldValue('employmentType', value)
                }
                onBlur={() => formik.setFieldTouched('employmentType', true)}
              />
              <Dropdown
                required
                label="Department"
                items={departmentItems}
                placeholder="Select department"
                error={formik.errors.department}
                touched={formik.touched.department}
                value={formik.values.department || ''}
                onBlur={() => formik.setFieldTouched('department', true)}
                onChange={(value) => formik.setFieldValue('department', value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                required
                label="Location"
                items={locationItems}
                placeholder="Select location"
                error={formik.errors.location}
                touched={formik.touched.location}
                value={formik.values.location || ''}
                onBlur={() => formik.setFieldTouched('location', true)}
                onChange={(value) => formik.setFieldValue('location', value)}
              />
              <Dropdown
                required
                label="Experience Level"
                placeholder="Select level"
                items={experienceLevelItems}
                error={formik.errors.experienceLevel}
                touched={formik.touched.experienceLevel}
                value={formik.values.experienceLevel || ''}
                onBlur={() => formik.setFieldTouched('experienceLevel', true)}
                onChange={(value) =>
                  formik.setFieldValue('experienceLevel', value)
                }
              />
            </div>
            <DatePicker
              required
              placeholder="Select date"
              label="Expected Closing Date"
              error={formik.errors.expectedClosingDate}
              touched={formik.touched.expectedClosingDate}
              value={formik.values.expectedClosingDate || ''}
              onChange={(value: string) => {
                formik.setFieldValue('expectedClosingDate', value);
                formik.setFieldTouched('expectedClosingDate', true, false);
              }}
              onBlur={() => formik.setFieldTouched('expectedClosingDate', true)}
            />
            <Textarea
              rows={8}
              required
              name="description"
              label="Description"
              onBlur={formik.handleBlur}
              value={formik.values.description}
              error={formik.errors.description}
              placeholder="Enter job description"
              touched={formik.touched.description}
              onChange={(e) =>
                formik.setFieldValue('description', e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-5">
          <Button
            text="Cancel"
            onClick={onClose}
            variant="secondary"
            className="w-[150px]"
          />
          <Button
            text="Submit"
            variant="primary"
            className="w-[150px]"
            onClick={async () => {
              await formik.setTouched({
                location: true,
                jobTitle: true,
                department: true,
                description: true,
                employmentType: true,
                experienceLevel: true,
                expectedClosingDate: true,
              });
              formik.handleSubmit();
            }}
            disabled={!(formik.isValid && formik.dirty)}
          />
        </div>
      </div>
    </div>
  );
};
