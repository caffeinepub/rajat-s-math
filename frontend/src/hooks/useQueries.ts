import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import {
  BookingRecord,
  CourseMaterial,
  ClassSession,
  UserProfile,
  StudentSupportMessage,
  AttendanceRecord,
  AttendanceSummary,
  CourseRoadmap,
  ModuleStatus,
  EventType,
  DiscountCodeValidationResponse,
  ExtendedDiscountCode,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ─── Admin Check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? null;

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.isCallerAdmin();
        return result;
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 0,
    retry: 2,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? null;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalStr],
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
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString() ?? null;
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalStr] });
    },
  });
}

// ─── Booking Records ──────────────────────────────────────────────────────────

export function useGetBookingRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ['bookingRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookingRecords();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCompletedBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BookingRecord[]>({
    queryKey: ['completedBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedBookings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddBookingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: BookingRecord) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addBookingRecord(record);
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
    mutationFn: async (accessCode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.findBookingByAccessCode(accessCode);
    },
  });
}

// ─── Course Details ───────────────────────────────────────────────────────────

export function useGetCourseDetails() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['courseDetails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCourseDetails();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRecordUPIPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordUPIPaymentSuccessful();
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString() ?? null;
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalStr] });
    },
  });
}

// ─── Course Materials ─────────────────────────────────────────────────────────

export function useGetCourseMaterials(courseName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CourseMaterial[]>({
    queryKey: ['courseMaterials', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourseMaterials(courseName);
    },
    enabled: !!actor && !actorFetching && !!courseName,
  });
}

export function useAddCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: CourseMaterial) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCourseMaterial(material);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials', variables.courseName] });
    },
  });
}

export function useRemoveCourseMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, courseName }: { title: string; courseName: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeCourseMaterial(title);
      return courseName;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseMaterials', variables.courseName] });
    },
  });
}

// ─── Class Sessions ───────────────────────────────────────────────────────────

export function useGetClassSessions(courseName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ClassSession[]>({
    queryKey: ['classSessions', courseName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClassSessions(courseName);
    },
    enabled: !!actor && !actorFetching && !!courseName,
  });
}

export function useAddClassSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: ClassSession) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addClassSession(session);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classSessions', variables.courseName] });
    },
  });
}

export function useRemoveClassSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionTitle, courseName }: { sessionTitle: string; courseName: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeClassSession(sessionTitle);
      return courseName;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classSessions', variables.courseName] });
    },
  });
}

// ─── Support Messages ─────────────────────────────────────────────────────────

export function useGetMySupportMessages(studentPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentSupportMessage[]>({
    queryKey: ['supportMessages', studentPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !studentPrincipal) return [];
      return actor.getSupportMessagesByUser(studentPrincipal);
    },
    enabled: !!actor && !actorFetching && !!studentPrincipal,
  });
}

export function useGetAllSupportMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Principal, StudentSupportMessage[]][]>({
    queryKey: ['allSupportMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSupportMessages();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitSupportMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitSupportMessage(message);
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ['supportMessages', principalStr] });
    },
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
      messageIndex: number;
      reply: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.replyToSupportMessage(studentId, BigInt(messageIndex), reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportMessages'] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

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
      student: string;
      bookingId: string;
      course: string;
      sessionDate: bigint;
      isPresent: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const principalObj = Principal.fromText(student);
      await actor.markAttendance(principalObj, bookingId, course, sessionDate, isPresent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useGetAttendanceRecords(
  student: Principal | null,
  course: string,
  startDate: bigint,
  endDate: bigint,
  enabled: boolean
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', student?.toString(), course, startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor || !student) return [];
      return actor.getAttendanceRecords(student, course, startDate, endDate);
    },
    enabled: !!actor && !actorFetching && !!student && enabled,
  });
}

export function useGetAttendanceSummary(
  student: Principal | null,
  course: string,
  startDate: bigint,
  endDate: bigint,
  enabled: boolean
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AttendanceSummary | null>({
    queryKey: ['attendanceSummary', student?.toString(), course, startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor || !student) return null;
      return actor.getAttendanceSummary(student, course, startDate, endDate);
    },
    enabled: !!actor && !actorFetching && !!student && enabled,
  });
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export function useGetRoadmap(paymentId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CourseRoadmap | null>({
    queryKey: ['roadmap', paymentId],
    queryFn: async () => {
      if (!actor || !paymentId) return null;
      return actor.getRoadmap(paymentId);
    },
    enabled: !!actor && !actorFetching && !!paymentId,
  });
}

export function useGetAllRoadmaps() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, CourseRoadmap][]>({
    queryKey: ['allRoadmaps'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoadmaps();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetRoadmap() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, roadmap }: { paymentId: string; roadmap: CourseRoadmap }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setRoadmap(paymentId, roadmap);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRoadmaps'] });
    },
  });
}

export function useUpdateModuleStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      moduleIndex,
      newStatus,
    }: {
      paymentId: string;
      moduleIndex: number;
      newStatus: ModuleStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateModuleStatus(paymentId, BigInt(moduleIndex), newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRoadmaps'] });
    },
  });
}

// ─── Visitor Activity ─────────────────────────────────────────────────────────

export function useTrackVisitorActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ eventType, courseId }: { eventType: EventType; courseId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.trackVisitorActivity(eventType, courseId ?? null);
    },
  });
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export function useValidateDiscountCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string): Promise<DiscountCodeValidationResponse> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.validateDiscountCode(code);
      return result;
    },
  });
}

export function useGetActiveDiscountCodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExtendedDiscountCode[]>({
    queryKey: ['activeDiscountCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveDiscountCodes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetDiscountCodeActiveState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, isActive }: { code: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setDiscountCodeActiveState(code, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeDiscountCodes'] });
    },
  });
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export function useGetProgressByTopic() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['progressByTopic', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProgressByTopic();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllProblems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allProblems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProblems();
    },
    enabled: !!actor && !actorFetching,
  });
}
