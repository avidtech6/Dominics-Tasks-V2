import React, { useRef } from 'react';
import { Task } from '../data/types';
import { X, Send, MessageCircle } from 'lucide-react';
import {
  formatCommentTime,
  isValidComment,
  shouldShowLoading,
  shouldShowEmptyState,
  shouldShowCommentsList
} from './CommentsModalBehaviour';

interface CommentsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  comments: any[];
  loading: boolean;
  newComment: string;
  sendingComment: boolean;
  user: {
    displayName: string;
    email: string;
    uid: string;
  };
  onAddComment: (comment: string) => void;
  onNewCommentChange: (value: string) => void;
  onScrollToBottom?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  task,
  isOpen,
  onClose,
  comments,
  loading,
  newComment,
  sendingComment,
  user,
  onAddComment,
  onNewCommentChange,
  onScrollToBottom
}) => {
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new comments arrive
  React.useEffect(() => {
    if (onScrollToBottom) {
      onScrollToBottom();
    }
  }, [comments, onScrollToBottom]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidComment(newComment)) return;
    onAddComment(newComment.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 truncate max-w-[250px]">
                {task.title}
              </h3>
              <p className="text-xs text-gray-500">Comments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {shouldShowLoading(loading, comments) ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : shouldShowEmptyState(loading, comments) ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <MessageCircle size={40} className="mb-2" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Be the first to add one!</p>
            </div>
          ) : shouldShowCommentsList(loading, comments) && (
            <>
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`flex ${comment.authorEmail === user?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      comment.authorEmail === user?.email
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-700 rounded-bl-md'
                    }`}
                  >
                    {comment.authorEmail !== user?.email && (
                      <p className="text-xs font-medium mb-1 text-gray-600">
                        {comment.authorName}
                      </p>
                    )}
                    <p className="text-sm">{comment.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      comment.authorEmail === user?.email ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {comment.timestamp && formatCommentTime(comment.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSendComment}
          className="p-4 border-t border-gray-100"
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => onNewCommentChange(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={sendingComment}
            />
            <button
              type="submit"
              disabled={sendingComment || !newComment.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Comments will also appear in Family Chat
          </p>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;
