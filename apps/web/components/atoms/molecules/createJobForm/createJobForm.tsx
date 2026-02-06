'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Button,
  Dropdown,
  Input,
  Textarea,
  DatePicker,
} from '@/components/atoms';

import { CreateJobFormProps, JobFormData } from '../molecules.types';

export const CreateJobForm = ({
  onClose,
  handleCreateJob,
}: CreateJobFormProps) => {
  const validationSchema = Yup.object({
    jobTitle: Yup.string().required('Job title is required'),
    department: Yup.string().required('Department is required'),
    description: Yup.string().required('Description is required'),
    employmentType: Yup.string().required('Employment type is required'),
    expectedClosingDate: Yup.string().required(
      'Expected closing date is required',
    ),
  });

  const formik = useFormik<JobFormData>({
    initialValues: {
      jobTitle: '',
      department: '',
      description: '',
      employmentType: '',
      expectedClosingDate: '',
    },
    validationSchema,
    onSubmit: (values) => {
      handleCreateJob(values);
      onClose();
    },
  });

  const employmentTypeItems = [
    { label: 'Fulltime', value: 'fulltime' },
    { label: 'Part time', value: 'parttime' },
  ];

  const departmentItems = [
    { label: 'Design', value: 'design' },
    { label: 'Development', value: 'development' },
  ];

  return (
    <div className="h-full flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-GreyScale-900">
          Create New Job
        </h2>
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
                onBlur={() => formik.setFieldTouched('employmentType', true)}
                onChange={(value) =>
                  formik.setFieldValue('employmentType', value)
                }
              />
              <Dropdown
                required
                label="Department"
                items={departmentItems}
                placeholder="Select department"
                value={formik.values.department}
                error={formik.errors.department}
                touched={formik.touched.department}
                onBlur={() => formik.setFieldTouched('department', true)}
                onChange={(value) => formik.setFieldValue('department', value)}
              />
            </div>
            <DatePicker
              required
              placeholder="Select date"
              label="Expected Closing Date"
              error={formik.errors.expectedClosingDate}
              value={formik.values.expectedClosingDate}
              touched={formik.touched.expectedClosingDate}
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
            onClick={() => formik.handleSubmit()}
            disabled={!(formik.isValid && formik.dirty)}
          />
        </div>
      </div>
    </div>
  );
};
