import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Char "mo:core/Char";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";


actor {
  include MixinStorage();

  // Types
  public type MathProblem = {
    id : Nat;
    question : Text;
    correctAnswer : Int;
    difficulty : Nat;
    topic : Topic;
    solution : Text;
  };

  public type ValidationResult = {
    isCorrect : Bool;
    feedback : Text;
    correctAnswer : Int;
  };

  public type Submission = {
    user : Principal;
    problemId : Nat;
    answer : Int;
    timestamp : Time.Time;
    isCorrect : Bool;
    attempts : Nat;
  };

  public type UserProfile = {
    name : Text;
    hasPurchasedCourse : Bool;
  };

  public type Topic = {
    #calculus;
    #algebra;
    #coordinateGeometry;
    #trigonometry;
    #vectors;
    #probability;
  };

  public type ProgressStats = {
    topic : Topic;
    attempted : Nat;
    correct : Nat;
    accuracy : Float;
  };

  public type Course = {
    title : Text;
    description : Text;
    priceRupees : Nat;
    isPaid : Bool;
  };

  public type UPIPayment = {
    user : Principal;
    timestamp : Time.Time;
    method : Text;
    confirmed : Bool;
  };

  public type BookingRecord = {
    name : Text;
    phone : Text;
    service : Text;
    date : Text;
    time : Text;
    paymentId : Text;
    paymentStatus : Text;
    status : BookingStatus;
    paymentConfirmedAt : ?Time.Time;
    classType : ClassType;
    numberOfClasses : Nat;
    discountApplied : Float;
    finalAmount : Nat;
    accessCode : ?Text;
  };

  public type ClassType = {
    #oneOnOne;
    #group;
  };

  public type BookingStatus = {
    #pending;
    #awaitingPayment;
    #completed;
  };

  public type CourseMaterialType = {
    #pdf;
    #video;
    #note;
    #link;
  };

  public type CourseMaterial = {
    courseName : Text;
    title : Text;
    materialType : CourseMaterialType;
    url : Text;
    createdAt : Time.Time;
  };

  public type MeetingPlatform = {
    #googleMeet;
    #zohoMeet;
    #zoom;
  };

  public type CourseSession = {
    courseName : Text;
    sessionTitle : Text;
    date : Text;
    time : Text;
    googleMeetLink : Text;
    googleCalendarLink : Text;
    createdAt : Time.Time;
    meetingPlatform : ?MeetingPlatform;
    meetingLink : ?Text;
  };

  public type StudentSupportMessage = {
    studentId : Principal;
    timestamp : Time.Time;
    message : Text;
    reply : ?Text;
    repliedAt : ?Time.Time;
  };

  public type RoadmapModule = {
    title : Text;
    description : Text;
    status : ModuleStatus;
    milestone : ?Text;
    dueDate : ?Time.Time;
  };

  public type ModuleStatus = {
    #notStarted;
    #inProgress;
    #completed;
  };

  public type CourseRoadmap = {
    modules : [RoadmapModule];
  };

  public type AttendanceRecord = {
    student : Principal;
    bookingId : Text;
    course : Text;
    sessionDate : Time.Time;
    isPresent : Bool;
    markedAt : Time.Time;
  };

  public type AttendanceSummary = {
    student : Principal;
    course : Text;
    totalSessions : Nat;
    attendedSessions : Nat;
  };

  public type VisitorActivity = {
    principal : Principal;
    timestamp : Time.Time;
    eventType : EventType;
    courseId : ?Text;
  };

  public type EventType = {
    #login;
    #courseView;
  };

  public type ExtendedDiscountCode = {
    code : Text;
    discountPercent : Nat;
    isActive : Bool;
    isUsed : Bool;
    usedBy : ?Principal;
    createdAt : Time.Time;
  };

  public type AccessCode = {
    code : Text;
    assignedPrincipal : ?Principal;
    phone : Text;
    isUsed : Bool;
    createdAt : Time.Time;
  };

  public type Visitor = {
    principal : Principal;
    name : Text;
    lastLogin : Time.Time;
    viewedCourses : [Text];
  };

  // New response type for discount code validation
  public type DiscountCodeValidationResponse = {
    isValid : Bool;
    discountPercent : Nat;
    isActive : Bool;
    isUsed : Bool;
  };

  public type PaymentEnquiry = {
    id : Nat;
    studentName : Text;
    contactNumber : Text;
    feeType : Text;
    amount : Nat;
    durationStart : Text;
    durationEnd : Text;
    submissionTimestamp : Time.Time;
    paymentReferenceId : Text;
  };

  // New Student Enquiry type to support planned features
  public type StudentEnquiry = {
    id : Text;
    name : Text;
    contactInfo : Text;
    courseInterest : Text;
    message : Text;
    status : EnquiryStatus;
    submittedAt : Int;
    qrToken : ?Text;
  };

  public type EnquiryStatus = {
    #pending;
    #confirmed;
    #rejected;
  };

  // New Types for Student Sessions and Materials
  public type StudentSession = {
    studentPrincipal : Principal;
    date : Text;
    time : Text;
    topic : Text;
    duration : Nat;
  };

  public type StudentMaterialType = {
    #link;
    #text;
    #file;
  };

  public type StudentMaterial = {
    studentPrincipal : Principal;
    materialType : StudentMaterialType;
    title : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type PersistentState = {
    problems : Map.Map<Nat, MathProblem>;
    submissions : Map.Map<Principal, Map.Map<Nat, Submission>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    upiPayments : Map.Map<Principal, UPIPayment>;
    courseMaterials : Map.Map<Text, CourseMaterial>;
    sessions : Map.Map<Text, CourseSession>;
    bookingRecords : List.List<BookingRecord>;
    supportMessages : Map.Map<Principal, List.List<StudentSupportMessage>>;
    discountCodes : Map.Map<Text, ExtendedDiscountCode>;
    accessCodes : Map.Map<Text, AccessCode>;
    visitors : Map.Map<Principal, Visitor>;
    roadmaps : Map.Map<Text, CourseRoadmap>;
    course : Course;
    attendance : List.List<AttendanceRecord>;
    visitorActivities : List.List<VisitorActivity>;
    paymentEnquiries : List.List<PaymentEnquiry>;
    studentEnquiries : List.List<StudentEnquiry>;
    studentSessions : Map.Map<Principal, List.List<StudentSession>>;
    studentMaterials : Map.Map<Principal, List.List<StudentMaterial>>;
  };

  // Persistent Storage
  let paymentEnquiries = List.empty<PaymentEnquiry>();
  let studentEnquiries = List.empty<StudentEnquiry>();
  let problems = Map.empty<Nat, MathProblem>();
  let submissions = Map.empty<Principal, Map.Map<Nat, Submission>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let upiPayments = Map.empty<Principal, UPIPayment>();
  let courseMaterials = Map.empty<Text, CourseMaterial>();
  let sessions = Map.empty<Text, CourseSession>();
  let bookingRecords = List.empty<BookingRecord>();
  let supportMessages = Map.empty<Principal, List.List<StudentSupportMessage>>();
  let discountCodes = Map.empty<Text, ExtendedDiscountCode>();
  let accessCodes = Map.empty<Text, AccessCode>();
  let visitors = Map.empty<Principal, Visitor>();
  let roadmaps = Map.empty<Text, CourseRoadmap>();
  let attendance = List.empty<AttendanceRecord>();
  let visitorActivities = List.empty<VisitorActivity>();

  // New Maps for Student Sessions and Materials
  let studentSessions = Map.empty<Principal, List.List<StudentSession>>();
  let studentMaterials = Map.empty<Principal, List.List<StudentMaterial>>();

  let course = {
    title = "Comprehensive Mathematics Program";
    description = "A complete mathematics course designed for all learners, emphasizing mathematical thinking and problem-solving skills for academic, professional, and daily life success.";
    priceRupees = 2499;
    isPaid = true;
  };

  // Authorization System
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe State
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Video Call Link Management Functions
  public shared ({ caller }) func addOrUpdateMeetingLink(sessionTitle : Text, platform : MeetingPlatform, meetingLink : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add/update meeting links");
    };

    switch (sessions.get(sessionTitle)) {
      case (null) { Runtime.trap("Session not found") };
      case (?existing) {
        let updatedSession = {
          existing with
          meetingPlatform = ?platform;
          meetingLink = ?meetingLink;
        };
        sessions.add(sessionTitle, updatedSession);
      };
    };
  };

  public shared ({ caller }) func removeMeetingLink(sessionTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove meeting links");
    };

    switch (sessions.get(sessionTitle)) {
      case (null) { Runtime.trap("Session not found") };
      case (?existing) {
        let updatedSession = {
          existing with
          meetingPlatform = null;
          meetingLink = null;
        };
        sessions.add(sessionTitle, updatedSession);
      };
    };
  };

  // Stripe Integration Functions
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
