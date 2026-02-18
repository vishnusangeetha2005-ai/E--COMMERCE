'use client';
import { FiStar } from 'react-icons/fi';

interface ReviewCardProps {
  review: {
    _id: string;
    customerId: { name: string } | string;
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const customerName = typeof review.customerId === 'object' ? review.customerId.name : 'Customer';

  return (
    <div className="border-b border-gray-100 py-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{customerName}</span>
        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
    </div>
  );
}
