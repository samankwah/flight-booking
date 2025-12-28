// src/pages/admin/UserManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh, MdAdminPanelSettings, MdBlock } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface User {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastSignIn: string;
}

export default function UserManagement() {
  const { currentUser, refreshAdminStatus } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    const action = isCurrentlyAdmin ? 'revoke admin access from' : 'grant admin access to';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/admin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin: !isCurrentlyAdmin })
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      toast.success(`Admin status updated successfully`);

      // If we're modifying our own account, refresh admin status
      if (userId === currentUser.uid) {
        await refreshAdminStatus();
      }

      fetchUsers(); // Refresh
    } catch (error) {
      console.error('Toggle admin error:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleToggleDisabled = async (userId: string, isCurrentlyDisabled: boolean) => {
    const action = isCurrentlyDisabled ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${action} this user account?`)) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/disable`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disabled: !isCurrentlyDisabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success(`User account ${action}d successfully`);
      fetchUsers(); // Refresh
    } catch (error) {
      console.error('Toggle disabled error:', error);
      toast.error('Failed to update user status');
    }
  };

  const columns = [
    {
      key: 'displayName',
      label: 'Name',
      sortable: true,
      render: (value: string, row: User) => (
        <div>
          <div className="font-medium">{value || 'N/A'}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'isAdmin',
      label: 'Role',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value && <MdAdminPanelSettings className="w-3 h-3" />}
          {value ? 'Admin' : 'User'}
        </span>
      )
    },
    {
      key: 'disabled',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {value && <MdBlock className="w-3 h-3" />}
          {value ? 'Disabled' : 'Active'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'lastSignIn',
      label: 'Last Login',
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Never'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: User) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAdmin(row.uid, row.isAdmin);
            }}
            disabled={row.uid === currentUser?.uid}
            className={`text-xs px-3 py-1 rounded transition ${
              row.isAdmin
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={row.uid === currentUser?.uid ? 'Cannot modify your own admin status' : ''}
          >
            {row.isAdmin ? 'Revoke Admin' : 'Make Admin'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDisabled(row.uid, row.disabled);
            }}
            disabled={row.uid === currentUser?.uid}
            className={`text-xs px-3 py-1 rounded transition ${
              row.disabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={row.uid === currentUser?.uid ? 'Cannot disable your own account' : ''}
          >
            {row.disabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage user accounts and permissions</p>
          </div>
          <ExportButton endpoint="/admin/export/users" filename="users" />
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4 md:mb-6 flex flex-wrap gap-3 md:gap-4 items-center">
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>

        <div className="ml-auto text-sm text-gray-600">
          {users.length} user{users.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="No users found"
      />
    </div>
  );
}
