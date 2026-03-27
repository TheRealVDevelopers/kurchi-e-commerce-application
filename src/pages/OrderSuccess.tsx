import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// Optional: We can add a confetti effect later
import Header from '@/components/Header';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');

    // Optional: Trigger a celebration effect on load
    useEffect(() => {
        // If you have a confetti library, trigger it here.
        // For now, we'll just log it.
        console.log("Order placed successfully!");
    }, []);

    return (
        <div className="min-h-screen bg-cream">
            <Header />
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-green-100 p-4 rounded-full mb-6 animate-in zoom-in duration-500">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 text-center">
                    Order Placed Successfully!
                </h1>
                <p className="text-stone-500 mb-8 text-center max-w-md">
                    Thank you for your purchase. We have received your order and are getting it ready for shipment.
                </p>

                <Card className="w-full max-w-md mb-8 border-stone-200 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <span className="text-stone-500">Order ID</span>
                            <span className="font-mono font-bold text-stone-900">#{orderId?.slice(0, 8)}</span>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-lg flex items-start gap-3">
                            <Package className="w-5 h-5 text-warm-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-stone-900">What happens next?</p>
                                <p className="text-stone-500 mt-1">
                                    You will receive an email confirmation shortly. You can track your package status in your profile.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <Link to="/track-order" className="flex-1">
                        <Button variant="outline" className="w-full h-12 border-stone-300">
                            Track Order
                        </Button>
                    </Link>
                    <Link to="/" className="flex-1">
                        <Button className="w-full h-12 bg-stone-900 hover:bg-stone-800">
                            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;