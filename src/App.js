import React, { useState, useEffect } from 'react';
import { Upload, Eye, CheckCircle, Clock, TrendingUp, Settings, Facebook, Instagram, Linkedin, MessageSquare, Shield, BarChart3, Image, Zap, X, Edit3, Wifi, WifiOff, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [appConfig, setAppConfig] = useState({
    appName: 'AutoPost Pro',
    appDescription: 'Intelligent Social Media Automation',
    webhookUrl: 'https://shariful.automationlearners.pro/webhook-test/163dd45c-c9a0-4c66-a571-bfe97843f215',
    theme: 'blue'
  });
  const [services, setServices] = useState([
    { id: 1, name: 'Facebook Auto-Post', icon: Facebook, active: true, posts: 45, url: '' },
    { id: 2, name: 'Instagram Auto-Post', icon: Instagram, active: false, posts: 0, url: '' },
    { id: 3, name: 'LinkedIn Business', icon: Linkedin, active: false, posts: 0, url: '' },
    { id: 4, name: 'Review Monitor', icon: Shield, active: false, posts: 0, url: '' },
    { id: 5, name: 'WhatsApp Business', icon: MessageSquare, active: false, posts: 0, url: '' }
  ]);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${appConfig.webhookUrl}/health`);
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };
    
    if (appConfig.webhookUrl) {
      checkConnection();
      const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [appConfig.webhookUrl]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setUploadedImage(e.target.result);
        
        // Send to n8n webhook
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await fetch(appConfig.webhookUrl, {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            // Simulate post generation (replace with actual webhook response)
            setTimeout(() => {
              const newPost = {
                id: Date.now(),
                image: e.target.result,
                content: result.content || "🌟 Check out this amazing product! Perfect for your daily needs with competitive pricing. Get yours today! #product #sale #quality",
                status: 'pending_approval',
                competitor_price: result.competitor_price || '$29.99',
                our_price: result.our_price || '$24.99',
                timestamp: new Date().toLocaleString()
              };
              setGeneratedPosts([newPost, ...generatedPosts]);
            }, 2000);
          }
        } catch (error) {
          console.error('Error uploading to webhook:', error);
          // Fallback to demo data
          setTimeout(() => {
            const newPost = {
              id: Date.now(),
              image: e.target.result,
              content: "🌟 Check out this amazing product! Perfect for your daily needs with competitive pricing. Get yours today! #product #sale #quality",
              status: 'pending_approval',
              competitor_price: '$29.99',
              our_price: '$24.99',
              timestamp: new Date().toLocaleString()
            };
            setGeneratedPosts([newPost, ...generatedPosts]);
          }, 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const approvePost = (postId) => {
    setGeneratedPosts(posts => 
      posts.map(post => 
        post.id === postId ? { ...post, status: 'approved' } : post
      )
    );
  };

  const rejectPost = (postId) => {
    setGeneratedPosts(posts => 
      posts.map(post => 
        post.id === postId ? { ...post, status: 'rejected' } : post
      )
    );
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
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
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
                  <input
                    type="url"
                    value={appConfig.webhookUrl}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-n8n-webhook-url.com"
                  />
                </div>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload product image</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                </label>
              </div>
              
              {uploadedImage && (
                <div className="mt-4">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Processing image and generating post...
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Workflow Status</h2>
              <div className="space-y-4">
                {[
                  { step: 'Image Analysis', status: 'completed' },
                  { step: 'Web Search', status: 'completed' },
                  { step: 'Competitor Pricing', status: 'in_progress' },
                  { step: 'Post Generation', status: 'pending' },
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
                      
                      {post.status === 'pending_approval' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approvePost(post.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
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
                        </div>
                      )}
                      
                      {post.status === 'approved' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Successfully posted to Facebook
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
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                            className="font-semibold text-gray-900 bg-transparent border-none focus:bg-gray-50 focus:border focus:rounded px-1"
                          />
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
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Service URL</label>
                        <div className="flex">
                          <input
                            type="url"
                            value={service.url}
                            onChange={(e) => updateService(service.id, 'url', e.target.value)}
                            className="flex-1 p-2 text-xs border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://your-service-webhook.com"
                          />
                          {service.url && (
                            <button
                              onClick={() => window.open(service.url, '_blank')}
                              className="bg-gray-100 px-2 rounded-r-lg hover:bg-gray-200 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!service.active && service.id !== 1 && (
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

