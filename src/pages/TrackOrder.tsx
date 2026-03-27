import { useState } from 'react';
import { Search, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [orderStatus, setOrderStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async () => {
        if (!orderId) return;
        setLoading(true);
        setError('');
        setOrderStatus(null);

        try {
            const docRef = doc(db, 'orders', orderId.trim());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setOrderStatus(docSnap.data());
            } else {
                setError("Order ID not found. Please check your email/SMS.");
            }
        } catch (e) { setError("Error fetching order."); }
        finally { setLoading(false); }
    };

    const steps = [
        { id: 'processing', label: 'Processing', icon: Clock },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    return (
        <div className="min-h-screen bg-cream pb-20">
            <Header />
            <div className="max-w-md mx-auto px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Track Your Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Order ID (e.g. 7Hk2...)"
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                            />
                            <Button onClick={handleTrack} className="bg-stone-900" disabled={loading}>
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>

                        {error && <div className="text-red-500 text-sm text-center flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> {error}</div>}

                        {orderStatus && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center mb-8">
                                    <p className="text-sm text-stone-500">Current Status</p>
                                    <h3 className="text-2xl font-bold uppercase text-warm-600">{orderStatus.status}</h3>
                                    <p className="text-xs text-stone-400 mt-1">Total: ₹{orderStatus.amount}</p>
                                </div>

                                <div className="relative flex justify-between items-center">
                                    {/* Connector Line */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-stone-200 -z-10" />

                                    {steps.map((step) => {
                                        const isActive =
                                            orderStatus.status === step.id ||
                                            (orderStatus.status === 'delivered' && step.id !== 'cancelled') ||
                                            (orderStatus.status === 'shipped' && step.id === 'processing');

                                        return (
                                            <div key={step.id} className="flex flex-col items-center bg-stone-50 px-2 z-10">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>
                                                    <step.icon className="w-4 h-4" />
                                                </div>
                                                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-green-700' : 'text-stone-400'}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <MobileNavigation />
        </div>
    );
};
export default TrackOrder;