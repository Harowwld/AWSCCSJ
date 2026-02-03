export type Highlight = {
  title: string;
  description: string;
  icon: string;
};

export type Event = {
  title: string;
  description: string;
  date: string;
  location: string;
  tags: string[];
};

export type Member = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socials: {
    github?: string;
    linkedin?: string;
  };
};

export type Announcement = {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image?: string;
};

export const highlights: Highlight[] = [
  {
    title: 'Hands-on Cloud Labs',
    description: 'Spin up real AWS services with guided workshops—EC2, S3, Lambda, API Gateway, and more.',
    icon: 'Cloud',
  },
  {
    title: 'Certification Pathways',
    description: 'Study jams and mentoring for Cloud Practitioner and Solutions Architect certifications.',
    icon: 'Shield',
  },
  {
    title: 'Community & Careers',
    description: 'Connect with peers, build projects, join hackathons, and meet industry mentors.',
    icon: 'Users',
  },
];

export const events: Event[] = [
  {
    title: 'AWS Cloud Essentials Workshop',
    description: 'Launch EC2, host static sites on S3 + CloudFront, and wire API Gateway to Lambda.',
    date: 'Feb 15, 2024 — 2:00 PM',
    location: 'PUP San Juan IT Building 301',
    tags: ['EC2', 'S3', 'Lambda'],
  },
  {
    title: 'Serverless Architecture Deep Dive',
    description: 'Design event-driven workflows with Step Functions, queues, and DynamoDB streams.',
    date: 'Feb 22, 2024 — 3:00 PM',
    location: 'PUP San Juan IT Building 302',
    tags: ['Serverless', 'API Gateway', 'DynamoDB'],
  },
  {
    title: 'AWS Certification Study Jam',
    description: 'Weekly cohort for Cloud Practitioner / SAA-C03 exam prep with practice labs.',
    date: 'Every Friday — 5:00 PM',
    location: 'Library Collaboration Room',
    tags: ['Certification', 'Study Jam'],
  },
];

export const members: Member[] = [
  {
    name: 'John Doe',
    role: 'President',
    bio: 'Leads community programs and partnerships focused on student cloud growth.',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    socials: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
    },
  },
  {
    name: 'Jane Smith',
    role: 'Vice President',
    bio: 'Runs events and DevOps workshops on CI/CD, containers, and observability.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    socials: {
      github: 'https://github.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith',
    },
  },
  {
    name: 'Mike Johnson',
    role: 'Technical Lead',
    bio: 'Serverless advocate building sample stacks on AWS CDK and Lambda.',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80',
    socials: {
      github: 'https://github.com/mikejohnson',
      linkedin: 'https://linkedin.com/in/mikejohnson',
    },
  },
  {
    name: 'Sarah Williams',
    role: 'Secretary',
    bio: 'Keeps our initiatives organized and communicates with campus partners.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    socials: {
      linkedin: 'https://linkedin.com/in/sarahwilliams',
    },
  },
];

export const announcements: Announcement[] = [
  {
    title: 'Welcome to AWS Cloud Club PUP San Juan',
    excerpt: 'Join us for a semester of hands-on labs, career pathways, and mentorship.',
    date: 'Jan 20, 2024',
    author: 'John Doe',
    image: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'AWS Educate Credits Available',
    excerpt: 'Apply for AWS credits to practice building cloud projects without cost.',
    date: 'Jan 25, 2024',
    author: 'Jane Smith',
  },
  {
    title: 'Hackathon Prep Night',
    excerpt: 'Warm-up session for building serverless apps with API Gateway and DynamoDB.',
    date: 'Feb 1, 2024',
    author: 'Mike Johnson',
  },
];
