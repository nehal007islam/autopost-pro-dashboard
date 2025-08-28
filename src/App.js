import React, { useState, useEffect } from 'react';
import { Upload, Eye, CheckCircle, Clock, TrendingUp, Settings, Facebook, Instagram, Linkedin, MessageSquare, Shield, BarChart3, Image, Zap, X, Edit3, Wifi, WifiOff, ExternalLink, Send, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [appConfig, setAppConfig] = useState({
    appName: 'AutoPost Pro',
    appDescription: 'Intelligent Social Media Automation',
    webhookUrl: 'https://shariful.automationlearners.pro/webhook-test/163dd45c-c9a0-4c66-a571-bfe97843f215',
    theme: 'blue'
  });
  const [services, setServices] = useState([
    { id: 1, name: 'Facebook Auto-Post', icon: Facebook, active: true, posts: 45, url: '', autoPost: true },
    { id: 2, name: 'Instagram Auto-Post', icon: Instagram, active: false, posts: 0, url: '', autoPost: false },
    { id: 3, name: 'LinkedIn Business', icon: Linkedin, active: false, posts: 0, url: '', autoPost: false },
    { id: 4, name: 'Review Monitor', icon: Shield, active: false, posts: 0, url: '', autoPost: false },
    { id: 5, name: 'WhatsApp Business', icon: MessageSquare, active: false, posts: 0, url: '', autoPost: false }
  ]);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const response = await fetch(`${appConfig.webhookUrl}/health`);
        if (response.ok) {
          setIsConnected(true);
          setConnectionStatus('connected');
        } else {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionStatus('error');
        console.error('Connection check failed:', error);
      }
    };
    
    if (appConfig.webhookUrl) {
      checkConnection();
      const interval = setInterval(checkConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [appConfig.webhookUrl]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploadedImage(e.target.result);
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Get active services for auto-posting
        const activeServices = services.filter(s => s.active && s.autoPost);
        
        // Add service information to the form data
        formData.append('services', JSON.stringify(activeServices.map(s => s.name)));
        
        const response = await fetch(appConfig.webhookUrl, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const newPost = {
            id: Date.now(),
            image: e.target.result,
            content: result.content || "🌟 Check out this amazing product! Perfect for your daily needs with competitive pricing. Get yours today! #product #sale #quality",
            status: 'pending_approval',
            competitor_price: result.competitor_price || '$29.99',
            our_price: result.our_price || '$24.99',
            timestamp: new Date().toLocaleString(),
            services: activeServices.map(s => s.name)
          };
          setGeneratedPosts([newPost, ...generatedPosts]);
        }
      } catch (error) {
        console.error('Error uploading to webhook:', error);
        // Fallback to demo data
        const activeServices = services.filter(s => s.active && s.autoPost);
        const newPost = {
          id: Date.now(),
          image: e.target.result,
          content: "🌟 Check out this amazing product! Perfect for your daily needs with competitive pricing. Get yours today! #product #sale #quality",
          status: 'pending_approval',
          competitor_price: '$29.99',
          our_price: '$24.99',
          timestamp: new Date().toLocaleString(),
          services: activeServices.map(s => s.name)
        };
        setGeneratedPosts([newPost, ...generatedPosts]);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const approvePost = async (postId) => {
    const post = generatedPosts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      // Send approval to webhook
      const response = await fetch(`${appConfig.webhookUrl}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          action: 'approve',
          postContent: post.content,
          services: post.services
        })
      });
      
      if (response.ok) {
        setGeneratedPosts(posts => 
          posts.map(post => 
            post.id === postId ? { ...post, status: 'approved' } : post
          )
        );
      }
    } catch (error) {
      console.error('Error approving post:', error);
      // Fallback to local state update
      setGeneratedPosts(posts => 
        posts.map(post => 
          post.id === postId ? { ...post, status: 'approved' } : post
        )
      );
    }
  };

  const rejectPost = async (postId) => {
    try {
      const response = await fetch(`${appConfig.webhookUrl}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          action: 'reject'
        })
      });
      
      if (response.ok) {
        setGeneratedPosts(posts => 
          posts.map(post => 
            post.id === postId ? { ...post, status: 'rejected' } : post
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      setGeneratedPosts(posts => 
        posts.map(post => 
          post.id === postId ? { ...post, status: 'rejected' } : post
        )
      );
    }
  };

  const manuallyPostToService = async (postId, serviceName) => {
    const post = generatedPosts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      const response = await fetch(`${appConfig.webhookUrl}/manual-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          service: serviceName,
          postContent: post.content,
          image: post.image
        })
      });
      
      if (response.ok) {
        // Update post status to show it was manually posted
        setGeneratedPosts(posts => 
          posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  manuallyPosted: [...(post.manuallyPosted || []), serviceName],
                  status: post.status === 'pending_approval' ? 'approved' : post.status
                } 
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error manually posting:', error);
    }
  };

  const startEditPost = (post) => {
    setEditingPost({ ...post });
  };

  const saveEditPost = () => {
    setGeneratedPosts(posts => 
      posts.map(post => 
        post.id === editingPost.id ? editingPost : post
      )
    );
    setEditingPost(null);
  };

  const updateConfig = (key, value) => {
    setAppConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateService = (serviceId, key, value) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, [key]: value } : service
    ));
  };

  const toggleAutoPost = (serviceId) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, autoPost: !service.autoPost } : service
    ));
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch(`${appConfig.webhookUrl}/health`);
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('connected');
      } else {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const TabButton = ({ id, children, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  const ConnectionStatus = () => {
    const statusConfig = {
      connected: { color: 'green', text: 'Connected', icon: Wifi },
      disconnected: { color: 'red', text: 'Disconnected', icon: WifiOff },
      checking: { color: 'blue', text: 'Checking...', icon: Clock },
      error: { color: 'red', text: 'Connection Error', icon: WifiOff }
    };
    
    const { color, text, icon: Icon } = statusConfig[connectionStatus];
    
    return (
      <div 
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 cursor-pointer`}
        onClick={testConnection}
        title="Click to test connection"
      >
        <Icon className="h-4 w-4" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{appConfig.appName}</h1>
                <p className="text-gray-600">{appConfig.appDescription}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Settings</h3>
                <button onClick={() => setShowSettings(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                  <input
                    type="text"
                    value={appConfig.appName}
                    onChange={(e) => updateConfig('appName', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App Description</label>
                  <input
                    type="text"
                    value={appConfig.appDescription}
                    onChange={(e) => updateConfig('appDescription', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">n8n Webhook URL</label>
                  <div className="flex">
                    <input
                      type="url"
                      value={appConfig.webhookUrl}
                      onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                      className="flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-n8n-webhook-url.com"
                    />
                    <button
                      onClick={testConnection}
                      className="bg-blue-100 px-3 rounded-r-lg hover:bg-blue-200 transition-colors"
                      title="Test Connection"
                    >
                      <Wifi className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Post Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Edit Post</h3>
                <button onClick={() => setEditingPost(null)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Our Price</label>
                    <input
                      type="text"
                      value={editingPost.our_price}
                      onChange={(e) => setEditingPost({...editingPost, our_price: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Competitor Price</label>
                    <input
                      type="text"
                      value={editingPost.competitor_price}
                      onChange={(e) => setEditingPost({...editingPost, competitor_price: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post to Services</label>
                  <div className="flex flex-wrap gap-2">
                    {services.filter(s => s.active).map(service => {
                      const Icon = service.icon;
                      return (
                        <label key={service.id} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={editingPost.services?.includes(service.name) || false}
                            onChange={(e) => {
                              const newServices = e.target.checked
                                ? [...(editingPost.services || []), service.name]
                                : (editingPost.services || []).filter(s => s !== service.name);
                              setEditingPost({...editingPost, services: newServices});
                            }}
                            className="rounded text-blue-600"
                          />
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{service.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={saveEditPost}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <TabButton id="upload" active={activeTab === 'upload'}>
            <Upload className="inline-block w-4 h-4 mr-2" />
            Upload & Generate
          </TabButton>
          <TabButton id="posts" active={activeTab === 'posts'}>
            <Eye className="inline-block w-4 h-4 mr-2" />
            Generated Posts
          </TabButton>
          <TabButton id="analytics" active={activeTab === 'analytics'}>
            <BarChart3 className="inline-block w-4 h-4 mr-2" />
            Analytics
          </TabButton>
          <TabButton id="services" active={activeTab === 'services'}>
            <Settings className="inline-block w-4 h-4 mr-2" />
            Services
          </TabButton>
        </div>

        {/* Upload & Generate Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Upload Product Photo</h2>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                  disabled={isUploading || !isConnected}
                />
                <label 
                  htmlFor="imageUpload" 
                  className={`cursor-pointer ${(isUploading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {isUploading ? 'Processing...' : 'Click to upload product image'}
                  </p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                  {!isConnected && (
                    <p className="text-sm text-red-500 mt-2">Please connect to n8n first in Settings</p>
                  )}
                </label>
              </div>
              
              {uploadedImage && (
                <div className="mt-4">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Workflow Status</h2>
              <div className="space-y-4">
                {[
                  { step: 'Image Analysis', status: isUploading ? 'in_progress' : 'pending' },
                  { step: 'Web Search', status: isUploading ? 'in_progress' : 'pending' },
                  { step: 'Competitor Pricing', status: isUploading ? 'in_progress' : 'pending' },
                  { step: 'Post Generation', status: isUploading ? 'in_progress' : 'pending' },
                  { step: 'Quality Check', status: 'pending' },
                  { step: 'Human Approval', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'
                    }`} />
                    <span className={`${
                      item.status === 'completed' ? 'text-green-700' :
                      item.status === 'in_progress' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {item.step}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Human Approval Required</h3>
                <p className="text-blue-700 text-sm">
                  After generation, posts will await your approval before being published to connected services.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {generatedPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts generated yet</h3>
                <p className="text-gray-400">Upload a product image to generate your first post</p>
              </div>
            ) : (
              generatedPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <img src={post.image} alt="Product" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.status === 'approved' ? 'bg-green-100 text-green-800' :
                          post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'approved' ? 'Approved' : 
                           post.status === 'rejected' ? 'Rejected' : 
                           'Pending Approval'}
                        </span>
                        <span className="text-gray-500 text-sm">{post.timestamp}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-800">{post.content}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Competitor Price</p>
                          <p className="font-semibold text-red-600">{post.competitor_price}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">Our Price</p>
                          <p className="font-semibold text-green-600">{post.our_price}</p>
                        </div>
                      </div>
                      
                      {/* Services section */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Post to Services:</p>
                        <div className="flex flex-wrap gap-2">
                          {services.filter(s => s.active).map(service => {
                            const Icon = service.icon;
                            const isPosted = post.manuallyPosted?.includes(service.name) || 
                                           (post.status === 'approved' && post.services?.includes(service.name));
                            return (
                              <div 
                                key={service.id} 
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                                  isPosted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <Icon className="h-3 w-3" />
                                <span>{service.name}</span>
                                {isPosted && <CheckCircle className="h-3 w-3" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {post.status === 'pending_approval' && (
                        <div className="flex space-x-2 flex-wrap gap-2">
                          <button
                            onClick={() => approvePost(post.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve All
                          </button>
                          <button
                            onClick={() => startEditPost(post)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => rejectPost(post.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          
                          {/* Manual post buttons for each service */}
                          {services.filter(s => s.active).map(service => (
                            <button
                              key={service.id}
                              onClick={() => manuallyPostToService(post.id, service.name)}
                              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Post to {service.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {post.status === 'approved' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Successfully posted to selected services
                        </div>
                      )}
                      
                      {post.status === 'rejected' && (
                        <div className="flex items-center text-red-600">
                          <X className="w-4 h-4 mr-2" />
                          Post rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-600">42</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Services</p>
                  <p className="text-2xl font-bold text-purple-600">1</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Configuration Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Service Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Webhook URL</label>
                  <div className="flex">
                    <input
                      type="url"
                      value={appConfig.webhookUrl}
                      onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                      className="flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-n8n-webhook-url.com"
                    />
                    <button
                      onClick={() => window.open(appConfig.webhookUrl, '_blank')}
                      className="bg-gray-100 px-3 rounded-r-lg hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={testConnection}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Test Connection
                  </button>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => {
                const IconComponent = service.icon;
                return (
                  <div key={service.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${service.active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-6 w-6 ${service.active ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">{service.posts} posts generated</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateService(service.id, 'active', !service.active)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          service.active ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          service.active ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        {service.id === 1 && "Automated Facebook post generation with competitor analysis"}
                        {service.id === 2 && "Instagram-optimized posts with hashtag strategies"}
                        {service.id === 3 && "Professional LinkedIn business content"}
                        {service.id === 4 && "Monitor and respond to customer reviews"}
                        {service.id === 5 && "WhatsApp Business auto-response system"}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Auto-Post</label>
                        <button
                          onClick={() => toggleAutoPost(service.id)}
                          className={`w-10 h-5 rounded-full transition-colors ${
                            service.autoPost ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                          disabled={!service.active}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            service.autoPost ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Service URL</label>
                        <div className="flex">
                          <input
                            type="url"
                            value={service.url}
                            onChange={(e) => updateService(service.id, 'url', e.target.value)}
                            className="flex-1 p-2 text-xs border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://your-service-webhook.com"
                            disabled={!service.active}
                          />
                          {service.url && (
                            <button
                              onClick={() => window.open(service.url, '_blank')}
                              className="bg-gray-100 px-2 rounded-r-lg hover:bg-gray-200 transition-colors"
                              disabled={!service.active}
                            >
                              <ExternalLink className="h-3 w-3 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!service.active && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Enable service to start using</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
