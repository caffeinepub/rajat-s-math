import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MeetingPlatform } from '../backend';

export type { MeetingPlatform };

// ─── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<any>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; hasPurchasedCourse: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUserProfiles?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for components that use useIsAdmin
export const useIsAdmin = useIsCallerAdmin;

// ─── Booking Records ─────────────────────────────────────────────────────────

export function useBookingRecords() {
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

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, status }: { index: number; status: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateBookingStatus?.(BigInt(index), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
    },
  });
}

export function useMarkAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).markAsPaid?.(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
    },
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteBooking?.(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
    },
  });
}

export function useConfirmPaymentAndGenerateAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).confirmPaymentAndGenerateAccessCode?.(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['accessCodes'] });
    },
  });
}

export function useGetCompletedBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['completedBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCompletedBookings?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFindBookingByAccessCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).findBookingByAccessCode?.(code) ?? null;
    },
  });
}

// ─── Course Materials ─────────────────────────────────────────────────────────

export function useGetCourseMaterials(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['courseMaterials', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCourseMaterials?.(courseName) ?? [];
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

export function useAddCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addCourseMaterial?.(material);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials'] });
    },
  });
}

export function useDeleteCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteCourseMaterial?.(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials'] });
    },
  });
}

// Alias used by some components
export const useRemoveCourseMaterial = useDeleteCourseMaterial;

// ─── Course Sessions ──────────────────────────────────────────────────────────

export function useGetCourseSessions(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['courseSessions', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCourseSessions?.(courseName) ?? [];
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

// Aliases used by ClassSessionsManager
export const useGetClassSessions = useGetCourseSessions;

export function useAddCourseSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addCourseSession?.(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
    },
  });
}

// Alias
export const useAddClassSession = useAddCourseSession;

export function useDeleteCourseSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionTitle: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteCourseSession?.(sessionTitle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
    },
  });
}

// Alias
export const useRemoveClassSession = useDeleteCourseSession;

// ─── Meeting Link Mutations ───────────────────────────────────────────────────

export function useAddOrUpdateMeetingLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionTitle,
      platform,
      meetingLink,
    }: {
      sessionTitle: string;
      platform: MeetingPlatform;
      meetingLink: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateMeetingLink(sessionTitle, platform, meetingLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
      queryClient.invalidateQueries({ queryKey: ['studentSessions'] });
    },
  });
}

export function useRemoveMeetingLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionTitle: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeMeetingLink(sessionTitle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
      queryClient.invalidateQueries({ queryKey: ['studentSessions'] });
    },
  });
}

// ─── Support Messages ─────────────────────────────────────────────────────────

export function useGetAllSupportMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allSupportMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSupportMessages?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMySupportMessages(studentPrincipal: any) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['mySupportMessages', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return (actor as any).getSupportMessages?.(studentPrincipal) ?? [];
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useSubmitSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitSupportMessage?.(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySupportMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allSupportMessages'] });
    },
  });
}

export function useReplyToSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentPrincipal,
      messageIndex,
      reply,
    }: {
      studentPrincipal: any;
      messageIndex: number;
      reply: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).replyToSupportMessage?.(studentPrincipal, BigInt(messageIndex), reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportMessages'] });
      queryClient.invalidateQueries({ queryKey: ['mySupportMessages'] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAttendanceRecords(
  studentPrincipal: any,
  bookingId: string,
  course: string,
  startDate: bigint,
  endDate: bigint
) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: [
      'attendanceRecords',
      studentPrincipal?.toString(),
      bookingId,
      course,
      startDate.toString(),
      endDate.toString(),
    ],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return (actor as any).getAttendanceRecords?.(
        studentPrincipal,
        bookingId,
        course,
        startDate,
        endDate
      ) ?? [];
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useGetAttendanceSummary(
  studentPrincipal: any,
  bookingId: string,
  course: string,
  startDate: bigint,
  endDate: bigint
) {
  const { actor, isFetching } = useActor();

  return useQuery<any>({
    queryKey: [
      'attendanceSummary',
      studentPrincipal?.toString(),
      bookingId,
      course,
      startDate.toString(),
      endDate.toString(),
    ],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return null;
      return (actor as any).getAttendanceSummary?.(
        studentPrincipal,
        bookingId,
        course,
        startDate,
        endDate
      ) ?? null;
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).markAttendance?.(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary'] });
    },
  });
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export function useGetDiscountCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['discountCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getDiscountCodes?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias
export const useGetActiveDiscountCodes = useGetDiscountCodes;

export function useGenerateDiscountCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      discountPercent,
    }: {
      code: string;
      discountPercent: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).generateDiscountCode?.(code, BigInt(discountPercent));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });
}

