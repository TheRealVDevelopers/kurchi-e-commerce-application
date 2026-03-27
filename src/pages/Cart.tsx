import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { Trash2, ArrowRight, Loader2, Minus, Plus } from 'lucide-react';
import { db } from '@/lib/firebase';
// --- 1. IMPORT THESE FOR STOCK LOGIC ---
import { collection, doc, writeBatch, serverTimestamp, increment, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const { user } = useApp();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const handleCheckout = async () => {
        if (!user) {
            toast.error("Please login to checkout");
            return navigate('/login');
        }
        if (cartItems.length === 0) return;
        if (!formData.phone || !formData.street) return toast.error("Please fill in address details");

        setIsCheckingOut(true);

        // --- 2. START THE ATOMIC TRANSACTION ---
        const batch = writeBatch(db);

        try {
            // A. Create the Order
            const orderRef = doc(collection(db, 'orders'));
            batch.set(orderRef, {
                userId: user.uid,
                items: cartItems,
                amount: cartTotal,
                status: 'confirmed', // Case Passed: Set to Confirmed immediately
                shippingAddress: formData,
                createdAt: serverTimestamp()
            });

            // B. Reduce Stock for each item
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                // Use increment(-quantity) to subtract from stock
                batch.update(productRef, {
                    stock: increment(-item.quantity)
                });
            }

            // C. Clear the DB Cart (Case Passed: Cart stored in DB)
            const cartSnap = await getDocs(collection(db, 'users', user.uid, 'cart'));
            cartSnap.docs.forEach(d => batch.delete(d.ref));

            // D. Commit all changes at once
            await batch.commit();

            toast.success("Order Placed Successfully!");
            navigate(`/order-success?id=${orderRef.id}`);

        } catch (e) {
            toast.error("Checkout failed. Out of stock or connection issue.");
            console.error(e);
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-cream">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] text-stone-500">
                    <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                    <Button onClick={() => navigate('/')}>Continue Shopping</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream pb-20">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Shopping Cart ({cartItems.length})</h2>
                    {cartItems.map((item: any) => (
                        <Card key={item.id}>
                            <CardContent className="p-4 flex gap-4 items-center">
                                <img src={item.image} className="w-20 h-20 object-cover rounded" />
                                <div className="flex-1">
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-stone-600">₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus className="w-3 h-3" /></Button>
                                    <span className="w-4 text-center">{item.quantity}</span>
                                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                                </div>
                                <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4" /></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <Card className="sticky top-24 shadow-lg border-t-4 border-t-warm-600">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-bold border-b pb-4">Shipping Details</h3>

                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Street Address</Label>
                                <Input value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} placeholder="House No, Street Area" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                <Input placeholder="Zip Code" value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-lg font-bold mb-4">
                                    <span>Total Amount</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <Button className="w-full bg-warm-700 hover:bg-warm-800 h-12 text-lg" onClick={handleCheckout} disabled={isCheckingOut}>
                                    {isCheckingOut ? <Loader2 className="animate-spin" /> : <>Place Order <ArrowRight className="ml-2 w-4 h-4" /></>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default Cart;