import { useState, useEffect } from 'react';
import { User, Package, MapPin, CreditCard, Settings, HelpCircle, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AddressBook from '@/components/AddressBook';
import AccountSettings from '@/components/AccountSettings';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext'; // <--- Connects to Real User
import { db } from '@/lib/firebase'; // <--- Connects to Real DB
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Define what an Order looks like coming from DB
interface Order {
  id: string;
  items: any[];
  amount: number;
  status: string;
  createdAt: any;
  orderType: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp(); // Get real user
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch Real Orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      
      setLoadingOrders(true);
      try {
        // Query: "Give me orders where userId equals MY ID"
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
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) return null; // Prevent flash of content

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-bright-red-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-bright-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-bright-red-700" />
                  )}
                </div>
                <CardTitle>{user.name || 'Valued Customer'}</CardTitle>
                <p className="text-stone-600 text-sm">{user.email}</p>
                {user.role === 'business' && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Business Account
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${activeTab === item.id
                        ? "bg-bright-red-700 hover:bg-bright-red-800 text-white"
                        : "hover:bg-stone-100"
                        }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-stone-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input defaultValue={user.name || ''} readOnly className="bg-stone-50" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={user.email || ''} readOnly className="bg-stone-50" />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input defaultValue={user.role.toUpperCase()} readOnly className="bg-stone-50" />
                    </div>
                    {/* Only show GST for business users */}
                    {user.role === 'business' && (
                         <div>
                            <Label>GST Number</Label>
                            <Input defaultValue={user.gstNumber || 'N/A'} readOnly className="bg-blue-50 border-blue-200" />
                         </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-bright-red-600" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-stone-500">
                        No orders found. Time to go shopping!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-stone-900">Order #{order.id.slice(0, 8)}</h3>
                                {order.orderType === 'B2B' && <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px]">B2B</Badge>}
                            </div>
                            <p className="text-sm text-stone-500">
                                {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-stone-600 mt-1">
                                {order.items.length} item(s): {order.items.map(i => i.name).join(', ')}
                            </p>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="font-bold text-lg">₹{order.amount.toLocaleString()}</p>
                            <Badge
                              className={
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* REPLACE THIS SECTION */}
{activeTab === 'addresses' && (
  <AddressBook />
)}

{/* REPLACE THIS SECTION */}
{activeTab === 'settings' && (
  <AccountSettings />
)}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Profile;