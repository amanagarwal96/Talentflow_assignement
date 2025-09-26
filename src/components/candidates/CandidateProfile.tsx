import React from 'react';
import { useParams } from 'react-router-dom';
import { useCandidate, useTimeline } from '../../hooks/useCandidates';
import { useJobs } from '../../hooks/useJobs';
import { CandidateTimeline } from './CandidateTimeline';
import { CandidateNotes } from './CandidateNotes';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { User, Mail, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use the individual candidate hook which will fetch from database
  const { data: candidate, isLoading, error } = useCandidate(id!);
  const { data: timelineData, isLoading: timelineLoading } = useTimeline(id!);
  const { data: jobsData } = useJobs({ pageSize: 1000 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium">
          Failed to load candidate
        </div>
        <div className="text-gray-500 mt-2">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">Candidate not found</div>
        <div className="text-sm text-gray-400">
          <p>Candidate ID: {id}</p>
          <p>Please check if the candidate exists or try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const job = jobsData?.data.find(j => j.id === candidate.jobId);

  const STAGE_COLORS = {
    applied: 'default',
    screen: 'warning',
    tech: 'info',
    offer: 'success',
    hired: 'success',
    rejected: 'error'
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {candidate.name}
              </h1>
              
              <div className="flex items-center space-x-4 mt-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.email}</span>
                </div>
                
                {job && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.title}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={STAGE_COLORS[candidate.stage]}>
              {candidate.stage}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
          
          {timelineLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <CandidateTimeline timeline={timelineData || []} />
          )}
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <CandidateNotes candidateId={candidate.id} />
        </div>
      </div>
    </div>
  );
};