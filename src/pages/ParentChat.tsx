import React, { useState, useRef, useEffect } from 'react';

import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { PrivateMessage, Attachment } from '../data/types';
import { format } from 'date-fns';
import {
  Paperclip, Smile, MessageCircle,
  MoreVertical, Edit2, Trash2, Check, X,
  Camera, Plus, Cloud
} from 'lucide-react';
import { QUICK_REACTIONS } from '../data/constants';
// Google Drive integration - temporary placeholder functions
const loadGoogleApis = () => Promise.resolve();
const requestDriveAccess = () => Promise.resolve();
const getDriveFileContent = () => Promise.resolve();
const isGoogleWorkspaceFile = () => false;
const exportWorkspaceFile = () => Promise.resolve();
const formatFileSize = (size: number) => `${size} bytes`;
const getFileTypeIcon = () => '📄';
const getFileCategory = () => 'document';

// Simple collection name like FamilyChat
const PARENT_MESSAGES_COLLECTION = 'parent_messages';

const ParentChat: React.FC = () => {
  const { chatBehaviour, authBehaviour } = useBehaviours();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{ uid?: string; id?: string } | null>(null);
  useEffect(() => {
    authBehaviour.getCurrentUser().then((u) => setCurrentUser(u));
  }, [authBehaviour]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<PrivateMessage | null>(null);
  const [editText, setEditText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [driveFiles, setDriveFiles] = useState<File[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Google APIs on mount
  useEffect(() => {
    loadGoogleApis().catch(() => {
      // Google APIs not available
    });
  }, []);
  // Load messages from behavior
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = chatBehaviour.getMessagesSync();
        // Convert Message to PrivateMessage for compatibility
        const privateMessages: PrivateMessage[] = messagesData.map(msg => ({
          ...msg,
          conversationId: 'parent', // Default conversation ID
          readBy: [msg.senderId] // Default read by sender
        }));
        setMessages(privateMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fallback to empty array
        setMessages([]);
      }
    };
    
    loadMessages();
  }, [chatBehaviour]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) {
      return;
    }

    setSending(true);
    setUploadProgress(0);

    try {
      // Use behavior to send message
      await chatBehaviour.sendMessage(newMessage.trim(), attachments);
      
      // Clear form
      setNewMessage('');
      setAttachments([]);
      setUploadProgress(null);
      fileInputRef.current && (fileInputRef.current.value = '');
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      
      setError(errorMsg);
      setUploadProgress(null);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await chatBehaviour.deleteMessage(messageId);
      setShowActions(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message');
    }
  };

  const startEdit = (message: PrivateMessage) => {
    setEditingMessage(message);
    setEditText(message.text);
    setShowActions(null);
  };

  const saveEdit = async (messageId: string) => {
    if (!editText.trim()) return;
    
    try {
      await chatBehaviour.updateMessage(messageId, editText.trim());
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update message:', error);
      setError('Failed to update message');
    }
    setShowActions(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await chatBehaviour.toggleReaction(messageId, emoji);
      setShowActions(null);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      setError('Failed to toggle reaction');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowMobileActions(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Google Drive file selection
  const handleDriveSelect = async () => {
    setDriveLoading(true);
    try {
      // Request Drive access
      const accessToken = await requestDriveAccess();
      
      // Simple URL prompt for now (can be enhanced with Google Picker)
      const driveUrl = prompt(
        'Paste Google Drive file link:\n\n' +
        'You can get this by:\n' +
        '1. Right-click the file in Drive\n' +
        '2. Click "Share" → "Copy link"'
      );
      
      if (!driveUrl || !driveUrl.trim()) {
        setDriveLoading(false);
        return;
      }
      
      // Parse the URL to get file ID
      const { fileId, valid } = parseDriveUrl(driveUrl.trim());
      
      if (!valid || !fileId) {
        alert('Invalid Google Drive link. Please copy the share link from Drive.');
        setDriveLoading(false);
        return;
      }
      
      // Download the file
      const fileBlob = await getDriveFileContent(fileId, accessToken);
      
      // Determine file extension from URL
      const fileName = `Drive_${fileId}.pdf`;
      
      // Create a File object
      const driveFile = new File([fileBlob], fileName, { type: 'application/pdf' });
      
      setAttachments(prev => [...prev, driveFile]);
      setDriveLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to import from Google Drive');
      setDriveLoading(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  const parseDriveUrl = (url: string): { fileId: string; valid: boolean } => {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)\//,
      /\/d\/([a-zA-Z0-9_-]+)$/,
      /id=([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { fileId: match[1], valid: true };
      }
    }
    
    return { fileId: '', valid: false };
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, PrivateMessage[]>);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <MessageCircle className="text-purple-500" size={28} />
          <span>Parent Chat</span>
        </h1>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-gray-500">Private conversation - Hidden from Dominic</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={48} className="mb-4" />
              <p>No messages yet</p>
              <p className="text-sm">Start coordinating!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </span>
                </div>

                {/* Messages */}
                {dateMessages.map((message) => {
                  const isOwnMessage = message.senderId === (currentUser?.uid || currentUser?.id);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 group`}
                    >
                      <div className="relative group">
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                            isOwnMessage
                              ? 'bg-purple-100 rounded-br-md'
                              : 'bg-white border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold text-gray-600 mb-1.5">
                              {message.senderName}
                            </p>
                          )}

                          {/* Edit Mode */}
                          {editingMessage?.id === message.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                              />
                              <button onClick={() => saveEdit(message.id)} className="text-green-500">
                                <Check size={16} />
                              </button>
                              <button onClick={cancelEdit} className="text-red-500">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Text Content */}
                              {message.text && (
                                <p
                                  className={`text-base leading-relaxed ${
                                    isOwnMessage ? 'text-gray-800' : 'text-gray-700'
                                  }`}
                                >
                                  {message.text}
                                </p>
                              )}

                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id} className="attachment-item">
                                      {attachment.fileType === 'image' ? (
                                        <img 
                                          src={attachment.url} 
                                          alt={attachment.title}
                                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => window.open(attachment.url, '_blank')}
                                        />
                                      ) : (
                                        <a 
                                          href={attachment.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-blue-500 hover:underline"
                                        >
                                          <Paperclip size={16} />
                                          <span>{attachment.title}</span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Edited indicator */}
                              {message.edited && (
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  edited
                                </p>
                              )}

                              {/* Reactions display */}
                              {message.reactions && Object.keys(message.reactions).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {Object.entries(message.reactions).map(([emoji, users]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addReaction(message.id, emoji)}
                                      className={`text-sm px-2.5 py-1 rounded-full border ${
                                        (users as unknown as string[]).includes(currentUser?.uid || currentUser?.id || '')
                                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                                          : 'bg-gray-100 border-gray-300 text-gray-700'
                                      }`}
                                    >
                                      <span className="mr-1">{emoji}</span>
                                      <span className="text-xs font-medium">{(users as unknown as string[]).length}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Time and actions */}
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                                <p
                                  className={`text-[11px] text-gray-400 ${
                                    isOwnMessage ? '' : ''
                                  }`}
                                >
                                  {formatMessageTime(message.timestamp)}
                                </p>

                                {/* Quick reactions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                  {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addReaction(message.id, emoji)}
                                      className="w-7 h-7 flex items-center justify-center text-lg bg-white rounded-full shadow-sm border border-gray-200 hover:scale-110 hover:shadow-md transition-all"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action menu (three dots) */}
                        {isOwnMessage && !editingMessage && (
                          <button
                            onClick={() => setShowActions(showActions === message.id ? null : message.id)}
                            className="absolute -right-10 top-1 p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}

                        {/* Actions dropdown */}
                        {showActions === message.id && (
                          <div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg py-1 z-10 min-w-[120px]">
                            <button
                              onClick={() => startEdit(message)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-500"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Paperclip size={20} />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{sending ? 'Uploading...' : 'Processing...'}</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 px-4 py-3 bg-red-100 border-t border-red-300">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50"
        >
          <div className="flex items-center gap-2">
            {/* Mobile actions button */}
            <button
              type="button"
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>

            {/* Mobile attachment buttons */}
            <div className={`${showMobileActions ? 'flex' : 'hidden'} lg:flex items-center gap-2`}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                title="Take photo"
              >
                <Camera size={20} />
              </button>
              
              {/* Google Drive Button */}
              <button
                type="button"
                onClick={handleDriveSelect}
                disabled={driveLoading}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Add from Google Drive"
              >
                {driveLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                ) : (
                  <Cloud size={20} />
                )}
              </button>
            </div>

            {/* Emoji picker toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Smile size={20} />
              </button>

              {/* Emoji picker dropdown */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg p-2 grid grid-cols-6 gap-1 w-48">
                  {['😀', '😂', '🥰', '😮', '😢', '😡', '👍', '👎', '❤️', '🎉', '🎊', '🎁', '🔥', '⭐', '💯', '🙏', '💪', '👋', '🎵', '💡'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl p-1 hover:bg-gray-100 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a private message..."
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && attachments.length === 0)}
              className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <span className="text-lg">➤</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentChat;
