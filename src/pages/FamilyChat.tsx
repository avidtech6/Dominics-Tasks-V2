import React, { useState, useRef, useEffect } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { Message, Attachment } from '../data/types';
import { format } from 'date-fns';
import {
  Paperclip, Smile, MessageCircle,
  MoreVertical, Edit2, Trash2, Check, X,
  Camera, Plus
} from 'lucide-react';
import { QUICK_REACTIONS } from '../types';

// Mock auth context for development
const useAuth = () => {
  return {
    user: {
      displayName: 'Dev User',
      email: 'dev@parent.com',
      uid: 'dev-user-1',
      photoURL: 'https://via.placeholder.com/150',
    },
    isParent: false,
    isLoading: false,
  };
};

// Mock messages for development
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Welcome to the family chat!',
    senderId: 'dev-user-1',
    senderName: 'Dev User',
    senderEmail: 'dev@parent.com',
    timestamp: new Date('2024-01-15T10:30:00'),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
  {
    id: '2',
    text: 'Don\'t forget to complete your homework!',
    senderId: 'dev-user-1',
    senderName: 'Dev User',
    senderEmail: 'dev@parent.com',
    timestamp: new Date('2024-01-15T11:15:00'),
    type: 'user',
    edited: false,
    reactions: {},
    attachments: [],
  },
];

const FamilyChat: React.FC = () => {
  const { user } = useAuth();
  const { chatBehaviour } = useBehaviours();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from behavior
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = chatBehaviour.getMessagesSync();
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fallback to empty array
        setMessages([]);
      }
    };
    
    loadMessages();
  }, [chatBehaviour]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if ((!newMessage.trim() && attachments.length === 0) || !user) return;

    setSending(true);
    setUploadProgress(0);

    try {
      const messageId = `${Date.now()}-${user.uid}`;
      const attachmentsData: Attachment[] = [];

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const newMsg: Message = {
        id: messageId,
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Dev User',
        senderEmail: user.email,
        timestamp: new Date(),
        type: 'user',
        edited: false,
        reactions: {},
        attachments: attachmentsData,
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setAttachments([]);
      setUploadProgress(null);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const editMessage = (message: Message) => {
    setEditingMessage(message);
    setEditText(message.text);
  };

  const saveEdit = () => {
    if (!editingMessage) return;

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id 
        ? { ...msg, text: editText, editedAt: new Date() }
        : msg
    ));
    setEditingMessage(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const addReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newReactions = { ...msg.reactions };
        if (newReactions[reaction]) {
          delete newReactions[reaction];
        } else {
          newReactions[reaction] = [user.uid];
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleCameraCapture = () => {
    // Simulate camera capture
    const mockFile = new File(['mock camera content'], 'camera-photo.jpg', { type: 'image/jpeg' });
    setAttachments(prev => [...prev, mockFile]);
    setShowMobileActions(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <MessageCircle className="text-blue-500" size={24} />
          <h1 className="text-xl font-semibold text-gray-800">Family Chat</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.email ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === user?.email
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm">{message.senderName}</span>
                <span className="text-xs opacity-70">
                  {format(message.timestamp, 'HH:mm')}
                </span>
                {message.editedAt && (
                  <span className="text-xs opacity-70">(edited)</span>
                )}
              </div>
              <p className="text-sm">{message.text}</p>
              
              {/* Reactions */}
              <div className="flex space-x-1 mt-2">
                {Object.entries(message.reactions || {}).map(([reaction, count]) => (
                  <button
                    key={reaction}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    onClick={() => addReaction(message.id, reaction)}
                  >
                    {reaction} {count ? `(${count})` : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && attachments.length === 0)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          {uploadProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FamilyChat;
