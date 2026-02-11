import { Minus, Plus, Trash2, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MobileNavigation from '@/components/MobileNavigation';
import { useCart } from '@/context/CartContext'; // Import context
import { Link } from 'react-router-dom';

const Cart = () => {
  // Use the Context instead of local state
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  const shipping = 499;
  const total = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-bright-red-700 to-bright-red-700 bg-clip-text text-transparent">
              🪑 KURCHI
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-bright-red-600">
                  {cartCount}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
           <div className="text-center py-20">
             <h2 className="text-2xl font-semibold text-stone-600">Your cart is empty</h2>
             <Link to="/">
               <Button className="mt-4 bg-bright-red-700 text-white">Continue Shopping</Button>
             </Link>
           </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-900 mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-stone-900">₹{item.price.toLocaleString()}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-stone-500 line-through">₹{item.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹{shipping.toLocaleString()}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-tomato-700 hover:bg-tomato-800 text-white text-lg py-3">
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Cart;