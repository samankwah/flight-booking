// src/components/admin/StatusBadge.tsx
interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'application' | 'payment' | 'default';
}

export default function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');

    // Booking statuses
    if (type === 'booking' || ['confirmed', 'pending', 'cancelled', 'refunded'].includes(normalizedStatus)) {
      switch (normalizedStatus) {
        case 'confirmed':
          return { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' };
        case 'pending':
          return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
        case 'cancelled':
          return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
        case 'refunded':
          return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' };
        default:
          break;
      }
    }

    // Application statuses
    if (type === 'application' || ['submitted', 'under review', 'accepted', 'rejected', 'waitlisted'].includes(normalizedStatus)) {
      switch (normalizedStatus) {
        case 'submitted':
          return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' };
        case 'under review':
          return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' };
        case 'accepted':
          return { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' };
        case 'rejected':
          return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
        case 'waitlisted':
          return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Waitlisted' };
        default:
          break;
      }
    }

    // Payment statuses
    if (type === 'payment' || ['paid', 'completed', 'failed'].includes(normalizedStatus)) {
      switch (normalizedStatus) {
        case 'paid':
        case 'completed':
          return { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' };
        case 'pending':
          return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
        case 'failed':
          return { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' };
        case 'refunded':
          return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' };
        default:
          break;
      }
    }

    // Active/Inactive
    if (['active', 'inactive'].includes(normalizedStatus)) {
      return normalizedStatus === 'active'
        ? { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' }
        : { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' };
    }

    // Default
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status.charAt(0).toUpperCase() + status.slice(1)
    };
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
