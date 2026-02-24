import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldMathProblem = {
    id : Nat;
    question : Text;
    correctAnswer : Int;
    difficulty : Nat;
    topic : {
      #calculus;
      #algebra;
      #coordinateGeometry;
      #trigonometry;
      #vectors;
      #probability;
    };
    solution : Text;
  };

  type OldSubmission = {
    user : Principal;
    problemId : Nat;
    answer : Int;
    timestamp : Time.Time;
    isCorrect : Bool;
    attempts : Nat;
  };

  type OldUserProfile = {
    name : Text;
    hasPurchasedCourse : Bool;
  };

  type OldBookingRecord = {
    name : Text;
    phone : Text;
    service : Text;
    date : Text;
    time : Text;
    paymentId : Text;
    paymentStatus : Text;
  };

  type OldActor = {
    problems : Map.Map<Nat, OldMathProblem>;
    submissions : Map.Map<Principal, Map.Map<Nat, OldSubmission>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    bookingRecords : List.List<OldBookingRecord>;
  };

  type NewBookingRecord = {
    name : Text;
    phone : Text;
    service : Text;
    date : Text;
    time : Text;
    paymentId : Text;
    paymentStatus : Text;
    status : { #pending; #awaitingPayment; #completed };
    paymentConfirmedAt : ?Time.Time;
  };

  type NewActor = {
    problems : Map.Map<Nat, OldMathProblem>;
    submissions : Map.Map<Principal, Map.Map<Nat, OldSubmission>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    bookingRecords : List.List<NewBookingRecord>;
  };

  public func run(old : OldActor) : NewActor {
    let newBookingRecords = old.bookingRecords.map<OldBookingRecord, NewBookingRecord>(
      func(oldRecord) {
        {
          oldRecord with
          status = #pending : { #pending; #awaitingPayment; #completed };
          paymentConfirmedAt = null;
        };
      }
    );
    { old with bookingRecords = newBookingRecords };
  };
};
