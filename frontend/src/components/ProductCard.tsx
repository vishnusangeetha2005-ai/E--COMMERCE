'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    ratings: number;
    numReviews: number;
    stock: number;
    category: string;
  };
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      <Link href={`/products/${product._id}`}>
        <div className="relative aspect-square bg-gray-100">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-primary-600 font-medium mb-1">{product.category}</p>
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 truncate hover:text-primary-600">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{product.ratings} ({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">&#8377;{product.price}</span>
          <div className="flex gap-2">
            {onToggleWishlist && (
              <button onClick={() => onToggleWishlist(product._id)} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500">
                <FiHeart className="w-4 h-4" />
              </button>
            )}
            {onAddToCart && product.stock > 0 && (
              <button onClick={() => onAddToCart(product._id)} className="p-2 rounded-full hover:bg-primary-50 text-gray-400 hover:text-primary-600">
                <FiShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
