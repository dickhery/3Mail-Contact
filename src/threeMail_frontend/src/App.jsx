import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as threeMail_backend_idl, canisterId as threeMail_backend_id } from '../../declarations/threeMail_backend';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState('');
  const [messages, setMessages] = useState([]);
  const [emailOr3Mail, setEmailOr3Mail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [response, setResponse] = useState('');
  const [mailboxActor, setMailboxActor] = useState(null);
  const [totalMessagesSent, setTotalMessagesSent] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [unviewedMessagesCount, setUnviewedMessagesCount] = useState(0);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true); // Track whether to show form or thank you message
  const [adImage, setAdImage] = useState('');
  const [adLink, setAdLink] = useState('');

  const adminPID = "se7ki-wgdje-nqi5x-sai35-xe6t6-lsl5h-dhfxp-6hwnt-zpj7n-mutlj-6ae";

  const ads = [
    { src: '/ads/ad1.jpg', link: 'https://jemug-yyaaa-aaaap-ahtfq-cai.icp0.io/' },
    { src: '/ads/ad2.jpg', link: 'https://3jorm-yqaaa-aaaam-aaa6a-cai.ic0.app/index-gaming.html' },
    { src: '/ads/ad3.jpg', link: 'https://3jorm-yqaaa-aaaam-aaa6a-cai.ic0.app/' }
  ];

  useEffect(() => {
    async function initAuth() {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        const agent = new HttpAgent();
        const actor = Actor.createActor(threeMail_backend_idl, {
          agent,
          canisterId: threeMail_backend_id,
        });
        setMailboxActor(actor);

        if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          const loggedInPID = identity.getPrincipal().toText();
          setPrincipal(loggedInPID);

          // Check if the logged-in user is the admin
          if (loggedInPID === adminPID) {
            setIsAuthenticated(true);

            const authAgent = new HttpAgent({ identity });
            const authActor = Actor.createActor(threeMail_backend_idl, {
              agent: authAgent,
              canisterId: threeMail_backend_id,
            });
            setMailboxActor(authActor);

            const totalSent = await authActor.getTotalMessagesSent();
            const total = await authActor.getTotalMessages();
            const unviewedCount = await authActor.getUnviewedMessagesCount();
            setTotalMessagesSent(totalSent.toString());
            setTotalMessages(total.toString());
            setUnviewedMessagesCount(unviewedCount.toString());
          } else {
            setResponse("Unauthorized access: You are not the admin.");
          }
        }
      } catch (error) {
        setError(`Failed to initialize authentication: ${error.message}`);
        console.error('Initialization error:', error);
      }
    }
    initAuth();

    // Select a random ad to display
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAdImage(randomAd.src);
    setAdLink(randomAd.link);
  }, []);

  const handleLogin = async () => {
    try {
      if (authClient) {
        await authClient.login({
          identityProvider: "https://identity.ic0.app",
          onSuccess: async () => {
            try {
              const identity = authClient.getIdentity();
              const loggedInPID = identity.getPrincipal().toText();
              setPrincipal(loggedInPID);

              // Check if the logged-in user is the admin
              if (loggedInPID === adminPID) {
                setIsAuthenticated(true);

                const authAgent = new HttpAgent({ identity });
                const authActor = Actor.createActor(threeMail_backend_idl, {
                  agent: authAgent,
                  canisterId: threeMail_backend_id,
                });
                setMailboxActor(authActor);

                const totalSent = await authActor.getTotalMessagesSent();
                const total = await authActor.getTotalMessages();
                const unviewedCount = await authActor.getUnviewedMessagesCount();
                setTotalMessagesSent(totalSent.toString());
                setTotalMessages(total.toString());
                setUnviewedMessagesCount(unviewedCount.toString());
              } else {
                setResponse("Unauthorized access: You are not the admin.");
              }
            } catch (error) {
              setError(`Failed to fetch message counters after login: ${error.message}`);
              console.error('Login fetch error:', error);
            }
          }
        });
      }
    } catch (error) {
      setError(`Login error: ${error.message}`);
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (authClient) {
        await authClient.logout();
        setIsAuthenticated(false);
        setPrincipal('');
        setMessages([]);
        setMailboxActor(null);

        const agent = new HttpAgent();
        const actor = Actor.createActor(threeMail_backend_idl, {
          agent,
          canisterId: threeMail_backend_id,
        });
        setMailboxActor(actor);
      }
    } catch (error) {
      setError(`Logout error: ${error.message}`);
      console.error('Logout error:', error);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    try {
      if (mailboxActor) {
        const result = await mailboxActor.submitMessage(emailOr3Mail, name, subject, messageBody);
        setResponse(result);
        setEmailOr3Mail('');
        setName('');
        setSubject('');
        setMessageBody('');

        const totalSent = await mailboxActor.getTotalMessagesSent();
        const total = await mailboxActor.getTotalMessages();
        const unviewedCount = await mailboxActor.getUnviewedMessagesCount();
        setTotalMessagesSent(totalSent.toString());
        setTotalMessages(total.toString());
        setUnviewedMessagesCount(unviewedCount.toString());

        // Hide the form and show the thank you message
        setShowForm(false);
      } else {
        setResponse("Failed to send message: Canister not initialized.");
      }
    } catch (error) {
      setError(`Failed to send message: ${error.message}`);
      console.error("Error sending message:", error);
      setResponse("Failed to send message.");
    }
  };

  const handleGetMessages = async () => {
    try {
      if (mailboxActor && principal === adminPID) {
        const myMessages = await mailboxActor.getMyMessages();
        setMessages(myMessages);
        setResponse("");
      } else {
        setResponse("Unauthorized access.");
      }
    } catch (error) {
      setError(`Error retrieving messages: ${error.message}`);
      console.error("Error retrieving messages:", error);
      setResponse("Error retrieving messages.");
    }
  };

  const handleGetUnviewedMessages = async () => {
    try {
      if (mailboxActor && principal === adminPID) {
        const unviewedMessages = await mailboxActor.getUnviewedMessages();
        if (unviewedMessages.length === 0) {
          setResponse("No unviewed messages found.");
        }
        setMessages(unviewedMessages);
      } else {
        setResponse("Unauthorized access.");
      }
    } catch (error) {
      setError(`Error retrieving unviewed messages: ${error.message}`);
      console.error("Error retrieving unviewed messages:", error);
      setResponse("Error retrieving unviewed messages.");
    }
  };

  const handleMarkAsViewed = async (subject) => {
    try {
      if (mailboxActor && principal === adminPID) {
        const result = await mailboxActor.markAsViewed(subject);
        setResponse(result);
        handleGetMessages();

        // Update the counters
        const totalSent = await mailboxActor.getTotalMessagesSent();
        const total = await mailboxActor.getTotalMessages();
        const unviewedCount = await mailboxActor.getUnviewedMessagesCount();
        setTotalMessagesSent(totalSent.toString());
        setTotalMessages(total.toString());
        setUnviewedMessagesCount(unviewedCount.toString());
      } else {
        setResponse("Unauthorized access.");
      }
    } catch (error) {
      setError(`Error marking message as viewed: ${error.message}`);
      console.error("Error marking message as viewed:", error);
      setResponse("Error marking message as viewed.");
    }
  };

  const handleDeleteMessage = async (subject) => {
    try {
      if (mailboxActor && principal === adminPID) {
        const result = await mailboxActor.deleteMessage(subject);
        setResponse(result);
        handleGetMessages();

        // Update the counters
        const totalSent = await mailboxActor.getTotalMessagesSent();
        const total = await mailboxActor.getTotalMessages();
        const unviewedCount = await mailboxActor.getUnviewedMessagesCount();
        setTotalMessagesSent(totalSent.toString());
        setTotalMessages(total.toString());
        setUnviewedMessagesCount(unviewedCount.toString());
      } else {
        setResponse("Unauthorized access.");
      }
    } catch (error) {
      setError(`Error deleting message: ${error.message}`);
      console.error("Error deleting message:", error);
      setResponse("Error deleting message.");
    }
  };

  const handleDeleteAllMessages = async () => {
    if (window.confirm("Are you sure you want to delete all your messages? This action cannot be undone.")) {
      try {
        if (mailboxActor && principal === adminPID) {
          const result = await mailboxActor.deleteAllMessages();
          setResponse(result);
          setMessages([]);

          // Update the counters
          const totalSent = await mailboxActor.getTotalMessagesSent();
          const total = await mailboxActor.getTotalMessages();
          const unviewedCount = await mailboxActor.getUnviewedMessagesCount();
          setTotalMessagesSent(totalSent.toString());
          setTotalMessages(total.toString());
          setUnviewedMessagesCount(unviewedCount.toString());
        } else {
          setResponse("Unauthorized access.");
        }
      } catch (error) {
        setError(`Error deleting all messages: ${error.message}`);
        console.error("Error deleting all messages:", error);
        setResponse("Error deleting all messages.");
      }
    }
  };

  const handleGoBack = () => {
    window.history.back(); // This will navigate back to the previous page in the user's browser history
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>3Mail Contact</h1>
      {!isAuthenticated ? (
        <>
          <button onClick={handleLogin} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Admin Login
          </button>
          {principal && <p>Your Principal ID: {principal}</p>}
        </>
      ) : (
        <>
          <p>Welcome, Admin: {principal}</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Logout
          </button>
          <div style={{ marginTop: '20px' }}>
            <h2>Message Stats</h2>
            <p>Total Messages Sent: {totalMessagesSent}</p>
            <p>Total Messages Stored: {totalMessages}</p>
            <p>Unviewed Messages Count: {unviewedMessagesCount}</p>
            <button onClick={handleGetMessages} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              Get All Messages
            </button>
            <button onClick={handleGetUnviewedMessages} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              Get Unviewed Messages
            </button>
            <button onClick={handleDeleteAllMessages} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}>
              Delete All Messages
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {response && <p>{response}</p>}
            {messages.length > 0 ? (
              <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}>
                <h2>Messages</h2>
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                    <strong>Email or 3Mail:</strong> {msg.emailOr3Mail}<br />
                    <strong>Name:</strong> {msg.name}<br />
                    <strong>Subject:</strong> {msg.subject}<br />
                    <strong>Message:</strong> {msg.message}<br />
                    <strong>Timestamp:</strong> {new Date(Number(msg.timestamp / 1000000n)).toLocaleString()}<br />
                    <button onClick={() => handleMarkAsViewed(msg.subject)} style={{ marginRight: '10px' }}>Mark as Viewed</button>
                    <button onClick={() => handleDeleteMessage(msg.subject)} style={{ marginRight: '10px' }}>Delete</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No messages to display.</p>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: '20px' }}>
        {showForm ? (
          <>
            <h2>Leave a message</h2>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Email Address:</label>
                <input
                  type="text"
                  value={emailOr3Mail}
                  onChange={(e) => setEmailOr3Mail(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Message:</label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Send Message</button>
            </form>
          </>
        ) : (
          <>
            <p>Thank you for your message! We will get back to you soon.</p>
            <button onClick={handleGoBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              Go Back
            </button>
          </>
        )}
        {response && <p>{response}</p>}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href={adLink} target="_blank" rel="noopener noreferrer">
          <img src={adImage} alt="Advertisement" style={{ maxWidth: '100%', height: 'auto' }} />
        </a>
      </div>
    </main>
  );
}

export default App;
