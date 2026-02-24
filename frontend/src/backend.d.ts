import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface CourseRoadmap {
    modules: Array<RoadmapModule>;
}
export interface VisitorActivity {
    principal: Principal;
    timestamp: Time;
    courseId?: string;
    eventType: EventType;
}
export interface ProgressStats {
    topic: Topic;
    attempted: bigint;
    correct: bigint;
    accuracy: number;
}
export interface MathProblem {
    id: bigint;
    topic: Topic;
    question: string;
    difficulty: bigint;
    correctAnswer: bigint;
    solution: string;
}
export interface Course {
    title: string;
    description: string;
    isPaid: boolean;
    priceRupees: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Submission {
    user: Principal;
    attempts: bigint;
    isCorrect: boolean;
    answer: bigint;
    problemId: bigint;
    timestamp: Time;
}
export interface AttendanceRecord {
    bookingId: string;
    sessionDate: Time;
    isPresent: boolean;
    markedAt: Time;
    student: Principal;
    course: string;
}
export interface RoadmapModule {
    status: ModuleStatus;
    title: string;
    dueDate?: Time;
    description: string;
    milestone?: string;
}
export interface CourseMaterial {
    url: string;
    title: string;
    createdAt: Time;
    courseName: string;
    materialType: CourseMaterialType;
}
export interface AttendanceSummary {
    student: Principal;
    totalSessions: bigint;
    course: string;
    attendedSessions: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ExtendedDiscountCode {
    code: string;
    usedBy?: Principal;
    createdAt: Time;
    discountPercent: bigint;
    isUsed: boolean;
    isActive: boolean;
}
export interface BookingRecord {
    paymentConfirmedAt?: Time;
    service: string;
    status: BookingStatus;
    paymentStatus: string;
    finalAmount: bigint;
    discountApplied: number;
    date: string;
    name: string;
    time: string;
    accessCode?: string;
    numberOfClasses: bigint;
    paymentId: string;
    phone: string;
    classType: ClassType;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ClassSession {
    googleMeetLink: string;
    date: string;
    createdAt: Time;
    time: string;
    sessionTitle: string;
    courseName: string;
    googleCalendarLink: string;
}
export interface ValidationResult {
    correctAnswer: bigint;
    feedback: string;
    isCorrect: boolean;
}
export interface StudentSupportMessage {
    studentId: Principal;
    repliedAt?: Time;
    message: string;
    timestamp: Time;
    reply?: string;
}
export interface UserProfile {
    name: string;
    hasPurchasedCourse: boolean;
}
export enum BookingStatus {
    pending = "pending",
    completed = "completed",
    awaitingPayment = "awaitingPayment"
}
export enum ClassType {
    group = "group",
    oneOnOne = "oneOnOne"
}
export enum CourseMaterialType {
    pdf = "pdf",
    video = "video",
    link = "link",
    note = "note"
}
export enum EventType {
    login = "login",
    courseView = "courseView"
}
export enum ModuleStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress"
}
export enum Topic {
    probability = "probability",
    calculus = "calculus",
    coordinateGeometry = "coordinateGeometry",
    algebra = "algebra",
    vectors = "vectors",
    trigonometry = "trigonometry"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookingRecord(record: BookingRecord): Promise<void>;
    addClassSession(session: ClassSession): Promise<void>;
    addCourseMaterial(material: CourseMaterial): Promise<void>;
    addMathProblem(problem: MathProblem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmPaymentAndGenerateAccessCode(bookingId: string): Promise<string | null>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Delete a booking by paymentId. Admin-only.
     */
    deleteBooking(paymentId: string): Promise<boolean>;
    findBookingByAccessCode(accessCode: string): Promise<BookingRecord | null>;
    getActiveDiscountCodes(): Promise<Array<ExtendedDiscountCode>>;
    getAllProblems(): Promise<Array<MathProblem>>;
    /**
     * / Admin-only: list all roadmaps.
     */
    getAllRoadmaps(): Promise<Array<[string, CourseRoadmap]>>;
    getAllSupportMessages(): Promise<Array<[Principal, Array<StudentSupportMessage>]>>;
    /**
     * / Get attendance records for a student within a date range
     */
    getAttendanceRecords(student: Principal, course: string, startDate: Time, endDate: Time): Promise<Array<AttendanceRecord>>;
    /**
     * / Get attendance summary (counts) for student and course within date range
     */
    getAttendanceSummary(student: Principal, course: string, startDate: Time, endDate: Time): Promise<AttendanceSummary | null>;
    getBookingRecords(): Promise<Array<BookingRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassSessions(courseName: string): Promise<Array<ClassSession>>;
    getCompletedBookings(): Promise<Array<BookingRecord>>;
    getCourseDetails(): Promise<Course>;
    getCourseMaterials(courseName: string): Promise<Array<CourseMaterial>>;
    getProgressByTopic(): Promise<Array<ProgressStats>>;
    /**
     * / Admin can fetch any roadmap; a student can fetch their own roadmap
     * / (identified by the paymentId that belongs to a booking with their phone/principal).
     * / For simplicity the student must supply the paymentId of their own booking.
     * / The backend verifies ownership by checking that the booking's accessCode
     * / was issued to a booking whose phone matches a profile, or that the caller
     * / is the admin.  Because bookings are not directly keyed by principal we
     * / allow any authenticated user to read a roadmap – the paymentId itself acts
     * / as a capability token (it is only known to the student and the admin).
     */
    getRoadmap(paymentId: string): Promise<CourseRoadmap | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSupportMessagesByUser(userId: Principal): Promise<Array<StudentSupportMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSubmissions(user: Principal): Promise<Array<Submission>>;
    getVisitorActivitiesByUser(user: Principal): Promise<Array<VisitorActivity>>;
    hasPaidWithUPI(user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markAsPaid(bookingId: string): Promise<boolean>;
    /**
     * / Admin marks student attendance for a specific session
     */
    markAttendance(student: Principal, bookingId: string, course: string, sessionDate: Time, isPresent: boolean): Promise<void>;
    purchaseCourse(): Promise<void>;
    recordUPIPaymentSuccessful(): Promise<void>;
    removeClassSession(sessionTitle: string): Promise<void>;
    removeCourseMaterial(title: string): Promise<void>;
    replyToSupportMessage(studentId: Principal, messageIndex: bigint, reply: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Activate or deactivate a specific discount code (by code string)
     */
    setDiscountCodeActiveState(code: string, isActive: boolean): Promise<void>;
    /**
     * / Admin sets/replaces the roadmap for a booking (identified by paymentId).
     */
    setRoadmap(paymentId: string, roadmap: CourseRoadmap): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitSupportMessage(message: string): Promise<void>;
    /**
     * / Track a specific visitor activity (login or course view)
     */
    trackVisitorActivity(eventType: EventType, courseId: string | null): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    /**
     * / Admin updates a single module's status within a booking's roadmap.
     */
    updateModuleStatus(paymentId: string, moduleIndex: bigint, newStatus: ModuleStatus): Promise<boolean>;
    /**
     * / Validate and apply discount code at checkout
     */
    validateAndApplyDiscountCode(code: string): Promise<bigint>;
    validateAnswer(problemId: bigint, studentAnswer: bigint): Promise<ValidationResult>;
}
