'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getJobs, addJob, type Job, type JobType } from '@/lib/jobs';
import { useApp } from '@/lib/app-context';
import { timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Briefcase,
  MapPin,
  Search,
  Plus,
  Clock,
  User,
  HandCoins,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const { piUser } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JobType>('hiring');
  const [searchQuery, setSearchQuery] = useState('');
  const [postOpen, setPostOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactJob, setContactJob] = useState<Job | null>(null);

  const [form, setForm] = useState({
    type: 'hiring' as JobType,
    title: '',
    description: '',
    location: '',
    salary: '',
    contact_info: '',
  });

  const refreshJobs = useCallback(() => {
    setLoading(true);
    setJobs(getJobs());
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => j.type === activeTab)
      .filter((j) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
        );
      });
  }, [jobs, activeTab, searchQuery]);

  const hiringCount = jobs.filter((j) => j.type === 'hiring').length;
  const lookingCount = jobs.filter((j) => j.type === 'looking_for_work').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    addJob({
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      salary: form.salary.trim(),
      contact_info: form.contact_info.trim(),
      username: piUser?.username ?? 'Anonymous',
    });
    setSubmitting(false);
    setForm({
      type: 'hiring',
      title: '',
      description: '',
      location: '',
      salary: '',
      contact_info: '',
    });
    setPostOpen(false);
    refreshJobs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zw-green-50/30 to-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-zw-green-50 via-background to-zw-yellow-50 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-zw-green flex items-center justify-center shadow-md">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold leading-tight">
                Find Jobs &amp; Hire Talent
              </h1>
              <p className="text-muted-foreground mt-1">
                Jobs - Find Work in Zimbabwe
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/60 shadow-sm">
              <Briefcase className="h-4 w-4 text-zw-green" />
              <span className="text-sm font-semibold">{hiringCount}</span>
              <span className="text-sm text-muted-foreground">hiring</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/60 shadow-sm">
              <User className="h-4 w-4 text-zw-yellow-600" />
              <span className="text-sm font-semibold">{lookingCount}</span>
              <span className="text-sm text-muted-foreground">looking for work</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4">
        <Card className="p-4 shadow-md border-border/60">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title or location..."
              className="pl-9 h-11 rounded-full bg-muted/50 border-0"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JobType)}>
            <TabsList className="grid w-full grid-cols-2 h-11 rounded-full bg-muted/50">
              <TabsTrigger
                value="hiring"
                className="rounded-full data-[state=active]:bg-zw-green data-[state=active]:text-white font-medium"
              >
                <Briefcase className="h-4 w-4 mr-1.5" />
                Hiring
              </TabsTrigger>
              <TabsTrigger
                value="looking_for_work"
                className="rounded-full data-[state=active]:bg-zw-green data-[state=active]:text-white font-medium"
              >
                <User className="h-4 w-4 mr-1.5" />
                Looking for Work
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </div>

      {/* Job list */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredJobs.map((job, i) => (
              <Card
                key={job.id}
                className={cn(
                  'p-5 border-border/60 hover:shadow-lg hover:border-zw-green/30 transition-all animate-fade-up flex flex-col'
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                        job.type === 'hiring'
                          ? 'bg-zw-green-50 text-zw-green'
                          : 'bg-zw-yellow-50 text-zw-yellow-600'
                      )}
                    >
                      {job.type === 'hiring' ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] font-semibold',
                        job.type === 'hiring'
                          ? 'bg-zw-green-50 text-zw-green-700'
                          : 'bg-zw-yellow-50 text-zw-yellow-700'
                      )}
                    >
                      {job.type === 'hiring' ? 'Hiring' : 'Looking for Work'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {timeAgo(job.created_at)}
                  </div>
                </div>

                <h3 className="font-semibold text-base leading-snug mb-1.5 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <HandCoins className="h-3.5 w-3.5 text-zw-green" />
                      {job.salary}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-zw-green/20 text-zw-green text-[10px] font-bold flex items-center justify-center">
                      {job.username.charAt(0).toUpperCase()}
                    </div>
                    {job.username}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setContactJob(job)}
                    className="rounded-full bg-zw-green hover:bg-zw-green-600 text-white h-8 px-4 text-xs font-medium"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery.trim()
                ? 'No jobs match your search. Try a different term.'
                : activeTab === 'hiring'
                ? 'No job listings yet. Be the first to post!'
                : 'No one is looking for work yet.'}
            </p>
            {piUser && (
              <Button
                onClick={() => setPostOpen(true)}
                className="mt-4 bg-zw-green hover:bg-zw-green-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Post a Job
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Floating Post button */}
      {piUser && (
        <button
          onClick={() => setPostOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-14 px-5 shadow-xl flex items-center gap-2 font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Post Job</span>
        </button>
      )}

      {/* Post Job Modal */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-zw-green" />
              Post a Job
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as JobType })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiring">Hiring — I need someone</SelectItem>
                  <SelectItem value="looking_for_work">
                    Looking for Work — I am available
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={
                  form.type === 'hiring'
                    ? 'e.g. Shop Assistant Needed'
                    : 'e.g. Experienced Driver Available'
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-desc">Description</Label>
              <Textarea
                id="job-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={
                  form.type === 'hiring'
                    ? 'Describe the role, hours, and requirements...'
                    : 'Describe your skills, experience, and availability...'
                }
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input
                  id="job-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Harare"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary">Salary / Rate</Label>
                <Input
                  id="job-salary"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. 5 π/day"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-contact">Contact Info</Label>
              <Input
                id="job-contact"
                value={form.contact_info}
                onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                placeholder="Phone, email, or Pi username"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPostOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-zw-green hover:bg-zw-green-600 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={!!contactJob} onOpenChange={(v) => !v && setContactJob(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-zw-green" />
              Contact {contactJob?.username ?? 'Poster'}
            </DialogTitle>
          </DialogHeader>
          {contactJob && (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">
                About: <span className="font-medium text-foreground">{contactJob.title}</span>
              </p>
              {contactJob.contact_info ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                    <Phone className="h-4 w-4 text-zw-green shrink-0" />
                    <span className="text-sm font-medium break-all">
                      {contactJob.contact_info}
                    </span>
                  </div>
                  <Button
                    className="w-full rounded-full bg-zw-green hover:bg-zw-green-600 text-white"
                    onClick={() => {
                      if (contactJob.contact_info) {
                        window.location.href = `tel:${contactJob.contact_info.replace(/\s/g, '')}`;
                      }
                    }}
                  >
                    <Phone className="h-4 w-4 mr-1.5" /> Call / Message
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-3 rounded-xl bg-muted/50">
                  No contact information was provided for this listing.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
