import React, { useState, useEffect } from 'react';
import { Resource, User } from '../data/types';
import { format } from 'date-fns';
import { FolderOpen, Plus, ExternalLink, Trash2, Printer, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <FileText className="text-red-500" size={24} />;
    case 'doc':
    case 'docx':
      return <FileText className="text-blue-500" size={24} />;
    case 'sheet':
    case 'xlsx':
      return <FileSpreadsheet className="text-green-500" size={24} />;
    default:
      return <File className="text-gray-500" size={24} />;
  }
};

const Resources: React.FC = () => {
  const { authBehaviour } = useBehaviours();
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'article' | 'video' | 'tool' | 'template'>('article');
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authBehaviour.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, [authBehaviour]);

  // Load resources for development
  useEffect(() => {
    console.log('🔧 DEV MODE: Loading mock resources');
    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'Math Homework Guidelines',
        description: 'Guidelines for math homework assignments',
        content: 'Detailed guidelines for completing math homework assignments...',
        type: 'article',
        category: 'Mathematics',
        tags: ['homework', 'math'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Science Project Instructions',
        description: 'Instructions for science fair projects',
        content: 'Step-by-step instructions for creating science fair projects...',
        type: 'tool',
        category: 'Science',
        tags: ['project', 'science'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        title: 'Reading List',
        description: 'Recommended reading materials',
        content: 'List of recommended books and reading materials...',
        type: 'article',
        category: 'Language Arts',
        tags: ['reading', 'literature'],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
    ];
    setResources(mockResources.sort((a: Resource, b: Resource) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);


  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !user) return;

    setAdding(true);

    try {
      const newResource: Resource = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        description: newDescription.trim(),
        content: newContent.trim(),
        type: newType,
        category: newCategory.trim(),
        tags: newTags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setResources(prev => [newResource, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewContent('');
      setNewType('article');
      setNewCategory('');
      setNewTags([]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding resource:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setResources(prev => prev.filter(resource => resource.id !== id));
    }
  };

  const handleOpen = (content: string) => {
    window.open(content, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <FolderOpen className="text-amber-500" size={28} />
            <span>Resources</span>
          </h1>
          <p className="text-gray-500">Educational materials and documents</p>
        </div>
        {user?.role === 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
          >
            <Plus size={20} />
            <span>Add Resource</span>
          </button>
        )}
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <FolderOpen className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No resources yet</h3>
          <p className="text-gray-400">
            Parents can add educational materials from Google Drive
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="text-blue-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {resource.type}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {resource.category}
                    </span>
                    {resource.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Created {format(new Date(resource.createdAt), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpen(resource.content)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>View</span>
                    </button>
                    {user?.role === 'parent' && (
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Add Resource</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Science Worksheet Week 5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of the resource"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Resource content or link"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="tool">Tool</option>
                  <option value="template">Template</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Mathematics, Science"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags.join(', ')}
                  onChange={(e) => setNewTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  placeholder="e.g., homework, math, assignment"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
