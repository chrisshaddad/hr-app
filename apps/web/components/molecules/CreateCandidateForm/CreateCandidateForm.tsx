'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Input, Button, TextArea } from '@/components/atoms';
import {
  CreateCandidateFormProps,
  CandidateFormData,
} from './CreateCandidateForm.types';

export const CreateCandidateForm = ({
  onClose,
  handleCreateCandidate,
}: CreateCandidateFormProps) => {
  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string(),
    coverLetter: Yup.string(),
  });

  const formik = useFormik<CandidateFormData>({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await handleCreateCandidate(values);
        formik.resetForm();
        onClose();
      } catch (error) {}
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  return (
    <div className="h-full flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-greyscale-900">Add Candidate</p>
      </div>
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            <Input
              required
              name="fullName"
              label="Full name"
              onBlur={formik.handleBlur}
              placeholder="Enter full name"
              value={formik.values.fullName}
              error={formik.errors.fullName}
              touched={formik.touched.fullName}
              onChange={(e) => formik.setFieldValue('fullName', e.target.value)}
            />
            <Input
              required
              type="email"
              name="email"
              label="Email"
              onBlur={formik.handleBlur}
              value={formik.values.email}
              error={formik.errors.email}
              touched={formik.touched.email}
              placeholder="candidate@example.com"
              onChange={(e) => formik.setFieldValue('email', e.target.value)}
            />
            <Input
              name="phone"
              label="Phone (optional)"
              onBlur={formik.handleBlur}
              placeholder="+1 555 123 4567"
              value={formik.values.phone}
              error={formik.errors.phone}
              touched={formik.touched.phone}
              onChange={(e) => formik.setFieldValue('phone', e.target.value)}
            />
            <TextArea
              rows={6}
              name="coverLetter"
              onBlur={formik.handleBlur}
              label="Cover letter (optional)"
              value={formik.values.coverLetter}
              error={formik.errors.coverLetter}
              touched={formik.touched.coverLetter}
              onChange={(e) =>
                formik.setFieldValue('coverLetter', e.target.value)
              }
              placeholder="Short note about why this candidate is a good fit..."
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
            text={formik.isSubmitting ? 'Submitting...' : 'Submit'}
            variant="primary"
            className="w-[150px]"
            onClick={async () => {
              await formik.setTouched({
                fullName: true,
                email: true,
                phone: true,
                coverLetter: true,
              });
              formik.handleSubmit();
            }}
            disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
