export type CandidateCardData = {
  id: string;
  name: string;
  email: string;
  status: string;
  avatar?: string;
  initials: string;
  viewCount: number;
  messageCount: number;
};

export type CandidateCardProps = {
  candidate: CandidateCardData;
};
