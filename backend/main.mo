import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

// Specify the data migration function in with-clause
(with migration = Migration.run)
actor {
  include MixinStorage();

  // Types
  public type MathProblem = {
    id : Nat;
    question : Text;
    correctAnswer : Int;
    difficulty : Nat; // 1: JEE Main Easy, 2: JEE Main Challenging, 3: JEE Advanced
    topic : Topic;
    solution : Text; // Full step-by-step solution
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
    method : Text; // Only "UPI" for this system
    confirmed : Bool;
  };

  // Razorpay Booking Record
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
  };

  public type BookingStatus = {
    #pending;
    #awaitingPayment;
    #completed;
  };

  // Persistent State
  let problems = Map.empty<Nat, MathProblem>();
  let submissions = Map.empty<Principal, Map.Map<Nat, Submission>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let upiPayments = Map.empty<Principal, UPIPayment>();
  let bookingRecords = List.empty<BookingRecord>();
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

  // Booking Records Functions
  public shared ({ caller }) func addBookingRecord(record : BookingRecord) : async () {
    bookingRecords.add(record);
  };

  public query ({ caller }) func getBookingRecords() : async [BookingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view booking records");
    };
    bookingRecords.toArray();
  };

  public query func getCompletedBookings() : async [BookingRecord] {
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

  // User Profile Management
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

  // Add Math Problem (Admin Only)
  public shared ({ caller }) func addMathProblem(problem : MathProblem) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add problems");
    };
    problems.add(problem.id, problem);
  };

  // Validate Answer and Track Progress (Users Only)
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

  // Get User Submissions (Own submissions or admin can view any)
  public query ({ caller }) func getUserSubmissions(user : Principal) : async [Submission] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own submissions");
    };

    switch (submissions.get(user)) {
      case (null) { [] };
      case (?userSubs) { userSubs.values().toArray() };
    };
  };

  // Get All Problems (Available to all users including guests)
  public query ({ caller }) func getAllProblems() : async [MathProblem] {
    problems.values().toArray();
  };

  // Get Progress Tracking by Topic (Users Only - Own Progress)
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

  // Helper function to calculate stats for a topic
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

  // Paid Course Functionality
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

  // ----- Stripe Integration -----
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

  // ---- UPI Payment Record System ----
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
};
