'use client';

import { toast } from 'sonner';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Cta } from '@/components/atoms/Cta/Cta';
import { Input } from '@/components/atoms/Input/Input';
import { magicLinkRequestSchema, type MagicLinkRequest } from '@repo/contracts';

export default function LoginPage() {
  const { requestMagicLink } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<MagicLinkRequest>({
    resolver: zodResolver(magicLinkRequestSchema),
  });

  const emailValue = watch('email') || '';
  const emailRegister = register('email');

  const onSubmit = async (data: MagicLinkRequest) => {
    setIsSubmitting(true);
    try {
      await requestMagicLink(data);
      toast.success('Magic link sent! Check your email to log in.');
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Hero Section */}
      <div className="relative hidden w-1/2 bg-gray-900 lg:flex lg:flex-col lg:justify-end">
        {/* Background Image */}
        <div className="relative flex-1">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Team collaboration"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Section with green top border */}
        <div className="flex flex-col gap-6 border-t-[5px] border-primary-base bg-gray-900 px-12.5 pb-15 pt-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center">
              <span className="text-2xl text-primary-base">✦</span>
            </div>
            <span className="text-xl font-semibold text-white">Humanline</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold leading-[1.2] tracking-[-0.5px] text-white">
            Let&apos;s empower your employees today.
          </h1>

          {/* Subtext */}
          <p className="text-lg leading-normal text-white">
            We help to complete all your conveyancing needs easily
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex w-full flex-col justify-between lg:w-1/2">
        {/* Form Section */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="flex w-full max-w-120 flex-col items-center gap-8">
            {/* Title */}
            <h2 className="w-full text-center text-2xl font-bold leading-[1.3] text-gray-900">
              Login first to your account
            </h2>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-78.75 space-y-6"
            >
              <Input
                required
                type="email"
                name="email"
                value={emailValue}
                label="Email Address"
                touched={!!errors.email}
                error={errors.email?.message}
                placeholder="Input your registered email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setValue('email', value, { shouldValidate: true });
                  emailRegister.onChange(e);
                  if (
                    errors.email &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ) {
                    clearErrors('email');
                  }
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  emailRegister.onBlur(e)
                }
              />

              <Cta
                type="submit"
                className="h-14 w-full rounded-[10px] bg-gray-900 text-base font-bold leading-normal tracking-[0.3px] text-white hover:bg-gray-900/90 disabled:bg-gray-200 disabled:text-gray-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </Cta>
            </form>

            {/* Info Text */}
            <p className="text-center text-sm font-medium leading-[1.6] text-gray-500">
              We&apos;ll send you a magic link to sign in instantly.
              <br />
              No password required.
            </p>

            {/* Register Link */}
            <p className="text-center text-sm font-medium leading-[1.6]">
              <span className="text-gray-500">
                Don&apos;t have a organization?{' '}
              </span>
              <a href="/register" className="text-primary-base hover:underline">
                Create an Org
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm font-medium leading-[1.6]">
            <span className="text-gray-500">
              © {new Date().getFullYear()} Humanline . Alrights reserved.
            </span>
            <a
              href="/terms"
              className="text-gray-900 hover:text-primary-base hover:underline"
            >
              Terms & Conditions
            </a>
            <a
              href="/privacy"
              className="text-gray-900 hover:text-primary-base hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
