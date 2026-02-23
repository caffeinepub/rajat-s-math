import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ValidationResult, Submission, MathProblem, ProgressStats, Topic, UserProfile, Course } from '../backend';

// Local storage types for backward compatibility
export interface SolvedProblem {
  problemId: string | bigint;
  solvedAt: number;
  steps: string[];
  timeSpent: number;
  topic?: Topic;
}

export interface UserProgress {
  totalSolved: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  byCategory: Record<string, number>;
  recentProblems: SolvedProblem[];
}

// Local storage helpers
const STORAGE_KEY = 'rajat-math-progress';

function getStoredProgress(): UserProgress {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalSolved: 0,
    byDifficulty: { easy: 0, medium: 0, hard: 0 },
    byCategory: {},
    recentProblems: []
  };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  return useQuery<UserProgress>({
    queryKey: ['progress'],
    queryFn: async () => {
      return getStoredProgress();
    }
  });
}

export function useSaveSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (solution: SolvedProblem & { difficulty: number; topic: Topic }) => {
      const progress = getStoredProgress();
      
      progress.totalSolved += 1;
      
      // Map difficulty numbers to keys
      const difficultyKey = solution.difficulty === 1 ? 'easy' : solution.difficulty === 2 ? 'medium' : 'hard';
      progress.byDifficulty[difficultyKey] += 1;
      
      // Track by topic
      const topicLabel = solution.topic;
      progress.byCategory[topicLabel] = (progress.byCategory[topicLabel] || 0) + 1;
      
      progress.recentProblems = [solution, ...progress.recentProblems].slice(0, 10);
      
      saveProgress(progress);
      return progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    }
  });
}

export function useValidateAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ problemId, studentAnswer }: { problemId: bigint; studentAnswer: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.validateAnswer(problemId, studentAnswer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['progressByTopic'] });
    }
  });
}

export function useGetUserSubmissions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Submission[]>({
    queryKey: ['userSubmissions'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getUserSubmissions(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllProblems() {
  const { actor, isFetching } = useActor();

  return useQuery<MathProblem[]>({
    queryKey: ['allProblems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProblems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProgressByTopic() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ProgressStats[]>({
    queryKey: ['progressByTopic'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getProgressByTopic();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });
}

export function useGetCourseDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<Course>({
    queryKey: ['courseDetails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCourseDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePurchaseCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseCourse();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['courseDetails'] });
    }
  });
}
