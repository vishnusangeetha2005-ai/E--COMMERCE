'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const storeUrl = typeof window !== 'undefined' ? localStorage.getItem('storeUrl') || 'default' : 'default';

  useEffect(() => {
    api.get(`/store/${storeUrl}/products/${id}`).then(res => {
      setProduct(res.data.data.product);
      setReviews(res.data.data.reviews);
      if (res.data.data.product.sizes?.length) setSelectedSize(res.data.data.product.sizes[0]);
      if (res.data.data.product.colors?.length) setSelectedColor(res.data.data.product.colors[0]);
    }).catch(() => toast.error('Product not found'));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await api.post('/customer/cart', { productId: id, quantity, size: selectedSize, color: selectedColor });
      toast.success('Added to cart!');
    } catch { toast.error('Please login to add to cart'); }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customer/reviews', { productId: id, rating: reviewRating, comment: reviewComment });
      toast.success('Review added!');
      setReviewComment('');
      const res = await api.get(`/store/${storeUrl}/products/${id}`);
      setReviews(res.data.data.reviews);
      setProduct(res.data.data.product);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to add review'); }
  };

  if (!product) return <><Navbar /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div></>;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {product.images?.[selectedImage] ? (
                <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary-600' : 'border-transparent'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-primary-600 font-medium">{product.category}</p>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={`w-4 h-4 ${s <= product.ratings ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            </div>
            <p className="text-3xl font-bold mt-4">&#8377;{product.price}</p>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <p className="mt-2 text-sm"><span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span></p>

            {product.sizes?.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Size</label>
                <div className="flex gap-2 mt-1">
                  {product.sizes.map((s: string) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 border rounded-lg text-sm ${selectedSize === s ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 mt-1">
                  {product.colors.map((c: string) => (
                    <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 border rounded-lg text-sm ${selectedColor === c ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2"><FiMinus /></button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2"><FiPlus /></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50">
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h2>
          <form onSubmit={handleAddReview} className="card mb-6">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewRating(s)}>
                  <FiStar className={`w-6 h-6 ${s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your thoughts..." className="input-field mb-3" rows={3} />
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
          <div className="space-y-0">
            {reviews.map((review: any) => <ReviewCard key={review._id} review={review} />)}
            {reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first to review!</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
