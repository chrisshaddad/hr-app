import Image from 'next/image';

import { Button } from '@/components/atoms/Button/Button';

const JobCreatedDialog = ({ onCheckNow }: { onCheckNow: () => void }) => {
  return (
    <div className="p-8 pt-[50px] flex flex-col gap-8">
      <div className="flex flex-col items-center">
        <Image
          width={265}
          height={166}
          alt="Job Created Success"
          src="/icons/jobCreatedSuccess.svg"
        />
        <div className="flex flex-col gap-4">
          <p className="text-[32px] text-center text-GreyScale-900 font-bold">
            Add Job Success!
          </p>
          <p className="text-[18px] text-center text-GreyScale-900">
            New job has been successfully created, stay tuned!
          </p>
        </div>
      </div>
      <Button text="Check Now" onClick={onCheckNow} fullWidth />
    </div>
  );
};

export { JobCreatedDialog };
