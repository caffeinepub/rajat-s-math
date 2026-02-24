import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { BookingRecord } from '../backend';

export function useAddBookingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: BookingRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBookingRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
    },
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
