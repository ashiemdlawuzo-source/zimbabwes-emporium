export type JobType = 'hiring' | 'looking_for_work';

export interface Job {
  id: string;
  type: JobType;
  title: string;
  description: string;
  location: string;
  salary: string;
  contact_info: string;
  username: string;
  created_at: number;
}

const JOBS_KEY = 'zw_jobs';
const SEED_FLAG_KEY = 'zw_jobs_seeded';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const SEED_JOBS: Job[] = [
  {
    id: 'job-seed-1',
    type: 'hiring',
    title: 'Shop Assistant Needed',
    description:
      'We are looking for a reliable shop assistant for our tuckshop in Mbare. Duties include serving customers, stocking shelves, and handling Pi payments. Must be honest and friendly.',
    location: 'Harare',
    salary: '5 π/day',
    contact_info: '+263 77 100 2000',
    username: 'AmaiGrace',
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'job-seed-2',
    type: 'hiring',
    title: 'Delivery Driver — Hub to Hub',
    description:
      'Need a driver to move parcels between our Bulawayo hub and surrounding areas. Must have a valid license and know the city well. Pi paid per delivery.',
    location: 'Bulawayo',
    salary: '8 π/day + tips',
    contact_info: '+263 29 300 4000',
    username: 'ByoHubManager',
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'job-seed-3',
    type: 'looking_for_work',
    title: 'Experienced Welder Available',
    description:
      'I am a skilled welder with 6 years of experience in gate fabrication, window frames, and general metal work. Available for contract or full-time work in and around Harare.',
    location: 'Harare',
    salary: 'Negotiable',
    contact_info: '+263 78 555 1212',
    username: 'TendaiWelder',
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

export function ensureJobsSeeded(): void {
  if (!isClient()) return;
  if (localStorage.getItem(SEED_FLAG_KEY)) return;
  safeSet(JOBS_KEY, SEED_JOBS);
  localStorage.setItem(SEED_FLAG_KEY, '1');
}

export function getJobs(): Job[] {
  ensureJobsSeeded();
  return safeGet<Job[]>(JOBS_KEY, []).sort((a, b) => b.created_at - a.created_at);
}

export function addJob(
  job: Omit<Job, 'id' | 'created_at'>
): Job {
  const jobs = safeGet<Job[]>(JOBS_KEY, []);
  const newJob: Job = {
    ...job,
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: Date.now(),
  };
  jobs.unshift(newJob);
  safeSet(JOBS_KEY, jobs);
  return newJob;
}

export function deleteJob(id: string): void {
  const jobs = safeGet<Job[]>(JOBS_KEY, []);
  safeSet(
    JOBS_KEY,
    jobs.filter((j) => j.id !== id)
  );
}
