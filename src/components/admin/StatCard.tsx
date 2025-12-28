// src/components/admin/StatCard.tsx
import { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    gradient: 'from-green-500 to-green-600'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600'
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600'
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  cyan: {
    bg: 'bg-cyan-100',
    icon: 'text-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600'
  }
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  trend
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">{label}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{value}</p>

          {trend && (
            <div className="mt-1 md:mt-2 flex items-center gap-1">
              <span
                className={`text-xs md:text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md flex-shrink-0 ml-2`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
