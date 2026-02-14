'use client';

import { MessageSquare, User } from 'lucide-react';
import { CandidateCardProps } from './CandidateCard.types';
import { Avatar, AvatarFallback } from '@/components/atoms';

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <div className="p-4 rounded-[16px] bg-others-white flex flex-col gap-3 cursor-pointer border border-greyscale-300">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-greyscale-100 text-greyscale-600 flex items-center justify-center">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-greyscale-900 text-sm truncate">
            {candidate.name}
          </p>
          <p className="text-greyscale-500 text-xs truncate">
            {candidate.email}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-greyscale-400" />
          <span className="text-greyscale-500 text-xs">
            {candidate.messageCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export { CandidateCard };
