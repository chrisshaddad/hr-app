'use client';

import { MessageCircle, Eye, MoreVertical } from 'lucide-react';

export type CandidateCardData = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  messageCount: number;
  viewCount: number;
  status: string;
};

type CandidateCardProps = {
  candidate: CandidateCardData;
};

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <div className="p-4 rounded-4 w-full rounded-[16px] bg-Others-White flex flex-col gap-1 cursor-pointer">
      <p className="font-semibold text-GreyScale-900 text-sm">Ali Chbib</p>
      <p className="text-GreyScale-500 text-xs">jennifer@gmail.com</p>
    </div>
  );
};

export { CandidateCard };
