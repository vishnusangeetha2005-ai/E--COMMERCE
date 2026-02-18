'use client';
import Image from 'next/image';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

interface CartItemProps {
  item: {
    _id: string;
    product: { _id: string; name: string; price: number; images: string[]; stock: number };
    quantity: number;
    size: string;
    color: string;
  };
  onUpdate: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.product.images?.[0] ? (
          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
        <p className="text-sm text-gray-500">
          {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
        </p>
        <p className="font-semibold text-gray-900 mt-1">&#8377;{item.product.price}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button onClick={() => onRemove(item._id)} className="text-red-400 hover:text-red-600">
          <FiTrash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button onClick={() => onUpdate(item._id, Math.max(1, item.quantity - 1))} className="px-2 py-1 hover:bg-gray-100">
            <FiMinus className="w-3 h-3" />
          </button>
          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
          <button onClick={() => onUpdate(item._id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100" disabled={item.quantity >= item.product.stock}>
            <FiPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
