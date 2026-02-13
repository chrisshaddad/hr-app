'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';

type VerifyStatus = 'loading' | 'success' | 'error';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing token');
      return;
    }

    const verify = async () => {
      try {
        // await verifyMagicLink({ token });
        // setStatus('success');
        // toast.success('Successfully logged in!');
        // // Small delay to show success state before redirecting
        // setTimeout(() => {
        //   router.replace('/dashboard');
        // }, 1000);
        const { user } = await verifyMagicLink({ token });

        setTimeout(() => {
          switch (user.role) {
            case 'SUPER_ADMIN':
              router.replace('/organizations');
              break;
            case 'ORG_ADMIN':
              router.replace('/dashboard'); // later you can make /dashboard be org admin
              break;
            default:
              router.replace('/dashboard'); // employee
          }
        }, 1000);
      } catch (error) {
        setStatus('error');
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else {
          setErrorMessage('Verification failed. Please try again.');
          toast.error('Verification failed. Please try again.');
        }
      }
    };

    verify();
  }, [searchParams, verifyMagicLink, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-base" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Verifying your magic link...
            </h1>
            <p className="mt-2 text-muted-foreground">
              Please wait while we log you in.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary-base" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Successfully verified!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Verification failed
            </h1>
            <p className="mt-2 text-muted-foreground">{errorMessage}</p>
            <a
              href="/login"
              className="mt-4 inline-block text-primary-base hover:underline"
            >
              Back to login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
