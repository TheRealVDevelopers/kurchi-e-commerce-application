
import { useState } from 'react';
import { User, Heart, ShoppingCart, MapPin, CreditCard, Settings, Package, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const recentOrders = [
    { id: '#ORD001', item: 'Executive Chair', status: 'Delivered', amount: '₹15,999', date: '2024-05-20' },
    { id: '#ORD002', item: 'Modern Sofa', status: 'Shipped', amount: '₹45,999', date: '2024-05-25' },
    { id: '#ORD003', item: 'Bean Bag', status: 'Processing', amount: '₹8,999', date: '2024-05-28' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-amber-700" />
                </div>
                <CardTitle>John Doe</CardTitle>
                <p className="text-stone-600">john.doe@email.com</p>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === item.id 
                          ? "bg-amber-700 hover:bg-amber-800" 
                          : "hover:bg-stone-100"
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
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
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue="+91 9876543210" />
                    </div>
                  </div>
                  <Button className="bg-amber-700 hover:bg-amber-800">Save Changes</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{order.item}</h3>
                          <p className="text-sm text-stone-600">Order {order.id} • {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{order.amount}</p>
                          <Badge 
                            className={
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'addresses' && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Home</h3>
                          <p className="text-stone-600">123 Main Street, Sector 15<br />Gurgaon, Haryana 122001</p>
                        </div>
                        <Badge>Default</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">+ Add New Address</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Profile;
