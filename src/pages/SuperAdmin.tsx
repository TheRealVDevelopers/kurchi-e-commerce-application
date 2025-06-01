
import { useState } from 'react';
import { Package, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Eye, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';

const SuperAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      name: 'Ergonomic Office Chair',
      category: 'office',
      price: 25999,
      description: 'Premium ergonomic office chair with lumbar support',
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop',
      adminName: 'John Admin',
      requestedAt: '2024-06-01T10:00:00Z'
    }
  ]);

  const salesData = [
    { month: 'Jan', sales: 1200000, orders: 45, customers: 120 },
    { month: 'Feb', sales: 1800000, orders: 67, customers: 180 },
    { month: 'Mar', sales: 2200000, orders: 89, customers: 220 },
    { month: 'Apr', sales: 1950000, orders: 72, customers: 195 },
    { month: 'May', sales: 2800000, orders: 98, customers: 280 },
    { month: 'Jun', sales: 3200000, orders: 112, customers: 320 }
  ];

  const productCategories = [
    { name: 'Office Chairs', value: 35, color: '#D97706' },
    { name: 'Sofas', value: 25, color: '#059669' },
    { name: 'Recliners', value: 20, color: '#7C3AED' },
    { name: 'Dining', value: 12, color: '#DC2626' },
    { name: 'Others', value: 8, color: '#0891B2' }
  ];

  const topProducts = [
    { name: 'Executive Leather Chair', sales: 156, revenue: 2965000, rating: 4.8 },
    { name: 'Modern Sectional Sofa', sales: 89, revenue: 4981000, rating: 4.9 },
    { name: 'Ergonomic Desk Chair', sales: 124, revenue: 3224000, rating: 4.7 },
    { name: 'Luxury Recliner', sales: 67, revenue: 2211000, rating: 4.6 }
  ];

  const dailyStats = [
    { day: 'Mon', revenue: 45000, orders: 12 },
    { day: 'Tue', revenue: 52000, orders: 15 },
    { day: 'Wed', revenue: 48000, orders: 13 },
    { day: 'Thu', revenue: 61000, orders: 18 },
    { day: 'Fri', revenue: 55000, orders: 16 },
    { day: 'Sat', revenue: 58000, orders: 17 },
    { day: 'Sun', revenue: 43000, orders: 11 }
  ];

  const handleApproveRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleRejectRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-stone-600 text-lg">Monitor sales, manage products, and approve admin requests</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">₹32,45,000</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">483</div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">2,345</div>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.7% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Award className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{pendingRequests.length}</div>
                  <p className="text-xs text-orange-600">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>Revenue and orders for the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#D97706" fill="#FED7AA" name="Revenue (₹)" />
                    <Area type="monotone" dataKey="orders" stackId="2" stroke="#059669" fill="#A7F3D0" name="Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales Trend</CardTitle>
                  <CardDescription>Revenue and order trends over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#D97706" name="Sales (₹)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>Distribution of products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customer acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="customers" stroke="#7C3AED" strokeWidth={3} name="New Customers" dot={{ fill: '#7C3AED', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best selling products by units and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-6 border rounded-xl bg-gradient-to-r from-white to-stone-50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                          <span className="text-lg font-bold text-amber-700">#{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-stone-800">{product.name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-stone-600">{product.sales} units sold</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-800 mt-1">Best Seller</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {/* Pending Product Requests */}
            {pendingRequests.length > 0 ? (
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-amber-800">Pending Product Requests</CardTitle>
                  <CardDescription>Review and approve/reject product requests from admins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-6 border rounded-xl bg-white shadow-sm">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={request.image} 
                            alt={request.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-stone-800">{request.name}</h3>
                            <p className="text-sm text-stone-600 mt-1">{request.description}</p>
                            <p className="text-xl font-bold text-amber-700 mt-2">₹{request.price.toLocaleString()}</p>
                            <p className="text-xs text-stone-500 mt-1">Requested by: {request.adminName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50">
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Product Request Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img src={request.image} alt={request.name} className="w-full h-48 object-cover rounded-lg" />
                                <div>
                                  <h3 className="text-lg font-semibold">{request.name}</h3>
                                  <p className="text-stone-600">{request.description}</p>
                                  <p className="text-xl font-bold text-amber-700">₹{request.price.toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleRejectRequest(request.id)}
                                    variant="destructive" 
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-stone-400 mb-4" />
                  <h3 className="text-lg font-semibold text-stone-600 mb-2">No Pending Requests</h3>
                  <p className="text-stone-500">All product requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default SuperAdmin;
