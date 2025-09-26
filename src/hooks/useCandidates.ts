

// src/hooks/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Candidate, PaginatedResponse, TimelineEntry, ApiError } from '../types';
import toast from 'react-hot-toast';

interface CandidatesParams {
  search?: string;
  stage?: string;
  jobId?: string;
  page?: number;
  pageSize?: number;
}

const fetchCandidates = async (params: CandidatesParams): Promise<PaginatedResponse<Candidate>> => {
  const urlParams = new URLSearchParams();

  if (params.search) urlParams.append('search', params.search);
  if (params.stage) urlParams.append('stage', params.stage);
  if (params.jobId) urlParams.append('jobId', params.jobId);
  if (params.page) urlParams.append('page', params.page.toString());
  if (params.pageSize) urlParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`/api/candidates?${urlParams.toString()}`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch candidates');
  }

  const result = await response.json();
  // hydrate date fields
  result.data = result.data.map((c: any) => ({ ...c, createdAt: c.createdAt ? new Date(c.createdAt) : new Date() }));
  return result;
};

const updateCandidate = async ({ id, ...updates }: Partial<Candidate> & { id: string }): Promise<Candidate> => {
  const response = await fetch(`/api/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to update candidate');
  }

  return response.json();
};

const fetchTimeline = async (candidateId: string): Promise<TimelineEntry[]> => {
  const response = await fetch(`/api/candidates/${candidateId}/timeline`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch timeline');
  }

  const data = await response.json();
  return data.map((t: any) => ({ ...t, timestamp: t.timestamp ? new Date(t.timestamp) : new Date() }));
};

const fetchCandidate = async (id: string): Promise<Candidate> => {
  const response = await fetch(`/api/candidates/${id}`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch candidate');
  }

  const candidate = await response.json();
  return { ...candidate, createdAt: candidate.createdAt ? new Date(candidate.createdAt) : new Date() };
};

export const useCandidates = (params: CandidatesParams = {}) => {
  const { search = '', stage = '', jobId = '', page = 1, pageSize = 50 } = params;
  return useQuery({
    queryKey: ['candidates', search, stage, jobId, page, pageSize],
    queryFn: () => fetchCandidates({ search, stage, jobId, page, pageSize })
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidate(id),
    enabled: !!id,
    retry: 1,
    staleTime: 0 // Always fetch fresh data
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};

export const useTimeline = (candidateId: string) => {
  return useQuery({
    queryKey: ['timeline', candidateId],
    queryFn: () => fetchTimeline(candidateId),
    enabled: !!candidateId
  });
};


