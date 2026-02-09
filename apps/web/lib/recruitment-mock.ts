export type JobStatus = 'ACTIVE' | 'CLOSED' | 'UNACTIVE';
export type CandidateStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offered'
  | 'Hired'
  | 'Rejected'
  | 'Portfolio Review';
export type EvaluationRating =
  | 'Strong No'
  | 'No'
  | 'Not Sure'
  | 'Yes'
  | 'Excellent';

export interface CandidateActivity {
  actor: string;
  action: 'moved candidate';
  fromStage: CandidateStage;
  toStage: CandidateStage;
  reason?: string;
  timestamp: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  avatarUrl: string;
  currentStatus: CandidateStage;
  appliedJob: string;
  email: string;
  phone: string;
  appliedDate: string;
  rating: number;
  evaluation: {
    selectedRating: EvaluationRating;
    comments: string;
  };
  emailInteraction: {
    templateUsed: string;
    subject: string;
    recipientName: string;
    bodyContent: string;
  };
  activityHistory: CandidateActivity[];
}

export interface JobPipelineStage {
  stage: CandidateStage;
  isLocked: boolean;
  candidates: CandidateProfile[];
}

export interface HiringMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface JobCardRecord {
  id: string;
  jobTitle: string;
  status: JobStatus;
  department: string;
  location: string;
  candidatesApplied: number;
  createdAtLabel: string;
  actionState: 'Active' | 'Closed' | 'Unactive';
  employmentType: string;
  openingsQuantity: number;
  closingDate: string;
  description: string;
  workflowStages: CandidateStage[];
  hiringTeam: HiringMember[];
  pipeline: JobPipelineStage[];
}

const ceciliaWright: HiringMember = {
  id: 'U-101',
  name: 'Cecilia Wright',
  email: 'cecilia@pixeloffice.com',
  avatar: 'CW',
};
const zoeAlexander: HiringMember = {
  id: 'U-102',
  name: 'Zoe Alexander',
  email: 'zoe@pixeloffice.com',
  avatar: 'ZA',
};
const jeromeLi: HiringMember = {
  id: 'U-103',
  name: 'Jerome Li',
  email: 'jerome@pixeloffice.com',
  avatar: 'JL',
};
const rinaPatel: HiringMember = {
  id: 'U-104',
  name: 'Rina Patel',
  email: 'rina@pixeloffice.com',
  avatar: 'RP',
};
const recruitingTeam: HiringMember[] = [
  ceciliaWright,
  zoeAlexander,
  jeromeLi,
  rinaPatel,
];

const defaultWorkflowStages: CandidateStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offered',
  'Hired',
  'Rejected',
];

const baseCandidate: CandidateProfile = {
  id: 'C-010',
  name: 'Pristia Candra',
  avatarUrl: 'PC',
  currentStatus: 'Applied',
  appliedJob: '3D Designer',
  email: 'pristia@gmail.com',
  phone: '089318298493',
  appliedDate: '2024-05-11',
  rating: 4.2,
  evaluation: {
    selectedRating: 'Yes',
    comments: 'You are have talented, love your work!',
  },
  emailInteraction: {
    templateUsed: 'Auto Confirmation',
    subject: 'Thank you for your application at Pixel Office',
    recipientName: 'Cecilia',
    bodyContent:
      'Thank you very much for applying for the Engineering Manager position at Pixel Office. Please be informed that we have received your application. Our hiring team is currently reviewing all applications. If you are among qualified candidates, you will receive an email notifying you of the next step soon.',
  },
  activityHistory: [
    {
      actor: 'Pixel Office',
      action: 'moved candidate',
      fromStage: 'Rejected',
      toStage: 'Applied',
      timestamp: '1m ago',
    },
    {
      actor: 'Zoe Alexander',
      action: 'moved candidate',
      fromStage: 'Applied',
      toStage: 'Rejected',
      reason: 'Spam',
      timestamp: '5m ago',
    },
  ],
};

