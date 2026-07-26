'use client'

import { useAuth } from '@/contexts/AuthContext';
import { PickupAddress } from '@/lib/admin-types';
import {
  addAdmin,
  deleteAdmin,
  fetchAdminProfile,
  fetchDefaultPermissions,
  fetchPermissions,
  fundWallet,
  getAllAdmins,
  getLogisticsSettings,
  getWalletBalance,
  updateAdminNotificationSettings, updateAdminPermission, updateAdminProfile, updateAdminSecuritySettings,
  updateLogisticsSettings,
  updateLogisticsShippingAddress
} from '@/lib/adminapi';
import { AlertCircle, Bell, CheckCircle, Info, Loader2, Lock, Package, Plus, RefreshCcw, Shield, SquarePen, Trash2, User, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

// Static, has no dependency on component state/props — hoisted so it isn't recreated every render
const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'roles', label: 'Roles & Access Control', icon: Shield, },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'logistics', label: 'Logistics', icon: Package }
];

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  active?: boolean;
  permissions?: string[];
}

interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

const SettingsPage = () => {
  const { user } = useAuth()
  const [_selectedPeriod, _setSelectedPeriod] = useState('This Week');
  const [selectedTab, setSelectedTab] = useState('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '' as string | null
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Roles & Access state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [_permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    role: '',
    // permissions: []
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  // New admin's role-based default permissions, toggleable on/off
  const [newAdminDefaultPermissions, setNewAdminDefaultPermissions] = useState<string[]>([]);
  const [newAdminSelectedPermissions, setNewAdminSelectedPermissions] = useState<string[]>([]);
  const [defaultPermissionsLoading, setDefaultPermissionsLoading] = useState(false);

  // Edit admin permissions state
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  // The selected admin's role's default permissions - the only ones that can't be unchecked
  const [editDefaultPermissions, setEditDefaultPermissions] = useState<string[]>([]);
  const [editDefaultPermissionsLoading, setEditDefaultPermissionsLoading] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);

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
  const [pickupAddress, setPickUpAddress] = useState<PickupAddress
  >({
    fullName: "",
    phone: "",
    country: "",
    postalCode: "",
    state: "",
    street: "",
    city: "",
  })



  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [pickupAddressLoading, setPickupAddressLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<{
    currency: string;
    balance: number;
    amount: number;
  }>({
    currency: "NGN",
    balance: 0,
    amount: 0
  });
  const [walletLoadingStates, setWalletLoadingStates] = useState({ get: false, post: false });
  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Data fetching functions
  // Wrapped in useCallback with stable (empty) deps so the tab-change effect
  // below only re-runs when the tab actually changes, not on every render.
  const fetchProfileData = useCallback(async () => {
    try {
      setProfileLoading(true);
      const response = await fetchAdminProfile();
      if (response.data) {
        setProfileData({
          name: response.data.name!,
          email: response.data.email || '',
          phone: "",
          profilePicture: ""

        });
        if (response.data.pickupAddress) {
          setPickUpAddress(response.data.pickupAddress)
        }

      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Show error message to user
      alert('Failed to load profile data. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchWalletBalance = useCallback(async () => {
    setWalletLoadingStates(prev => ({ ...prev, get: true }))
    try {
      const req = await getWalletBalance();

      setWalletBalance(prev => {
        const walletMessage = req.message ?? { currency: prev.currency, balance: prev.balance };
        return { ...prev, currency: walletMessage.currency, balance: walletMessage.balance, amount: 0 };
      })

    } catch (error) {
      console.error('Error fetching balance:', error);
      // Show error message to user
      alert('Failed to load balance data. Please try again.');
    } finally {
      setWalletLoadingStates(prev => ({ ...prev, get: false }))

    }

  }, []);

  const fetchAdminsData = useCallback(async () => {
    try {
      setAdminLoading(true);
      const [adminsResponse, permissionsResponse] = await Promise.all([
        getAllAdmins(),
        fetchPermissions()
      ]);

      if (adminsResponse.message && Array.isArray(adminsResponse.message)) {
        setAdmins(adminsResponse.message as unknown as AdminUser[]);
      } else if (adminsResponse.data) {
        setAdmins(adminsResponse.data as unknown as AdminUser[]);
      }
      if (permissionsResponse.data) {
        // Handle the API response structure with allPermissions array
        const permissionsData = permissionsResponse.data as unknown as { allPermissions?: PermissionItem[] };
        if (Array.isArray(permissionsData.allPermissions)) {
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
  }, []);

  const fetchNotificationData = useCallback(async () => {
    try {
      setNotificationLoading(true);
      // This would need to be implemented in the API
      // For now, using default values
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  const fetchSecurityData = useCallback(async () => {
    try {
      setSecurityLoading(true);
      // This would need to be implemented in the API
      // For now, using default values
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setSecurityLoading(false);
    }
  }, []);

  const fetchLogisticsData = useCallback(async () => {
    try {
      setLogisticsLoading(true);
      const response = await getLogisticsSettings();

      const mode = (response as unknown as { logisticsMode?: 'auto' | 'manual' }).logisticsMode
        || response.data?.logisticsMode
        || 'auto';
      setLogisticsSettings({
        logisticsMode: mode,
      });
    } catch (error) {
      console.error('Error fetching logistics settings:', error);
    } finally {
      setLogisticsLoading(false);
    }
  }, []);


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
        fetchWalletBalance();

        break;
    }
  }, [selectedTab, fetchProfileData, fetchAdminsData, fetchNotificationData, fetchSecurityData, fetchLogisticsData, fetchWalletBalance]);

  const renderProfileTab = () => {
    const handleProfileUpdate = async (e: React.FormEvent) => {

      e.preventDefault();

      // Validate form data
      if (!profileData.name.trim() || !profileData.email.trim()) {
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
        const response = await updateAdminProfile({ name: profileData.name.trim() });

        if (response.status) {
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

    const _handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const _handleDeleteProfilePicture = () => {
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
            {/* <div className="relative">
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
          </div> */}
            {/* <div className="flex items-center justify-center gap-2">
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
            </div> */}
          </div>

          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">
            <div className='flex items-center gap-6'>
              <label className="text-sm font-medium text-brand_gray_dark w-40 shrink-0">Name</label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-lg">
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-96 px-4 py-2 rounded-lg focus:outline-none focus:border-brand_pink/50 focus:bg-white transition-all"
                />
                <SquarePen size={16} className="text-brand_gray hover:text-blue-500 transition-colors mr-4" />
              </div>
            </div>

            <div className='flex items-center gap-6'>
              <label className="text-sm font-medium text-brand_gray_dark w-40 shrink-0">Email</label>
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
    const resetAddAdminState = () => {
      setShowAddAdminModal(false);
      setAdminFormData({ name: '', email: '', role: '' });
      setNewAdminDefaultPermissions([]);
      setNewAdminSelectedPermissions([]);
    };

    const handleAddAdminRoleChange = async (role: string) => {
      setAdminFormData(prev => ({ ...prev, role }));
      if (!role) {
        setNewAdminDefaultPermissions([]);
        setNewAdminSelectedPermissions([]);
        return;
      }
      try {
        setDefaultPermissionsLoading(true);
        const res = await fetchDefaultPermissions(role);
        const defaults = res.message || res.data || [];
        setNewAdminDefaultPermissions(defaults);
        // Default permissions start checked, but remain toggleable
        setNewAdminSelectedPermissions(defaults);
      } catch (error) {
        console.error('Error fetching default permissions:', error);
        setNewAdminDefaultPermissions([]);
        setNewAdminSelectedPermissions([]);
      } finally {
        setDefaultPermissionsLoading(false);
      }
    };

    const toggleNewAdminPermission = (permission: string) => {
      setNewAdminSelectedPermissions(prev =>
        prev.includes(permission)
          ? prev.filter(p => p !== permission)
          : [...prev, permission]
      );
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setAdminLoading(true);
        await addAdmin({
          ...adminFormData,
          permissions: newAdminSelectedPermissions,
        });
        resetAddAdminState();
        fetchAdminsData();
      } catch (error) {
        console.error('Error adding admin:', error);
      } finally {
        setAdminLoading(false);
      }
    };

    const handleDeleteAdmin = (admin: AdminUser) => {
      setAdminToDelete(admin);
      setShowDeleteAdminModal(true);
    };

    const confirmDeleteAdmin = async () => {
      if (!adminToDelete?._id) return;
      try {
        setIsDeletingAdmin(true);
        await deleteAdmin(adminToDelete._id);
        showToast('Admin deleted successfully', 'success');
        fetchAdminsData();
      } catch (error: unknown) {
        console.error('Error deleting admin:', error);
        showToast(error instanceof Error ? error.message : 'Failed to delete admin', 'error');
      } finally {
        setIsDeletingAdmin(false);
        setShowDeleteAdminModal(false);
        setAdminToDelete(null);
      }
    };

    const resetEditAdminState = () => {
      setShowEditAdminModal(false);
      setSelectedAdmin(null);
      setEditPermissions([]);
      setEditDefaultPermissions([]);
    };

    const handleEditAdmin = async (admin: AdminUser) => {
      setSelectedAdmin(admin);
      setEditPermissions(admin.permissions || []);
      setEditIsActive(admin.active!);
      setEditDefaultPermissions([]);
      setShowEditAdminModal(true);
      try {
        setEditDefaultPermissionsLoading(true);
        const res = await fetchDefaultPermissions(admin.role);
        setEditDefaultPermissions(res.message || res.data || []);
      } catch (error) {
        console.error('Error fetching default permissions:', error);
      } finally {
        setEditDefaultPermissionsLoading(false);
      }
    };

    const togglePermission = (permission: string) => {
      setEditPermissions(prev =>
        prev.includes(permission)
          ? prev.filter(p => p !== permission)
          : [...prev, permission]
      );
    };

    const handleUpdatePermissions = async (e: React.FormEvent) => {
      console.log("Hiiii");
      e.preventDefault();
      if (!selectedAdmin) return;
      try {
        setIsUpdatingPermissions(true);
        await updateAdminPermission(selectedAdmin._id, {
          name: selectedAdmin.name,
          email: selectedAdmin.email,
          role: selectedAdmin.role,
          permissions: editPermissions,
          active: editIsActive,
        });
        showToast('Admin updated', 'success');
        resetEditAdminState();
        fetchAdminsData();
      } catch (error: unknown) {
        console.error('Error updating admin permissions:', error);
        showToast(error instanceof Error ? error.message : 'Failed to update permissions', 'error');
      } finally {
        setIsUpdatingPermissions(false);
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.active !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {admin.active !== false ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Permissions"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Admin"
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
        {showAddAdminModal && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Admin</h3>
                <button
                  onClick={resetAddAdminState}
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
                    onChange={(e) => handleAddAdminRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_pink"
                  >
                    <option value="">Select Role</option>
                    <option value="senior">Senior</option>
                    <option value="junior">Junior</option>
                  </select>
                </div>

                {adminFormData.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                    {defaultPermissionsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading default permissions...
                      </div>
                    ) : newAdminDefaultPermissions.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">No default permissions for this role</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                        {newAdminDefaultPermissions.map((permission) => {
                          const isChecked = newAdminSelectedPermissions.includes(permission);
                          return (
                            <label
                              key={permission}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleNewAdminPermission(permission)}
                                className="accent-brand_pink"
                              />
                              <span className="capitalize truncate">{permission.replace(/_/g, ' ')}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetAddAdminState}
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
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteAdminModal && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <span>Delete Admin User</span>
                </h3>
                <button
                  onClick={() => { setShowDeleteAdminModal(false); setAdminToDelete(null); }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <p className="text-sm text-brand_gray">
                  Are you sure you want to delete this administrator?
                </p>
                <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
                  This action is permanent, cannot be undone, and will immediately revoke all access privileges for &quot;{adminToDelete?.name || 'Unknown Admin'}&quot; ({adminToDelete?.email || 'No email'}).
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteAdminModal(false); setAdminToDelete(null); }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAdmin}
                  disabled={isDeletingAdmin}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isDeletingAdmin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Admin'
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Admin Modal */}
        {showEditAdminModal && selectedAdmin && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900">Edit Admin</h3>
                <button
                  onClick={resetEditAdminState}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{selectedAdmin.name} &middot; {selectedAdmin.email}</p>

              <form onSubmit={handleUpdatePermissions}>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-xs text-gray-500">{editIsActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsActive ? 'bg-brand_pink' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                {editDefaultPermissionsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2 mb-6">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading default permissions...
                  </div>
                ) : editDefaultPermissions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2 mb-6">No default permissions for this role</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 mb-6">
                    {editDefaultPermissions.map((permission) => {
                      const isChecked = editPermissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(permission)}
                            className="accent-brand_pink"
                          />
                          <span className="capitalize truncate">{permission.replace(/_/g, ' ')}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetEditAdminState}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPermissions}
                    className="flex-1 px-4 py-2 bg-brand_pink hover:bg-brand_pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingPermissions ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Permissions'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.emailNotifications ? 'bg-brand_pink' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'bg-brand_pink' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
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



    const handlePickupAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      setPickupAddressLoading(true);
      try {
        const response = await updateLogisticsShippingAddress({ shippingAddress: pickupAddress });
        if (response.message || response.data) {
          showToast('Pickup address updated successfully!', 'success');
        } else {
          throw new Error('No success response');
        }
      } catch (err) {
        console.error('Error updating pickup address:', err);
        showToast('Failed to update pickup address. Please try again.', 'error');
      } finally {
        setPickupAddressLoading(false);
      }
    }

    const updateInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPickUpAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleFundWallet = async (e: React.FormEvent) => {
      e.preventDefault();

      setWalletLoadingStates(prev => ({ ...prev, post: true }));
      try {
        const response = await fundWallet({ amount: walletBalance.amount });

        if (response.message || response.data) {
          const paymentUrl = response.message?.data?.payment_url;

          if (paymentUrl) {
            window.location.href = paymentUrl;
            return;
          }

          throw new Error(response?.error || "Unable to initialize payment");
        } else {
          throw new Error(response.error);
        }
      } catch (err) {
        console.error('Error updating pickup address:', err);
        showToast(err instanceof Error ? err.message : String(err), "error");
      } finally {
        setWalletLoadingStates(prev => ({ ...prev, post: false }));
      }
    };

    return (
      <div className="space-y-6 h-[400px] overflow-auto">

        {walletLoadingStates.get ? <WalletSkeleton /> : <div className="">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-1.5">
              Wallet
            </h3>
            <p className="text-sm text-gray-500">
              Fund your wallet to pay for shipping  fees
            </p>
          </div>

          <div className="bg-white border border-gray-200/70 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-1.5">
                  Available balance
                </p>
                <div className='flex items-center gap-3'>
                  <p className="text-3xl font-semibold text-gray-900 tracking-tight">
                    {walletBalance.balance.toLocaleString("en-NG", {
                      style: "currency",
                      currency: walletBalance.currency,
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </p>

                  <RefreshCcw size={16} className='cursor-pointer' onClick={() => {
                    fetchWalletBalance();

                  }} />
                </div>
              </div>
            </div>

            <form onSubmit={handleFundWallet} className="space-y-4" autoComplete='off'>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    ₦
                  </span>
                  <input
                    type="number"
                    name="amount"
                    min="0"
                    value={walletBalance.amount === 0 ? "" : walletBalance.amount}
                    onChange={(e) => setWalletBalance(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="0.00"
                    className="w-full h-11 pl-7 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={walletLoadingStates.post}
                className="w-full sm:w-auto px-5 h-11 bg-brand_pink text-white text-sm font-medium rounded-xl shadow-sm hover:bg-brand_pink/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-150"
              >
                {walletLoadingStates.post ? "Processing…" : "Fund wallet"}
              </button>
            </form>
          </div>
        </div>}
        <hr />

        <div>
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

        <hr />
        <div className="">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-1.5">
              Pickup Address
            </h3>
            <p className="text-sm text-gray-500">
              Update and manage where your products get picked up
            </p>
          </div>

          <form onSubmit={handlePickupAddress} className="space-y-6">
            <div className="bg-white border border-gray-200/70 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your fullname"
                    value={pickupAddress.fullName}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={pickupAddress.phone}
                    onChange={updateInputs}
                    placeholder="Enter your phone number"
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={pickupAddress.street}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={pickupAddress.city}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={pickupAddress.state}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={pickupAddress.country}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Postal code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={pickupAddress.postalCode}
                    onChange={updateInputs}
                    className="w-full h-11 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:bg-white focus:border-brand_pink focus:ring-4 focus:ring-brand_pink/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pickupAddressLoading}
                className="px-5 h-11 bg-brand_pink text-white text-sm font-medium rounded-xl shadow-sm hover:bg-brand_pink/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-150"
              >
                {pickupAddressLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>



      </div>
    );
  };

  const canManageAdmins =
    user?.permissions?.includes("all") ||
    user?.permissions?.includes("manage_admins");
  const isSuperAdmin = user?.role === "super";

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return renderProfileTab();
      case 'roles':
        return canManageAdmins && renderRolesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'logistics':
        return isSuperAdmin && renderLogisticsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <>
      <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
        {/* Tab Navigation */}
        <div className="pl-4">
          <div className="flex items-center gap-36 p-1">
            {TABS.map((tab) => {
              if (tab.id === "roles" && !canManageAdmins) {
                return;
              }

              if (tab.id === "logistics" && !isSuperAdmin) {
                return;
              }
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
    </>
  );
};

function WalletSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-1.5">
          Wallet
        </h3>
        <p className="text-sm text-gray-500">
          Fund your wallet to pay for shipping fees
        </p>
      </div>

      <div className="bg-white border border-gray-200/70 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
          <div>
            <div className="h-[13px] w-28 bg-gray-200 rounded mb-2.5" />
            <div className="h-9 w-40 bg-gray-200 rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="h-[13px] w-16 bg-gray-200 rounded mb-2.5" />
            <div className="h-11 w-full bg-gray-200 rounded-xl" />
          </div>

          <div className="h-11 w-full sm:w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;
