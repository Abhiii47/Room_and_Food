import React from 'react';

const ConversationItem = ({ convo, activeConversation, setActiveConversation }) => {
    return (
        <div
            className={`conversation-item ${activeConversation?.id === convo.id ? 'active' : ''}`}
            onClick={() => setActiveConversation(convo)}
        >
            <div className="convo-avatar">
                {convo.otherUserName?.charAt(0) || '?'}
            </div>
            <div className="convo-details">
                <h4>{convo.otherUserName || 'User'}</h4>
                <p className="last-message">Click to view chat</p>
            </div>
        </div>
    );
};

export default ConversationItem;
