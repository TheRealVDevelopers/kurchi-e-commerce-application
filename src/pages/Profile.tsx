import { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, LogOut, Loader2, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import AddressBook from '@/components/AddressBook';
import AccountSettings from '@/components/AccountSettings';
import WishlistPage from './Wishlist'; // Importing the page we just made to embed it
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Order {
  id: string;
  items: any[];
  amount: number;
  status: string;
  createdAt: any;
  shippingAddress?: any;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Fetch Real Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;

      setLoadingOrders(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart }, // Added Wishlist
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* --- SIDEBAR NAVIGATION --- */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-stone-400">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <CardTitle className="text-lg">{user.name || 'Valued Customer'}</CardTitle>
                <p className="text-stone-500 text-xs">{user.email}</p>
                <div className="mt-2">
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{user.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${activeTab === item.id ? "bg-stone-100 font-semibold" : "text-stone-600"}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}

                  <div className="pt-4 mt-4 border-t border-stone-100">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-3">

            {/* 1. PROFILE INFO */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={user.name || ''} readOnly className="bg-stone-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={user.email || ''} readOnly className="bg-stone-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Input defaultValue={user.role === 'business' ? 'Business Account (B2B)' : 'Personal Account'} readOnly className="bg-stone-50" />
                    </div>
                    {user.role === 'business' && (
                      <div className="space-y-2">
                        <Label>GST Number</Label>
                        <Input defaultValue={user.gstNumber || 'Not Provided'} readOnly className="bg-blue-50 border-blue-200 text-blue-800" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. ORDER HISTORY */}
            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed">
                      <Package className="h-12 w-12 mx-auto text-stone-300 mb-2" />
                      <p className="text-stone-500">No orders yet.</p>
                      <Button variant="link" onClick={() => navigate('/')}>Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:border-stone-400 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-stone-900">Order #{order.id.slice(0, 8)}</h3>
                                <Badge className={
                                  order.status === 'delivered' ? 'bg-green-600' :
                                    order.status === 'shipped' ? 'bg-blue-600' :
                                      'bg-orange-500'
                                }>
                                  {order.status.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs text-stone-500 mt-1">
                                Placed on {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Date N/A'}
                              </p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              <p className="text-lg font-bold">₹{order.amount.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-stone-600">{item.quantity}x {item.name}</span>
                                <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-2 border-t flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => navigate('/track-order')}>
                              Track Order <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. ADDRESS BOOK */}
            {activeTab === 'addresses' && <AddressBook />}

            {/* 4. WISHLIST (Embedded) */}
            {activeTab === 'wishlist' && <WishlistPage embedded />}

            {/* 5. ACCOUNT SETTINGS */}
            {activeTab === 'settings' && <AccountSettings />}

          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Profile;