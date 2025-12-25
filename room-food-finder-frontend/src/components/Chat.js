import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import AuthContext from '../context/AuthContext';
import ConversationItem from './ConversationItem'; // Import the new component
import '../styles/Chat.css';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user's conversations
  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'chatts'), where('participants', 'array-contains', user.id));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userConversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(userConversations);
      setLoading(false);
    }, (error) => {
      console.warn("Chat: Firestore query issue (might be permission or empty):", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for the active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const messagesRef = collection(db, 'chatts', activeConversation.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversationMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(conversationMessages);
    });

    return () => unsubscribe();
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !activeConversation) return;

    const messagesRef = collection(db, 'chatts', activeConversation.id, 'messages');

    await addDoc(messagesRef, {
      text: newMessage,
      senderId: user.id,
      timestamp: serverTimestamp()
    });

    setNewMessage('');
  };

  if (loading) {
    return <p>Loading conversations...</p>;
  }

  return (
    <div className="chat-container">
      <aside className="conversations-sidebar">
        <div className="sidebar-header">
          <h3>Conversations</h3>
        </div>
        {conversations.length > 0 ? (
          <div className="conversation-list">
            {conversations.map((convo) => (
              <ConversationItem
                key={convo.id}
                convo={convo}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
              />
            ))}
          </div>
        ) : (
          <div className="no-conversations">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <h4>No conversations yet</h4>
            <p>Start a new chat from a listing page.</p>
          </div>
        )}
      </aside>
      <main className="chat-window">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <h3>{activeConversation.otherUserName || 'Chat'}</h3>
            </div>
            <div className="message-list">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-item ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
