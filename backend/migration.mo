import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // Old Persistent State
  type OldPersistentState = {
    classSessions : Map.Map<Text, OldClassSession>;
    problems : Map.Map<Nat, Problem>;
    submissions : Map.Map<Principal, Map.Map<Nat, Submission>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    upiPayments : Map.Map<Principal, UPIPayment>;
    courseMaterials : Map.Map<Text, CourseMaterial>;
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

  // Old ClassSession structure
  type OldClassSession = {
    courseName : Text;
    sessionTitle : Text;
    date : Text;
    time : Text;
    googleMeetLink : Text;
    googleCalendarLink : Text;
    createdAt : Time.Time;
  };

  // New Persistent State
  type NewPersistentState = {
    sessions : Map.Map<Text, NewSession>;
    problems : Map.Map<Nat, Problem>;
    submissions : Map.Map<Principal, Map.Map<Nat, Submission>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    upiPayments : Map.Map<Principal, UPIPayment>;
    courseMaterials : Map.Map<Text, CourseMaterial>;
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

  // New Session structure
  type NewSession = {
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

  // Additional type definitions required for persistent fields
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

  public type Problem = {
    id : Nat;
    question : Text;
    correctAnswer : Int;
    difficulty : Nat;
    topic : Topic;
    solution : Text;
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

  public func run(old : OldPersistentState) : NewPersistentState {
    let newSessions = old.classSessions.map<Text, OldClassSession, NewSession>(
      func(_sessionTitle, oldSession) {
        { oldSession with meetingPlatform = null; meetingLink = null };
      }
    );
    {
      old with
      sessions = newSessions;
    };
  };
};