export function getRecruitmentSeed(): JobCardRecord[] {
  const jobs: JobCardRecord[] = [
    {
      id: 'JOB-101',
      jobTitle: '3D Designer',
      status: 'ACTIVE',
      department: 'Designer',
      location: 'Unpixel HQ',
      candidatesApplied: 0,
      createdAtLabel: '3m ago',
      actionState: 'Active',
      employmentType: 'Full-time',
      openingsQuantity: 2,
      closingDate: '2026-03-15',
      description:
        'Create compelling 3D assets and motion visuals for brand campaigns and product launches.',
      workflowStages: [...defaultWorkflowStages],
      hiringTeam: [ceciliaWright, zoeAlexander],
      pipeline: defaultWorkflowStages.map((stage) => ({
        stage,
        isLocked: ['Applied', 'Offered', 'Hired', 'Rejected'].includes(stage),
        candidates: [],
      })),
    },
    {
      id: 'JOB-102',
      jobTitle: 'UI UX Designer',
      status: 'ACTIVE',
      department: 'Designer',
      location: 'Unpixel HQ',
      candidatesApplied: 10,
      createdAtLabel: '3m ago',
      actionState: 'Active',
      employmentType: 'Full-time',
      openingsQuantity: 1,
      closingDate: '2026-03-12',
      description:
        'Design and iterate on web and mobile interfaces with clear UX rationale and polished visual systems.',
      workflowStages: [
        'Applied',
        'Screening',
        'Interview',
        'Offered',
        'Hired',
        'Rejected',
      ],
      hiringTeam: [zoeAlexander, jeromeLi],
      pipeline: [
        {
          stage: 'Applied',
          isLocked: true,
          candidates: [
            {
              id: 'C-001',
              name: 'Alex Johnson',
              avatarUrl: 'AJ',
              currentStatus: 'Applied',
              appliedJob: 'UI UX Designer',
              email: 'alex.j@example.com',
              phone: '081234551234',
              appliedDate: '2024-05-10',
              rating: 4.5,
              evaluation: {
                selectedRating: 'Yes',
                comments: 'Strong portfolio and clean interaction thinking.',
              },
              emailInteraction: {
                templateUsed: 'Auto Confirmation',
                subject: 'Thank you for your application at Pixel Office',
                recipientName: 'Alex',
                bodyContent:
                  'We received your UI UX Designer application and will share updates with you soon.',
              },
              activityHistory: [],
            },
          ],
        },
        {
          stage: 'Screening',
          isLocked: false,
          candidates: [],
        },
        {
          stage: 'Interview',
          isLocked: false,
          candidates: [
            {
              id: 'C-005',
              name: 'Sarah Miller',
              avatarUrl: 'SM',
              currentStatus: 'Interview',
              appliedJob: 'UI UX Designer',
              email: 's.miller@webmail.com',
              phone: '082222110009',
              appliedDate: '2024-05-08',
              rating: 5,
              evaluation: {
                selectedRating: 'Excellent',
                comments:
                  'Very complete case study and clear stakeholder communication.',
              },
              emailInteraction: {
                templateUsed: 'Interview Invite',
                subject: 'Interview schedule for Pixel Office',
                recipientName: 'Sarah',
                bodyContent:
                  'Please choose an available slot for your interview.',
              },
              activityHistory: [],
            },
          ],
        },
        {
          stage: 'Offered',
          isLocked: true,
          candidates: [],
        },
        {
          stage: 'Hired',
          isLocked: true,
          candidates: [],
        },
        {
          stage: 'Rejected',
          isLocked: true,
          candidates: [],
        },
      ],
    },
    {
      id: 'JOB-103',
      jobTitle: 'Senior Android Developer',
      status: 'CLOSED',
      department: 'IT',
      location: 'Unpixel Indonesia',
      candidatesApplied: 115,
      createdAtLabel: '3m ago',
      actionState: 'Closed',
      employmentType: 'Contract',
      openingsQuantity: 1,
      closingDate: '2026-02-17',
      description:
        'Lead Android architecture and mentor engineers across native delivery squads.',
      workflowStages: [...defaultWorkflowStages],
      hiringTeam: [jeromeLi, rinaPatel],
      pipeline: defaultWorkflowStages.map((stage) => ({
        stage,
        isLocked: ['Applied', 'Offered', 'Hired', 'Rejected'].includes(stage),
        candidates: [],
      })),
    },
    {
      id: 'JOB-104',
      jobTitle: 'Senior Android Developer',
      status: 'UNACTIVE',
      department: 'IT',
      location: 'Unpixel Indonesia',
      candidatesApplied: 115,
      createdAtLabel: '3m ago',
      actionState: 'Unactive',
      employmentType: 'Full-time',
      openingsQuantity: 3,
      closingDate: '2026-04-10',
      description:
        'Build performant Android features and collaborate with product, QA, and backend teams.',
      workflowStages: [
        'Applied',
        'Portfolio Review',
        'Interview',
        'Offered',
        'Hired',
        'Rejected',
      ],
      hiringTeam: [...recruitingTeam],
      pipeline: [
        {
          stage: 'Applied',
          isLocked: true,
          candidates: [{ ...baseCandidate }],
        },
        {
          stage: 'Portfolio Review',
          isLocked: false,
          candidates: [],
        },
        {
          stage: 'Interview',
          isLocked: false,
          candidates: [],
        },
        {
          stage: 'Offered',
          isLocked: true,
          candidates: [],
        },
        {
          stage: 'Hired',
          isLocked: true,
          candidates: [],
        },
        {
          stage: 'Rejected',
          isLocked: true,
          candidates: [],
        },
      ],
    },
  ];

  return jobs.map((job) => ({
    ...job,
    hiringTeam: job.hiringTeam.map((member) => ({ ...member })),
    workflowStages: [...job.workflowStages],
    pipeline: job.pipeline.map((stage) => ({
      ...stage,
      candidates: stage.candidates.map((candidate) => ({
        ...candidate,
        evaluation: { ...candidate.evaluation },
        emailInteraction: { ...candidate.emailInteraction },
        activityHistory: candidate.activityHistory.map((activity) => ({
          ...activity,
        })),
      })),
    })),
  }));
}
