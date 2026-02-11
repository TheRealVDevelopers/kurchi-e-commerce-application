import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Ensure you have Shadcn Dialog installed
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, X, ChevronRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Product } from '@/context/ProductModalContext';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal = ({ product, isOpen, onClose }: ProductDetailsModalProps) => {
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState('');

  // When product opens, set the main image as active
  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) return null;

  // Combine main image + gallery into one list for the thumbnails
  const allImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image];

  const handleAddToCart = () => {
    addToCart({ 
        ...product, 
        // Use sale price if it exists
        price: product.salePrice || product.price,
        quantity: 1 
    });
    toast.success(`Added ${product.name} to cart`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-2xl gap-0 border-0">
        
        {/* Screen Reader Accessibility */}
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.description}</DialogDescription>

        <div className="grid md:grid-cols-2 h-[80vh] md:h-[600px]">
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="bg-stone-100 p-6 flex flex-col h-full">
            {/* Main Active Image */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-white shadow-sm mb-4">
               <img 
                 src={activeImage} 
                 alt={product.name} 
                 className="absolute inset-0 w-full h-full object-contain p-4"
               />
               {product.salePrice && (
                 <Badge className="absolute top-4 left-4 bg-red-600 text-white">SALE</Badge>
               )}
            </div>

            {/* Thumbnails Scrollbar */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allImages.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                activeImage === img ? 'border-stone-900 ring-1 ring-stone-900' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="p-8 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-stone-900 mb-2">{product.name}</h2>
                    <Badge variant="secondary" className="bg-stone-100 text-stone-600 hover:bg-stone-200">
                        {product.category}
                    </Badge>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-stone-500" />
                </button>
            </div>

            <div className="mt-6 space-y-4 flex-1">
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-stone-900">
                        ₹{(product.salePrice || product.price).toLocaleString()}
                    </span>
                    {product.salePrice && (
                        <span className="text-xl text-stone-400 line-through">
                            ₹{product.price.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="prose prose-stone">
                    <p className="text-stone-600 leading-relaxed text-lg">
                        {product.description}
                    </p>
                </div>

                <div className="py-4 border-t border-b border-stone-100 my-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" /> In Stock & Ready to Ship
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Check className="w-4 h-4" /> 1 Year Warranty Included
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4">
                <Button 
                    onClick={handleAddToCart}
                    className="w-full h-14 text-lg bg-stone-900 hover:bg-stone-800 rounded-xl"
                >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};