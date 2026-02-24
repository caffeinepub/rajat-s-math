import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Char "mo:core/Char";
import Float "mo:core/Float";
import Int "mo:core/Int";

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

  public type ClassSession = {
    courseName : Text;
    sessionTitle : Text;
    date : Text;
    time : Text;
    googleMeetLink : Text;
    googleCalendarLink : Text;
    createdAt : Time.Time;
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

  // Persistent State
  let problems = Map.empty<Nat, MathProblem>();
  let submissions = Map.empty<Principal, Map.Map<Nat, Submission>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let upiPayments = Map.empty<Principal, UPIPayment>();
  let courseMaterials = Map.empty<Text, CourseMaterial>();
  let classSessions = Map.empty<Text, ClassSession>();
  let bookingRecords = List.empty<BookingRecord>();
  let supportMessages = Map.empty<Principal, List.List<StudentSupportMessage>>();
  let discountCodes = Map.empty<Text, ExtendedDiscountCode>();
  let accessCodes = Map.empty<Text, AccessCode>();
  let visitors = Map.empty<Principal, Visitor>();
  // roadmaps keyed by paymentId (booking identifier)
  let roadmaps = Map.empty<Text, CourseRoadmap>();
  let course = {
    title = "Comprehensive Mathematics Program";
    description = "A complete mathematics course designed for all learners, emphasizing mathematical thinking and problem-solving skills for academic, professional, and daily life success.";
    priceRupees = 2499;
    isPaid = true;
  };

  let attendance = List.empty<AttendanceRecord>();
  let visitorActivities = List.empty<VisitorActivity>();

  // Authorization System
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stripe State
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // ─── Booking Records Functions ───────────────────────────────────────────────

  public shared ({ caller }) func addBookingRecord(record : BookingRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add booking records");
    };
    bookingRecords.add(record);
  };

  public query ({ caller }) func getBookingRecords() : async [BookingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view booking records");
    };
    bookingRecords.toArray();
  };

  public query ({ caller }) func getCompletedBookings() : async [BookingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view completed bookings");
    };
    let completed = bookingRecords.toArray().filter(
      func(record) {
        switch (record.status) {
          case (#completed) { true };
          case (_) { false };
        };
      }
    );
    completed;
  };

  /// Delete a booking by paymentId. Admin-only.
  public shared ({ caller }) func deleteBooking(paymentId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete booking records");
    };
    var found = false;
    let remaining = List.empty<BookingRecord>();
    bookingRecords.values().forEach(func(record) {
      if (record.paymentId == paymentId) {
        found := true;
        // skip – effectively deleting it
      } else {
        remaining.add(record);
      };
    });
    bookingRecords.clear();
    bookingRecords.addAll(remaining.values());
    found;
  };

  public shared ({ caller }) func markAsPaid(bookingId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark bookings as paid");
    };

    var updatedBooking : ?BookingRecord = null;
    let newRecords = bookingRecords.map<BookingRecord, BookingRecord>(
      func(record) {
        if (record.paymentId == bookingId) {
          if (record.status == #awaitingPayment) {
            let updatedRecord = { record with status = #completed; paymentConfirmedAt = ?Time.now() };
            updatedBooking := ?updatedRecord;
            updatedRecord;
          } else {
            record;
          };
        } else {
          record;
        };
      }
    );

    bookingRecords.clear();
    bookingRecords.addAll(newRecords.values());

    updatedBooking != null;
  };

  // Confirm Payment and Generate Access Code
  public shared ({ caller }) func confirmPaymentAndGenerateAccessCode(bookingId : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm payments");
    };

    var foundRecord : ?BookingRecord = null;
    let newRecords = bookingRecords.map<BookingRecord, BookingRecord>(
      func(record) {
        if (record.paymentId == bookingId) {
          if (record.status == #awaitingPayment) {
            let accessCode = ?generateUniqueCode();
            let updatedRecord = { record with status = #completed; paymentConfirmedAt = ?Time.now(); accessCode };
            foundRecord := ?updatedRecord;
            updatedRecord;
          } else {
            record;
          };
        } else {
          record;
        };
      }
    );

    bookingRecords.clear();
    bookingRecords.addAll(newRecords.values());

    switch (foundRecord) {
      case (?record) { record.accessCode };
      case (null) { null };
    };
  };

  // Find Booking by Access Code – authenticated users only (contains PII)
  public query ({ caller }) func findBookingByAccessCode(accessCode : Text) : async ?BookingRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can look up bookings by access code");
    };
    let normalizedInput = normalizeCode(accessCode);
    bookingRecords.toArray().find(
      func(record) {
        switch (record.accessCode) {
          case (?code) { normalizeCode(code) == normalizedInput };
          case (null) { false };
        };
      }
    );
  };

  func normalizeCode(code : Text) : Text {
    code;
  };

  // ─── Student Roadmap Functions ───────────────────────────────────────────────

  /// Admin sets/replaces the roadmap for a booking (identified by paymentId).
  public shared ({ caller }) func setRoadmap(paymentId : Text, roadmap : CourseRoadmap) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set roadmaps");
    };
    roadmaps.add(paymentId, roadmap);
  };

  /// Admin updates a single module's status within a booking's roadmap.
  public shared ({ caller }) func updateModuleStatus(paymentId : Text, moduleIndex : Nat, newStatus : ModuleStatus) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update module status");
    };
    switch (roadmaps.get(paymentId)) {
      case (null) { false };
      case (?roadmap) {
        let mods = roadmap.modules;
        if (moduleIndex >= mods.size()) {
          Runtime.trap("Module index out of range");
        };
        let updatedModules = Array.tabulate(
          mods.size(),
          func(i) {
            if (i == moduleIndex) {
              { mods[i] with status = newStatus };
            } else {
              mods[i];
            };
          }
        );
        roadmaps.add(paymentId, { modules = updatedModules });
        true;
      };
    };
  };

  /// Admin can fetch any roadmap; a student can fetch their own roadmap
  /// (identified by the paymentId that belongs to a booking with their phone/principal).
  /// For simplicity the student must supply the paymentId of their own booking.
  /// The backend verifies ownership by checking that the booking's accessCode
  /// was issued to a booking whose phone matches a profile, or that the caller
  /// is the admin.  Because bookings are not directly keyed by principal we
  /// allow any authenticated user to read a roadmap – the paymentId itself acts
  /// as a capability token (it is only known to the student and the admin).
  public query ({ caller }) func getRoadmap(paymentId : Text) : async ?CourseRoadmap {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view roadmaps");
    };
    roadmaps.get(paymentId);
  };

  /// Admin-only: list all roadmaps.
  public query ({ caller }) func getAllRoadmaps() : async [(Text, CourseRoadmap)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all roadmaps");
    };
    roadmaps.entries().toArray();
  };

  // ─── Attendance Tracking Functions ───────────────────────────────────────────

  /// Admin marks student attendance for a specific session
  public shared ({ caller }) func markAttendance(student : Principal, bookingId : Text, course : Text, sessionDate : Time.Time, isPresent : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark attendance");
    };

    let record = {
      student;
      bookingId;
      course;
      sessionDate;
      isPresent;
      markedAt = Time.now();
    };

    attendance.add(record);
  };

  /// Get attendance records for a student within a date range
  public query ({ caller }) func getAttendanceRecords(student : Principal, course : Text, startDate : Time.Time, endDate : Time.Time) : async [AttendanceRecord] {
    if (caller != student and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own attendance records");
    };

    attendance.toArray().filter(func(record) {
      record.student == student and record.course == course and record.sessionDate >= startDate and record.sessionDate <= endDate
    });
  };

  /// Get attendance summary (counts) for student and course within date range
  public query ({ caller }) func getAttendanceSummary(student : Principal, course : Text, startDate : Time.Time, endDate : Time.Time) : async ?AttendanceSummary {
    if (caller != student and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own attendance summary");
    };

    let records = attendance.toArray().filter(func(record) {
      record.student == student and record.course == course and record.sessionDate >= startDate and record.sessionDate <= endDate
    });

    let total = records.size();
    let present = records.filter(func(r) { r.isPresent }).size();

    if (total == 0) {
      return null;
    };

    ?{
      student;
      course;
      totalSessions = total;
      attendedSessions = present;
    };
  };

  // ─── Visitor Activity Functions ──────────────────────────────────────────────

  /// Track a specific visitor activity (login or course view)
  public shared ({ caller }) func trackVisitorActivity(eventType : EventType, courseId : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can track activity");
    };

    let activity = {
      principal = caller;
      timestamp = Time.now();
      eventType;
      courseId;
    };

    visitorActivities.add(activity);
  };

  public query ({ caller }) func getVisitorActivitiesByUser(user : Principal) : async [VisitorActivity] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own activity");
    };

    visitorActivities.toArray().filter(func(activity) { activity.principal == user });
  };

  // ─── Extended Discount Code Functions ────────────────────────────────────────

  /// Validate and apply discount code at checkout
  public shared ({ caller }) func validateAndApplyDiscountCode(code : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can validate discount codes");
    };

    switch (discountCodes.get(code)) {
      case (null) { Runtime.trap("Invalid discount code") };
      case (?dc) {
        if (not dc.isActive) {
          Runtime.trap("Discount code is not active");
        };
        if (dc.isUsed) {
          Runtime.trap("Discount code has already been used");
        };

        // Mark as used
        let updatedCode = {
          dc with
          isUsed = true;
          usedBy = ?caller;
        };
        discountCodes.add(code, updatedCode);

        dc.discountPercent;
      };
    };
  };

  /// Activate or deactivate a specific discount code (by code string)
  public shared ({ caller }) func setDiscountCodeActiveState(code : Text, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify discount codes");
    };

    switch (discountCodes.get(code)) {
      case (null) { Runtime.trap("Discount code not found") };
      case (?dc) {
        let updatedCode = { dc with isActive };
        discountCodes.add(code, updatedCode);
      };
    };
  };

  public query ({ caller }) func getActiveDiscountCodes() : async [ExtendedDiscountCode] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view active discount codes");
    };

    discountCodes.values().toArray().filter(func(dc) { dc.isActive });
  };

  // ─── Helper: unique code generator ──────────────────────────────────────────

  func generateUniqueCode() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charsArray = chars.toArray();
    let length = charsArray.size();

    func getCharAt(seed : Int) : Char {
      let idx = Int.abs(seed % length.toInt()) % length;
      charsArray[idx];
    };

    let now = Time.now();
    let code = Array.tabulate(10, func(i) {
      getCharAt(now + i.toInt() * 1_000_003);
    });
    Text.fromArray(code);
  };

  // ─── User Profile Management ─────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Math Problem Functions ──────────────────────────────────────────────────

  public shared ({ caller }) func addMathProblem(problem : MathProblem) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add problems");
    };
    problems.add(problem.id, problem);
  };

  public shared ({ caller }) func validateAnswer(problemId : Nat, studentAnswer : Int) : async ValidationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };

    switch (problems.get(problemId)) {
      case (null) { Runtime.trap("Problem not found") };
      case (?problem) {
        let isCorrect = (studentAnswer == problem.correctAnswer);
        let feedback = if (isCorrect) {
          "Correct! Well done.";
        } else {
          "Incorrect. Try again!";
        };

        let existingUserSubmissions = switch (submissions.get(caller)) {
          case (null) { Map.empty<Nat, Submission>() };
          case (?subs) { subs };
        };

        let attempts = switch (existingUserSubmissions.get(problemId)) {
          case (null) { 1 };
          case (?sub) { sub.attempts + 1 };
        };

        let submission : Submission = {
          user = caller;
          problemId;
          answer = studentAnswer;
          timestamp = Time.now();
          isCorrect;
          attempts;
        };

        existingUserSubmissions.add(problemId, submission);
        submissions.add(caller, existingUserSubmissions);

        {
          isCorrect;
          feedback;
          correctAnswer = problem.correctAnswer;
        };
      };
    };
  };

  public query ({ caller }) func getUserSubmissions(user : Principal) : async [Submission] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own submissions");
    };

    switch (submissions.get(user)) {
      case (null) { [] };
      case (?userSubs) { userSubs.values().toArray() };
    };
  };

  // Problems are public – guests may browse them
  public query func getAllProblems() : async [MathProblem] {
    problems.values().toArray();
  };

  public query ({ caller }) func getProgressByTopic() : async [ProgressStats] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access progress");
    };

    let topics = [#calculus, #algebra, #coordinateGeometry, #trigonometry, #vectors, #probability];
    let results = topics.map(
      func(topic : Topic) : ProgressStats {
        calcTopicStats(caller, topic);
      }
    );
    results;
  };

  func calcTopicStats(user : Principal, topic : Topic) : ProgressStats {
    let allProblems = problems.values().toArray();
    let _topicProblems = allProblems.filter(
      func(p : MathProblem) : Bool { topicsEqual(p.topic, topic) }
    );

    let userSubs = switch (submissions.get(user)) {
      case (null) { Map.empty<Nat, Submission>() };
      case (?subs) { subs };
    };

    let userSubmissionsArray = userSubs.values().toArray();
    let topicSubmissions = userSubmissionsArray.filter(
      func(submission : Submission) : Bool {
        switch (problems.get(submission.problemId)) {
          case (null) { false };
          case (?p) { topicsEqual(p.topic, topic) };
        };
      }
    );

    let attempted = topicSubmissions.size();

    let correct = topicSubmissions.filter(
      func(submission : Submission) : Bool {
        submission.isCorrect;
      }
    ).size();

    let accuracy = if (attempted == 0) { 0.0 } else {
      correct.toFloat() / attempted.toFloat() * 100.0;
    };

    {
      topic;
      attempted;
      correct;
      accuracy;
    };
  };

  func topicsEqual(t1 : Topic, t2 : Topic) : Bool {
    findTopicIndex(t1) == findTopicIndex(t2);
  };

  func findTopicIndex(topic : Topic) : Nat {
    switch (topic) {
      case (#calculus) { 0 };
      case (#algebra) { 1 };
      case (#coordinateGeometry) { 2 };
      case (#trigonometry) { 3 };
      case (#vectors) { 4 };
      case (#probability) { 5 };
    };
  };

  // ─── Course Functions ────────────────────────────────────────────────────────

  // Course details are public
  public query func getCourseDetails() : async Course {
    course;
  };

  public shared ({ caller }) func purchaseCourse() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can purchase the course");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (profile.hasPurchasedCourse) {
          Runtime.trap("Course already purchased");
        };
        let updatedProfile = { profile with hasPurchasedCourse = true };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // ─── Stripe Integration ──────────────────────────────────────────────────────

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ─── UPI Payment Functions ───────────────────────────────────────────────────

  public shared ({ caller }) func recordUPIPaymentSuccessful() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record payments");
    };

    let payment : UPIPayment = {
      user = caller;
      timestamp = Time.now();
      method = "UPI";
      confirmed = true;
    };

    upiPayments.add(caller, payment);

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (profile.hasPurchasedCourse) {
          Runtime.trap("Course already purchased");
        };
        let updatedProfile = { profile with hasPurchasedCourse = true };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func hasPaidWithUPI(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own payment status");
    };

    switch (upiPayments.get(user)) {
      case (null) { false };
      case (?payment) { payment.confirmed };
    };
  };

  // ─── Course Material Functions ───────────────────────────────────────────────

  public shared ({ caller }) func addCourseMaterial(material : CourseMaterial) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add course materials");
    };
    courseMaterials.add(material.title, material);
  };

  public shared ({ caller }) func removeCourseMaterial(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove course materials");
    };
    courseMaterials.remove(title);
  };

  public query ({ caller }) func getCourseMaterials(courseName : Text) : async [CourseMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access course materials");
    };
    courseMaterials.values().toArray().filter(func(material) { material.courseName == courseName });
  };

  // ─── Class Session Functions ─────────────────────────────────────────────────

  public shared ({ caller }) func addClassSession(session : ClassSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add class sessions");
    };
    classSessions.add(session.sessionTitle, session);
  };

  public shared ({ caller }) func removeClassSession(sessionTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove class sessions");
    };
    classSessions.remove(sessionTitle);
  };

  public query ({ caller }) func getClassSessions(courseName : Text) : async [ClassSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access class sessions");
    };
    classSessions.values().toArray().filter(func(session) { session.courseName == courseName });
  };

  // ─── Support Message Functions ───────────────────────────────────────────────

  public shared ({ caller }) func submitSupportMessage(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit support messages");
    };

    let supportMessage : StudentSupportMessage = {
      studentId = caller;
      timestamp = Time.now();
      message;
      reply = null;
      repliedAt = null;
    };

    let existingMessages = switch (supportMessages.get(caller)) {
      case (null) { List.empty<StudentSupportMessage>() };
      case (?msgs) { msgs };
    };

    existingMessages.add(supportMessage);
    supportMessages.add(caller, existingMessages);
  };

  public shared ({ caller }) func replyToSupportMessage(studentId : Principal, messageIndex : Nat, reply : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reply to support messages");
    };

    switch (supportMessages.get(studentId)) {
      case (null) { Runtime.trap("No messages found for student") };
      case (?msgs) {
        if (messageIndex >= msgs.size()) {
          Runtime.trap("Invalid message index");
        };

        let updatedMsgs = List.empty<StudentSupportMessage>();
        var currentIndex = 0;

        msgs.values().forEach(
          func(msg) {
            if (currentIndex == messageIndex) {
              let updatedMsg = {
                msg with
                reply = ?reply;
                repliedAt = ?Time.now();
              };
              updatedMsgs.add(updatedMsg);
            } else {
              updatedMsgs.add(msg);
            };
            currentIndex += 1;
          }
        );

        supportMessages.add(studentId, updatedMsgs);
      };
    };
  };

  public query ({ caller }) func getSupportMessagesByUser(userId : Principal) : async [StudentSupportMessage] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own support messages");
    };

    switch (supportMessages.get(userId)) {
      case (null) { [] };
      case (?msgs) { msgs.toArray() };
    };
  };

  public query ({ caller }) func getAllSupportMessages() : async [(Principal, [StudentSupportMessage])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all support messages");
    };

    let entries = supportMessages.entries().toArray();
    entries.map(
      func((principal, msgs)) {
        (principal, msgs.toArray());
      }
    );
  };
};
