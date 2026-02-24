import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type NewActor = {
    discountCodes : Map.Map<Text, ExtendedDiscountCode>;
    attendance : List.List<AttendanceRecord>;
    visitorActivities : List.List<VisitorActivity>;
  };

  type OldActor = {
    discountCodes : Map.Map<Text, DiscountCode>;
  };

  type DiscountCode = {
    code : Text;
    discountPercent : Nat;
    isUsed : Bool;
    usedBy : ?Principal;
    createdAt : Time.Time;
  };

  type ExtendedDiscountCode = {
    code : Text;
    discountPercent : Nat;
    isActive : Bool;
    isUsed : Bool;
    usedBy : ?Principal;
    createdAt : Time.Time;
  };

  type AttendanceRecord = {
    student : Principal;
    bookingId : Text;
    course : Text;
    sessionDate : Time.Time;
    isPresent : Bool;
    markedAt : Time.Time;
  };

  type VisitorActivity = {
    principal : Principal;
    timestamp : Time.Time;
    eventType : EventType;
    courseId : ?Text;
  };

  type EventType = {
    #login;
    #courseView;
  };

  func discountCodeToExtended(dc : DiscountCode) : ExtendedDiscountCode {
    {
      dc with
      isActive = true;
    };
  };

  public func run(old : OldActor) : NewActor {
    {
      discountCodes = old.discountCodes.map<Text, DiscountCode, ExtendedDiscountCode>(
        func(_, dc) {
          discountCodeToExtended(dc);
        }
      );
      attendance = List.empty<AttendanceRecord>();
      visitorActivities = List.empty<VisitorActivity>();
    };
  };
};
