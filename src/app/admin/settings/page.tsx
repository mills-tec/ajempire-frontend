'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, User, Camera, MapPin, Briefcase, Globe, Lock, Bell, Shield, Key, Plus, X, Check, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { 
  fetchAdminProfile, 
  updateAdminProfile, 
  getAllAdmins, 
  addAdmin, 
  updateAdminPermission, 
  deleteAdmin, 
  fetchPermissions,
  updateAdminSecuritySettings,
  updateAdminNotificationSettings,
  getLogisticsSettings,
  updateLogisticsSettings
} from '@/lib/adminapi';
import ProtectedRoute from '@/components/auth-component/ProtectedRoute';

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border ${bgColors[type]} shadow-lg max-w-md`}>
      {icons[type]}
      <span className="text-sm text-gray-800">{message}</span>
      <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const SettingsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [selectedTab, setSelectedTab] = useState('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: '',
    email: '',
    phone: '',
    profilePicture: '' as string | null
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Roles & Access state
  const [admins, setAdmins] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    role: '',
    // permissions: []
  });
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    customerMessages: true,
    systemAlerts: true,
    marketingEmails: false
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true
  });
  const [securityLoading, setSecurityLoading] = useState(false);
  
  // Logistics state
  const [logisticsSettings, setLogisticsSettings] = useState({
    logisticsMode: 'auto' as 'auto' | 'manual',
  });
  const [isActive, setIsActive] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logisticsActive');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'roles', label: 'Roles & Access Control', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'logistics', label: 'Logistics', icon: Package }
  ];

  // Data fetching functions
  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await fetchAdminProfile();
      if (response.data) {
        setProfileData({
          firstName: response.data.firstName || response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || response.data.phoneNumber || '',
          profilePicture: response.data.profilePicture || response.data.avatar || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Show error message to user
      alert('Failed to load profile data. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAdminsData = async () => {
    try {
      setAdminLoading(true);
      const [adminsResponse, permissionsResponse] = await Promise.all([
        getAllAdmins(),
        fetchPermissions()
      ]);
      
      if (adminsResponse.message && Array.isArray(adminsResponse.message)) {
        setAdmins(adminsResponse.message);
      } else if (adminsResponse.data) {
        setAdmins(adminsResponse.data);
      }
      console.log("Permissions: ", permissionsResponse)
      if (permissionsResponse.data) {
        // Handle the API response structure with allPermissions array
        const permissionsData = permissionsResponse.data as any;
        if (permissionsData.allPermissions && Array.isArray(permissionsData.allPermissions)) {
          setPermissions(permissionsData.allPermissions);
        } else if (Array.isArray(permissionsResponse.data)) {
          // Fallback if data is directly an array
          setPermissions(permissionsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching admins data:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchNotificationData = async () => {
    try {
      setNotificationLoading(true);
      // This would need to be implemented in the API
      // For now, using default values
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setSecurityLoading(true);
      // This would need to be implemented in the API
      // For now, using default values
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  const fetchLogisticsData = async () => {
    try {
      setLogisticsLoading(true);
      const response = await getLogisticsSettings();
      if (response.data) {
        setLogisticsSettings({
          logisticsMode: response.data.logisticsMode || 'auto',
        });
      }
    } catch (error) {
      console.error('Error fetching logistics settings:', error);
    } finally {
      setLogisticsLoading(false);
    }
  };

  const handleIsActiveToggle = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('logisticsActive', JSON.stringify(newIsActive));
    }
  };

  // Load data when tab changes
  useEffect(() => {
    switch (selectedTab) {
      case 'profile':
        fetchProfileData();
        break;
      case 'roles':
        fetchAdminsData();
        break;
      case 'notifications':
        fetchNotificationData();
        break;
      case 'security':
        fetchSecurityData();
        break;
      case 'logistics':
        fetchLogisticsData();
        break;
    }
  }, [selectedTab]);

  const renderProfileTab = () => {
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!profileData.firstName.trim() || !profileData.email.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      setProfileLoading(true);
      const response = await updateAdminProfile(profileData);
      
      if (response.message || response.data) {
        alert('Profile updated successfully!');
        // Refresh data to ensure we have the latest
        fetchProfileData();
      } else {
        throw new Error('No success response');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfilePicture = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: null
      }));
    }
  };

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset all profile changes?')) {
      fetchProfileData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className='mt-5'>
        <h3 className="text-lg font-medium text-brand_gray_dark mb-4">Personal Information</h3>
        <p className='text-gray-600'>Manage your personal details and keep your contact info up to date</p>

        {/* Profile Picture */}
        <div className="flex items-end gap-3 pb-6 mt-10">
          <div className="relative">
            {profileData.profilePicture ? (
              <img src={profileData.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center bg-gray-100 rounded-full p-2">
              <button 
                type="button"
                onClick={handleDeleteProfilePicture}
                className="text-brand_gray hover:text-red-500 transition-colors"
                title="Remove Profile Picture"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-100 rounded-full p-2">
              <button 
                type="button"
                className="text-brand_gray hover:text-blue-500 transition-colors"
                title="Change Profile Picture"
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              >
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="mt-10 flex flex-col gap-5">
          <div className='flex items-center gap-36'>
            <label className="text-sm font-medium text-brand_gray_dark">First Name</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg">
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className="w-96 px-4 py-2 rounded-lg focus:outline-none focus:border-brand_pink/50 focus:bg-white transition-all"
              />
              <SquarePen size={16} className="text-brand_gray hover:text-blue-500 transition-colors mr-4" />
            </div>
          </div>

          <div className='flex items-center gap-[11.1rem]'>
            <label className="text-sm font-medium text-brand_gray_dark">Email</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg">
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="w-96 px-4 py-2 rounded-lg focus:outline-none focus:border-brand_pink/50 focus:bg-white transition-all"
              />
              <SquarePen size={16} className="text-brand_gray hover:text-blue-500 transition-colors mr-4" />
            </div>
          </div>

          <div className='flex items-center gap-28'>
            <label className="text-sm font-medium text-brand_gray_dark">Phone number</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg">
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="w-96 px-4 py-2 rounded-lg focus:outline-none focus:border-brand_pink/50 focus:bg-white transition-all"
              />
              <SquarePen size={16} className="text-brand_gray hover:text-blue-500 transition-colors mr-4" />
            </div>
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
        <button 
          type="button"
          onClick={handleResetProfile}
          className="px-6 py-2 border border-gray-200 text-brand_gray_dark rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button 
          type="submit"
          disabled={profileLoading}
          className="px-6 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors disabled:opacity-50"
        >
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

  const renderRolesTab = () => {
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdminLoading(true);
      await addAdmin(adminFormData);
      setShowAddAdminModal(false);
      fetchAdminsData();
      setAdminFormData({ name: '', email: '', role: '' });
    } catch (error) {
      console.error('Error adding admin:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(adminId);
        fetchAdminsData();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-brand_gray_dark mb-2">Admin Users & Permissions</h3>
          <p className="text-gray-600">Manage admin accounts and their access permissions</p>
        </div>
        <button
          onClick={() => setShowAddAdminModal(true)}
          className="flex items-center gap-2 bg-brand_pink text-white px-4 py-2 rounded-lg hover:bg-brand_pink/90 transition-colors"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink mx-auto"></div>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No admin users found
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">{admin.name}</td>
                  <td className="px-4 py-3">{admin.email}</td>
                  <td className="px-4 py-3">{admin.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {admin.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <SquarePen size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Admin</h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  required
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                >
                  <option value="">Select Role</option>
                  <option value="senior">Senior</option>
                  <option value="junior">Junior</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 disabled:opacity-50"
                >
                  {adminLoading ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

  const renderNotificationsTab = () => {
    const handleNotificationUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setNotificationLoading(true);
        await updateAdminNotificationSettings(notificationSettings);
        // Show success message
      } catch (error) {
        console.error('Error updating notification settings:', error);
      } finally {
        setNotificationLoading(false);
      }
    };

    const handleNotificationChange = (key: string, value: boolean) => {
      setNotificationSettings(prev => ({
        ...prev,
        [key]: value
      }));
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-brand_gray_dark mb-2">Notification Preferences</h3>
          <p className="text-gray-600">Control how and when you receive notifications</p>
        </div>

        <form onSubmit={handleNotificationUpdate} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h4 className="font-medium text-brand_gray_dark mb-4">Email Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('emailNotifications', !notificationSettings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-brand_pink' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" className="px-6 py-2 border border-gray-200 text-brand_gray_dark rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={notificationLoading}
              className="px-6 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors disabled:opacity-50"
            >
              {notificationLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderSecurityTab = () => {
    const handleSecurityUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSecurityLoading(true);
        await updateAdminSecuritySettings(securitySettings);
        // Show success message
      } catch (error) {
        console.error('Error updating security settings:', error);
      } finally {
        setSecurityLoading(false);
      }
    };

    const handleSecurityChange = (key: string, value: string | boolean) => {
      setSecuritySettings(prev => ({
        ...prev,
        [key]: value
      }));
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-brand_gray_dark mb-2">Security Settings</h3>
          <p className="text-gray-600">Manage your account security and authentication preferences</p>
        </div>

        <form onSubmit={handleSecurityUpdate} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h4 className="font-medium text-brand_gray_dark mb-4">Authentication</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Two-Factor Authentication</label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.twoFactorAuth ? 'bg-brand_pink' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" className="px-6 py-2 border border-gray-200 text-brand_gray_dark rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={securityLoading}
              className="px-6 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors disabled:opacity-50"
            >
              {securityLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderLogisticsTab = () => {
    const handleLogisticsUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLogisticsLoading(true);
        const response = await updateLogisticsSettings(logisticsSettings);
        
        if (response.message || response.data) {
          showToast('Logistics settings updated successfully!', 'success');
        } else {
          throw new Error('No success response');
        }
      } catch (error) {
        console.error('Error updating logistics settings:', error);
        showToast('Failed to update logistics settings. Please try again.', 'error');
      } finally {
        setLogisticsLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-brand_gray_dark mb-4">Logistics Settings</h3>
          <p className='text-gray-600'>Manage your shipping and logistics preferences</p>
        </div>

        <form onSubmit={handleLogisticsUpdate} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Logistics Mode</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="logisticsMode"
                      value="auto"
                      checked={logisticsSettings.logisticsMode === 'auto'}
                      onChange={(e) => setLogisticsSettings(prev => ({ ...prev, logisticsMode: e.target.value as 'auto' | 'manual' }))}
                      className="mr-3 text-brand_pink focus:ring-brand_pink"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Automatic</span>
                      <p className="text-sm text-gray-500">Use integrated shipping providers for automatic order processing</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="logisticsMode"
                      value="manual"
                      checked={logisticsSettings.logisticsMode === 'manual'}
                      onChange={(e) => setLogisticsSettings(prev => ({ ...prev, logisticsMode: e.target.value as 'auto' | 'manual' }))}
                      className="mr-3 text-brand_pink focus:ring-brand_pink"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Manual</span>
                      <p className="text-sm text-gray-500">Handle shipping arrangements manually for each order</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* {logisticsSettings.logisticsMode === 'auto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Provider</label>
                  <select
                    value={logisticsSettings.automaticProvider}
                    onChange={(e) => setLogisticsSettings(prev => ({ ...prev, automaticProvider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                  >
                    <option value="">Select a provider</option>
                    <option value="dhl">DHL</option>
                    <option value="fedex">FedEx</option>
                    <option value="ups">UPS</option>
                    <option value="usps">USPS</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>
              )} */}

              {/* {logisticsSettings.logisticsMode === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Shipping Instructions</label>
                  <textarea
                    value={logisticsSettings.manualInstructions}
                    onChange={(e) => setLogisticsSettings(prev => ({ ...prev, manualInstructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                    placeholder="Enter instructions for manual shipping process..."
                  />
                </div>
              )} */}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Enable Logistics</h4>
                  <p className="text-sm text-gray-500">Activate logistics processing for orders</p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-brand_pink' : 'bg-gray-200'
                  }`}
                  onClick={handleIsActiveToggle}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setLogisticsSettings({
                  logisticsMode: 'auto',
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={logisticsLoading}
              className="px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 disabled:opacity-50"
            >
              {logisticsLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return renderProfileTab();
      case 'roles':
        return renderRolesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'logistics':
        return renderLogisticsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <ProtectedRoute>
      <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
        {/* Tab Navigation */}
        <div className="pl-4">
          <div className="flex items-center gap-36 p-1">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 py-2 text-sm font-medium transition-all ${selectedTab === tab.id
                    ? 'border-b-[3px] border-brand_pink text-brand_pink'
                    : 'text-brand_gray hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden -mt-1">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </ProtectedRoute>
  );
};

export default SettingsPage;
