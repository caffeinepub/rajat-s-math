import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAddBookingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addBookingRecord?.(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
    },
  });
}

export function useGetBookingRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['bookingRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBookingRecords?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}
