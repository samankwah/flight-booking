// src/pages/admin/OfferManagement.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/admin/DataTable';
import ExportButton from '../../components/admin/ExportButton';
import toast from 'react-hot-toast';
import { MdRefresh, MdToggleOn, MdToggleOff, MdLocalOffer } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

interface Offer {
  id: string;
  name: string;
  country: string;
  price: number;
  currency: string;
  image: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function OfferManagement() {
  const { currentUser } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchOffers();
  }, [activeFilter]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      let url = `${API_BASE_URL}/admin/offers?limit=100`;

      if (activeFilter !== 'all') {
        url += `&active=${activeFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data = await response.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (offerId: string, isActive: boolean) => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update offer status');
      }

      toast.success(`Offer ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchOffers(); // Refresh
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update offer status');
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) return;

    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast.success('Offer deleted successfully');
      fetchOffers(); // Refresh
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete offer');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      sortable: false,
      render: (value: string, row: Offer) => (
        <div className="flex items-center gap-2">
          {value ? (
            <img src={value} alt={row.name} className="w-16 h-12 rounded object-cover" />
          ) : (
            <div className="w-16 h-12 rounded bg-gray-200 flex items-center justify-center">
              <MdLocalOffer className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Destination',
      sortable: true,
      render: (value: string, row: Offer) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.country}</div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number, row: Offer) => (
        <span className="font-semibold">{row.currency} {value.toLocaleString()}</span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2">{value}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
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
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: Offer) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(row.id, row.isActive);
            }}
            className={`text-xs px-3 py-1 rounded transition ${
              row.isActive
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            {row.isActive ? <MdToggleOff className="w-4 h-4" /> : <MdToggleOn className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Special Offers Management</h1>
          <p className="text-gray-600 mt-2">Manage special travel offers and destinations</p>
        </div>
        <ExportButton endpoint="/admin/export/offers" filename="special-offers" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="all">All Offers</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>

        <button
          onClick={fetchOffers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <MdRefresh className="w-4 h-4" />
          Refresh
        </button>

        <div className="ml-auto text-sm text-gray-600">
          {offers.length} offer{offers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={offers}
        columns={columns}
        loading={loading}
        emptyMessage="No offers found"
      />
    </div>
  );
}
