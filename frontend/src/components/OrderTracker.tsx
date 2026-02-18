'use client';
import { FiCheck, FiClock, FiTruck, FiPackage, FiXCircle } from 'react-icons/fi';

interface OrderTrackerProps {
  status: string;
}

const steps = [
  { key: 'pending', label: 'Pending', icon: FiClock },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheck },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiPackage },
];

export default function OrderTracker({ status }: OrderTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
        <FiXCircle className="w-5 h-5" />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
