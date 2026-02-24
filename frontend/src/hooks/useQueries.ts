import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type {
  UserProfile,
  BookingRecord,
  CourseMaterial,
  ClassSession,
  StudentSupportMessage,
  AttendanceRecord,
  AttendanceSummary,
  ExtendedDiscountCode,
  VisitorActivity,
  EventType,
} from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Course Details ───────────────────────────────────────────────────────────

export function useGetCourseDetails() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['courseDetails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCourseDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── UPI Payment ──────────────────────────────────────────────────────────────

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
    },
  });
}

export function useHasPaidWithUPI(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasPaidWithUPI', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      return actor.hasPaidWithUPI(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// ─── Booking Records ──────────────────────────────────────────────────────────

export function useGetBookingRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ['bookingRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookingRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['completedBookings'] });
    },
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

export function useConfirmPaymentAndGenerateAccessCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPaymentAndGenerateAccessCode(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['completedBookings'] });
    },
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBooking(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['completedBookings'] });
    },
  });
}

export function useFindBookingByAccessCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (accessCode: string): Promise<BookingRecord | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.findBookingByAccessCode(accessCode);
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
  });
}

// ─── Course Materials ─────────────────────────────────────────────────────────

export function useGetCourseMaterials(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CourseMaterial[]>({
    queryKey: ['courseMaterials', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourseMaterials(courseName);
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

export function useAddCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: CourseMaterial) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCourseMaterial(material);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials', variables.courseName] });
      queryClient.invalidateQueries({ queryKey: ['studentCourseMaterials'] });
    },
  });
}

export function useRemoveCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, courseName }: { title: string; courseName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeCourseMaterial(title);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials', variables.courseName] });
      queryClient.invalidateQueries({ queryKey: ['studentCourseMaterials'] });
    },
  });
}

// ─── Class Sessions ───────────────────────────────────────────────────────────

export function useGetClassSessions(courseName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ClassSession[]>({
    queryKey: ['classSessions', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClassSessions(courseName);
    },
    enabled: !!actor && !isFetching && !!courseName,
  });
}

export function useAddClassSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: ClassSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClassSession(session);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classSessions', variables.courseName] });
      queryClient.invalidateQueries({ queryKey: ['studentClassSessions'] });
    },
  });
}

export function useRemoveClassSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionTitle, courseName }: { sessionTitle: string; courseName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeClassSession(sessionTitle);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classSessions', variables.courseName] });
      queryClient.invalidateQueries({ queryKey: ['studentClassSessions'] });
    },
  });
}

// ─── Support Messages ─────────────────────────────────────────────────────────

export function useGetAllSupportMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, StudentSupportMessage[]]>>({
    queryKey: ['allSupportMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSupportMessages() as Promise<Array<[Principal, StudentSupportMessage[]]>>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReplyToSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      messageIndex,
      reply,
    }: {
      studentId: Principal;
      messageIndex: bigint;
      reply: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.replyToSupportMessage(studentId, messageIndex, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportMessages'] });
    },
  });
}

export function useGetMySupportMessages(studentId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StudentSupportMessage[]>({
    queryKey: ['mySupportMessages', studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getSupportMessagesByUser(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useSubmitSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSupportMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySupportMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allSupportMessages'] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAttendanceRecords(
  student: Principal | null,
  course: string,
  startDate: bigint,
  endDate: bigint,
  enabled: boolean = true
) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceRecords', student?.toString(), course, startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor || !student) return [];
      return actor.getAttendanceRecords(student, course, startDate, endDate);
    },
    enabled: !!actor && !isFetching && !!student && !!course && enabled,
  });
}

export function useGetAttendanceSummary(
  student: Principal | null,
  course: string,
  startDate: bigint,
  endDate: bigint,
  enabled: boolean = true
) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceSummary | null>({
    queryKey: ['attendanceSummary', student?.toString(), course, startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor || !student) return null;
      return actor.getAttendanceSummary(student, course, startDate, endDate);
    },
    enabled: !!actor && !isFetching && !!student && !!course && enabled,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      student,
      bookingId,
      course,
      sessionDate,
      isPresent,
    }: {
      student: Principal;
      bookingId: string;
      course: string;
      sessionDate: bigint;
      isPresent: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(student, bookingId, course, sessionDate, isPresent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary'] });
    },
  });
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export function useGetActiveDiscountCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<ExtendedDiscountCode[]>({
    queryKey: ['activeDiscountCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveDiscountCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDiscountCodeActiveState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, isActive }: { code: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDiscountCodeActiveState(code, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeDiscountCodes'] });
    },
  });
}

export function useValidateDiscountCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string): Promise<{ discountPercent: number; code: string }> => {
      if (!actor) throw new Error('Actor not available');
      const discountPercentBigInt = await actor.validateAndApplyDiscountCode(code);
      return {
        discountPercent: Number(discountPercentBigInt),
        code,
      };
    },
  });
}

// ─── Visitor Tracking ─────────────────────────────────────────────────────────

export function useTrackVisitorActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      eventType,
      courseId,
    }: {
      eventType: EventType;
      courseId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.trackVisitorActivity(eventType, courseId);
    },
  });
}

export function useGetVisitorActivitiesByUser(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VisitorActivity[]>({
    queryKey: ['visitorActivities', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getVisitorActivitiesByUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
