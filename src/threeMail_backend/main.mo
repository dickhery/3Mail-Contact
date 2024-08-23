import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor class Mailbox() = this {
  type Message = {
    sender: Principal;
    emailOr3Mail: Text;
    name: Text;
    subject: Text;
    message: Text;
    timestamp: Time.Time;
    viewed: Bool;
  };

  stable var messages: [Message] = [];
  stable var totalMessagesSent: Nat = 0;
  stable var unviewedMessagesCount: Nat = 0;
  stable let adminPrincipal: Principal = Principal.fromText("ll6cr-j7kqj-66ycg-nnsh6-hkcag-jswkl-5mgfm-rxn3u-ekxfi-twed7-4qe");

  public shared(msg) func submitMessage(emailOr3Mail: Text, name: Text, subject: Text, message: Text) : async Text {
    let timestamp = Time.now();
    let newMessage = {
      sender = msg.caller;
      emailOr3Mail = emailOr3Mail;
      name = name;
      subject = subject;
      message = message;
      timestamp = timestamp;
      viewed = false;
    };
    
    Debug.print("Before appending: " # Nat.toText(Array.size(messages) : Nat) # " messages in the array.");
    
    messages := Array.append<Message>(messages, [newMessage]);
    
    Debug.print("After appending: " # Nat.toText(Array.size(messages) : Nat) # " messages in the array.");
    
    totalMessagesSent += 1;
    unviewedMessagesCount += 1;
    
    return "Message submitted successfully.";
  };

  public query func getTotalMessages() : async Nat {
    Debug.print("Returning total messages: " # Nat.toText(Array.size(messages) : Nat));
    return Array.size(messages);
  };

  public query func getTotalMessagesSent() : async Nat {
    Debug.print("Total messages sent: " # Nat.toText(totalMessagesSent));
    return totalMessagesSent;
  };

  public query func getUnviewedMessagesCount() : async Nat {
    Debug.print("Unviewed messages count: " # Nat.toText(unviewedMessagesCount));
    return unviewedMessagesCount;
  };

  public shared(msg) func getMyMessages() : async [Message] {
    let caller = msg.caller;
    if (caller == adminPrincipal) {
        Debug.print("Admin is fetching all messages.");
        return sortMessagesByTimestamp(messages);
    } else {
        Debug.print("Unauthorized caller: " # Principal.toText(caller));
        return [];
    }
  };

  public shared(msg) func getUnviewedMessages() : async [Message] {
    let caller = msg.caller;
    if (caller == adminPrincipal) {
      let unviewedMessages = Array.filter<Message>(messages, func (m) : Bool {
        not m.viewed;
      });
      Debug.print("Returning " # Nat.toText(Array.size(unviewedMessages) : Nat) # " unviewed messages.");
      return sortMessagesByTimestamp(unviewedMessages);
    } else {
      Debug.print("Unauthorized caller: " # Principal.toText(caller));
      return [];
    }
  };

  public shared(msg) func markAsViewed(subject: Text) : async Text {
    let caller = msg.caller;
    if (caller == adminPrincipal) {
      var found = false;
      messages := Array.map<Message, Message>(messages, func (m) : Message {
        if (m.subject == subject and not m.viewed) {
          found := true;
          unviewedMessagesCount -= 1;
          {m with viewed = true};
        } else {
          m;
        }
      });
      if (found) {
        return "Message marked as viewed.";
      } else {
        return "Message not found.";
      }
    } else {
      return "Unauthorized access.";
    }
  };

  public shared(msg) func deleteMessage(subject: Text) : async Text {
    let caller = msg.caller;
    if (caller == adminPrincipal) {
      let initialLength = Array.size<Message>(messages);
      messages := Array.filter<Message>(messages, func (m) : Bool {
        not (m.subject == subject)
      });
      if (Array.size<Message>(messages) < initialLength) {
        return "Message deleted successfully.";
      } else {
        return "Message not found.";
      }
    } else {
      return "Unauthorized access.";
    }
  };

  public shared(msg) func deleteAllMessages() : async Text {
    let caller = msg.caller;
    if (caller == adminPrincipal) {
      messages := [];
      unviewedMessagesCount := 0;  // Reset unviewed messages count
      return "All messages deleted successfully, counters updated except for totalMessagesSent.";
    } else {
      return "Unauthorized access.";
    }
  };

  public shared(msg) func resetCounters() : async Text {
    if (msg.caller == adminPrincipal) {
      unviewedMessagesCount := 0;  // Reset unviewed messages count
      return "Counters reset successfully, except for totalMessagesSent.";
    } else {
      return "Unauthorized access.";
    }
  };

  func compareTimestamps(a: Time.Time, b: Time.Time) : { #less; #equal; #greater } {
    if (a < b) {
      return #greater;
    } else if (a > b) {
      return #less;
    } else {
      return #equal;
    }
  };

  func sortMessagesByTimestamp(messages: [Message]) : [Message] {
    return Array.sort<Message>(messages, func (a, b) : { #less; #equal; #greater } {
      compareTimestamps(a.timestamp, b.timestamp)
    });
  };
};
