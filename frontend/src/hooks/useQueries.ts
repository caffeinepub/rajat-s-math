import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Course, BookingRecord } from '../backend';

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

export function useRecordUPIPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordUPIPaymentSuccessful();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['upiPaymentStatus'] });
    }
  });
}

export function useCheckUPIPaymentStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['upiPaymentStatus'],
    queryFn: async () => {
      if (!actor || !identity) return false;
      const principal = identity.getPrincipal();
      return actor.hasPaidWithUPI(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetBookingRecords() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<BookingRecord[]>({
    queryKey: ['bookingRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookingRecords();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useMarkAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAsPaid(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['completedBookings'] });
    },
  });
}

export function useCompletedBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ['completedBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedBookings();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: true,
    staleTime: 30 * 1000, // 30 seconds
  });
}