export function useDeactivateDiscountCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deactivateDiscountCode?.(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });
}

export function useSetDiscountCodeActiveState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, isActive }: { code: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      if (isActive) {
        return (actor as any).activateDiscountCode?.(code);
      } else {
        return (actor as any).deactivateDiscountCode?.(code);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });
}

export function useValidateDiscountCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).validateDiscountCode?.(code);
    },
  });
}

// ─── Roadmaps ─────────────────────────────────────────────────────────────────

export function useGetRoadmap(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<any>({
    queryKey: ['roadmap', courseName],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getRoadmap?.(courseName) ?? null;
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

export function useUpdateRoadmap() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseName, roadmap }: { courseName: string; roadmap: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateRoadmap?.(courseName, roadmap);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });
}

// ─── Student Sessions ─────────────────────────────────────────────────────────

export function useGetStudentSessions(studentPrincipal: any) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['studentSessions', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return (actor as any).getStudentSessions?.(studentPrincipal) ?? [];
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useAddStudentSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addStudentSession?.(session);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ['studentSessions', variables.studentPrincipal?.toString()],
      });
    },
  });
}

export function useDeleteStudentSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentPrincipal,
      index,
    }: {
      studentPrincipal: any;
      index: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteStudentSession?.(studentPrincipal, BigInt(index));
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ['studentSessions', variables.studentPrincipal?.toString()],
      });
    },
  });
}

// ─── Student Materials ────────────────────────────────────────────────────────

export function useGetStudentMaterials(studentPrincipal: any) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['studentMaterials', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return (actor as any).getStudentMaterials?.(studentPrincipal) ?? [];
    },
    enabled: !!actor && !isFetching && !!studentPrincipal,
  });
}

export function useAddStudentMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addStudentMaterial?.(material);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ['studentMaterials', variables.studentPrincipal?.toString()],
      });
    },
  });
}

export function useDeleteStudentMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentPrincipal,
      index,
    }: {
      studentPrincipal: any;
      index: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteStudentMaterial?.(studentPrincipal, BigInt(index));
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ['studentMaterials', variables.studentPrincipal?.toString()],
      });
    },
  });
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export function useGetAllEnquiries() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allEnquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllEnquiries?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitEnquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enquiry: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitEnquiry?.(enquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEnquiries'] });
    },
  });
}

export function useGetEnquiryById() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getEnquiryById?.(id) ?? null;
    },
  });
}

export function useGetEnquiryStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getEnquiryById?.(id) ?? null;
    },
  });
}

export function useUpdateEnquiryStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateEnquiryStatus?.(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEnquiries'] });
    },
  });
}

export function useConfirmEnquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateEnquiryStatus?.(id, { confirmed: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEnquiries'] });
    },
  });
}

export function useRejectEnquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateEnquiryStatus?.(id, { rejected: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEnquiries'] });
    },
  });
}

// ─── Payment Enquiries ────────────────────────────────────────────────────────

export function useSubmitPaymentEnquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enquiry: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitPaymentEnquiry?.(enquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentEnquiries'] });
    },
  });
}

// Alias
export const useAddPaymentEnquiry = useSubmitPaymentEnquiry;

export function useGetPaymentEnquiries() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['paymentEnquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPaymentEnquiries?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Course Details ───────────────────────────────────────────────────────────

export function useGetCourseDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<any>({
    queryKey: ['courseDetails'],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getCourseDetails?.() ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordUPIPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment?: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).recordUPIPayment?.(payment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseDetails'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Access Codes ─────────────────────────────────────────────────────────────

export function useValidateAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).validateAccessCode?.(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGenerateAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).generateAccessCode?.(phone, code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessCodes'] });
    },
  });
}

export function useGetAccessCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['accessCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAccessCodes?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── QR Check-In ─────────────────────────────────────────────────────────────

export function useValidateQRToken() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).validateQRToken?.(token);
    },
  });
}

// Alias for components using old name
export const useValidateQrToken = useValidateQRToken;

export function useConfirmQRCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).confirmQRCheckIn?.(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
    },
  });
}

// ─── Math Problems ────────────────────────────────────────────────────────────

export function useGetProblem(topic: string, difficulty: number) {
  const { actor, isFetching } = useActor();

  return useQuery<any>({
    queryKey: ['problem', topic, difficulty],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getProblem?.(topic, BigInt(difficulty)) ?? null;
    },
    enabled: !!actor && !isFetching && !!topic,
  });
}

export function useValidateAnswer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      problemId,
      answer,
    }: {
      problemId: number;
      answer: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).validateAnswer?.(BigInt(problemId), BigInt(answer));
    },
  });
}

export function useGetProgressStats() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['progressStats'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getProgressStats?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}
