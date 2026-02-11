import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900">Order Placed!</h1>
        <p className="text-stone-600 text-lg">
          Thank you for your purchase. We have received your order and will begin processing it shortly.
        </p>
        <div className="pt-6 space-y-3">
          <Link to="/profile">
            <Button variant="outline" className="w-full border-stone-300">View My Orders</Button>
          </Link>
          <Link to="/">
            <Button className="w-full bg-bright-red-700 hover:bg-bright-red-800">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;