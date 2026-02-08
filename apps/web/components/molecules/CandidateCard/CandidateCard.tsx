'use client';

import { CandidateCardProps } from './CandidateCard.types';

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <div className="p-4 rounded-4 w-full rounded-[16px] bg-Others-White flex flex-col gap-1 cursor-pointer">
      <p className="font-semibold text-GreyScale-900 text-sm">Ali Chbib</p>
      <p className="text-GreyScale-500 text-xs">jennifer@gmail.com</p>
    </div>
  );
};

export { CandidateCard };
