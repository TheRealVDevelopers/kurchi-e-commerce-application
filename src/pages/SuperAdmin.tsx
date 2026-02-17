import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, TrendingUp, Shield, Trash2, Percent, ArrowRight, Activity, Truck, Settings, BarChart3, ShoppingBag,
    Star, UserCheck, UserX, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useApp, UserRole } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface Order {
    id: string;
    amount: number;
    createdAt: any;
    status: string;
    items: any[];
}

interface AnalyticsData {
    totalRevenue: number;
    lastMonthRevenue: number;
    totalOrders: number;
    activeOrders: number;
    totalUsers: number;
    newUsers: number;
    topProduct: string;
    monthlyData: { month: string; amount: number }[];
}

const SuperAdmin = () => {
    const { user } = useApp();

    // Data State
    const [requests, setRequests] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [apiKeys, setApiKeys] = useState({ logisticsKey: '', mapKey: '' });

    // Stats State
    const [stats, setStats] = useState<AnalyticsData>({
        totalRevenue: 0, lastMonthRevenue: 0, totalOrders: 0, activeOrders: 0,
        totalUsers: 0, newUsers: 0, topProduct: 'N/A', monthlyData: []
    });

    const [isLoading, setIsLoading] = useState(true);

    // Dialog States
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [offerPrice, setOfferPrice] = useState('');

    // --- 1. DATA FETCHING (Runs ONCE) ---
    useEffect(() => {
        // Products
        const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
            setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Users (No ordering to ensure we get all legacy users too)
        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        });

        // Requests
        const unsubRequests = onSnapshot(query(collection(db, 'product_requests'), where('status', '==', 'pending')), (snap) => {
            setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Orders
        const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
            setIsLoading(false);
        });

        return () => {
            unsubProducts();
            unsubUsers();
            unsubRequests();
            unsubOrders();
        };
    }, []); // <--- Dependency array is empty = Stable Connection

    // --- 2. ANALYTICS CALCULATION (Runs when Data Changes) ---
    useEffect(() => {
        if (orders.length > 0 || allUsers.length > 0) {
            calculateAnalytics(orders, allUsers);
        }
    }, [orders, allUsers]);

    const calculateAnalytics = (ordersData: Order[], usersData: any[]) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        let totalRev = 0;
        let lastMonthRev = 0;
        let activeCount = 0;
        const productSales: Record<string, number> = {};
        const monthlyRevenueMap: Record<string, number> = {};

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyRevenueMap[monthName] = 0;
        }

        ordersData.forEach(order => {
            totalRev += order.amount;
            const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
            const orderMonth = orderDate.getMonth();
            const monthName = orderDate.toLocaleString('default', { month: 'short' });

            if (orderMonth === lastMonth) lastMonthRev += order.amount;
            if (monthlyRevenueMap[monthName] !== undefined) monthlyRevenueMap[monthName] += order.amount;
            if (['processing', 'shipped'].includes(order.status)) activeCount++;

            if (order.items) {
                order.items.forEach((item: any) => {
                    productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 1);
                });
            }
        });

        const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
        const newUsersCount = usersData.filter(u => {
            if (!u.createdAt) return false;
            const userDate = u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : new Date();
            return userDate.getMonth() === currentMonth;
        }).length;

        setStats({
            totalRevenue: totalRev,
            lastMonthRevenue: lastMonthRev,
            totalOrders: ordersData.length,
            activeOrders: activeCount,
            totalUsers: usersData.length,
            newUsers: newUsersCount,
            topProduct,
            monthlyData: Object.entries(monthlyRevenueMap).map(([month, amount]) => ({ month, amount }))
        });
    };

    // --- ACTIONS ---

    const handleApprove = async (request: any) => {
        try {
            await addDoc(collection(db, 'products'), {
                name: request.name,
                category: request.category,
                price: request.price,
                description: request.description,
                image: request.image,
                sku: request.sku || 'N/A',
                stock: request.stock || 0,
                gst: request.gst || 18,
                b2bPrice: request.b2bPrice || request.price,
                status: 'active',
                featured: false,
                salePrice: null,
                createdAt: new Date()
            });
            await updateDoc(doc(db, 'product_requests', request.id), { status: 'approved' });
            toast.success(`${request.name} is now LIVE!`);
        } catch (error) { toast.error("Approval failed"); }
    };

    const handleReject = async (id: string) => {
        await updateDoc(doc(db, 'product_requests', id), { status: 'rejected' });
        toast.info("Request rejected");
    };

    const handleManagerStatus = async (uid: string, status: 'active' | 'rejected') => {
        try {
            await updateDoc(doc(db, 'users', uid), { status });
            toast.success(`Manager has been ${status}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm("Delete this product permanently?")) {
            await deleteDoc(doc(db, 'products', id));
            toast.success("Product deleted");
        }
    };

    const handleToggleFeature = async (product: any) => {
        await updateDoc(doc(db, 'products', product.id), { featured: !product.featured });
        toast.success("Product updated");
    };

    const handleSetOffer = async () => {
        if (!selectedProduct) return;
        const price = Number(offerPrice);
        if (isNaN(price)) return;
        await updateDoc(doc(db, 'products', selectedProduct.id), { salePrice: price > 0 ? price : null });
        toast.success("Offer updated");
        setSelectedProduct(null);
    };

    const handleSaveSettings = async () => {
        await setDoc(doc(db, 'settings', 'integrations'), apiKeys);
        toast.success("Configuration Saved");
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        await updateDoc(doc(db, 'users', userId), { role: newRole });
        toast.success(`User role updated to ${newRole}`);
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-warm-700">SUPER ADMIN</Badge>
                            <span className="text-xs text-stone-400">v2.1.0 (Stable)</span>
                        </div>
                        <h1 className="text-4xl font-bold text-stone-900">HQ Dashboard</h1>
                    </div>

                    <Link to="/admin">
                        <Button variant="outline" className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Switch to Manager View
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="flex flex-wrap h-auto w-full md:w-auto gap-2 bg-transparent p-0">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200">Overview</TabsTrigger>
                        <TabsTrigger value="staff" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200 relative">
                            Staff
                            {allUsers.some(u => u.role === 'admin' && u.status === 'pending') && (
                                <span className="ml-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200">Inventory</TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200">Users</TabsTrigger>
                        <TabsTrigger value="requests" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200 relative">
                            Products
                            {requests.length > 0 && <span className="ml-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />}
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white border border-stone-200">Settings</TabsTrigger>
                    </TabsList>

                    {/* --- TAB 1: OVERVIEW --- */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-stone-900 text-white border-0 shadow-lg">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-stone-400">Total Revenue</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-stone-400 mt-1">+₹{stats.lastMonthRevenue.toLocaleString()} last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-stone-500">Active Orders</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{stats.activeOrders}</div>
                                    <p className="text-xs text-stone-400 mt-1">Requiring fulfillment</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-stone-500">Total Users</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-stone-900">{stats.totalUsers}</div>
                                    <p className="text-xs text-green-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {stats.newUsers} new this month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-stone-500">Top Product</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold truncate text-warm-600" title={stats.topProduct}>{stats.topProduct}</div>
                                    <p className="text-xs text-stone-400 mt-1">Most units sold</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Monthly Revenue</CardTitle>
                                    <CardDescription>Performance over the last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-end justify-between gap-2 mt-4">
                                        {stats.monthlyData.map((data, idx) => {
                                            const maxVal = Math.max(...stats.monthlyData.map(d => d.amount)) || 1;
                                            const height = (data.amount / maxVal) * 100;
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                                                    <div className="relative w-full bg-stone-100 rounded-t-md h-full flex items-end overflow-hidden">
                                                        <div className="w-full bg-stone-900 group-hover:bg-warm-600 transition-all duration-500 rounded-t-md relative" style={{ height: `${height}%` }}>
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                ₹{data.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-stone-500 font-medium">{data.month}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col">
                                <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
                                <CardContent className="space-y-6 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-stone-600 flex items-center gap-2"><Package className="w-4 h-4" /> Total Inventory</span>
                                        <span className="font-bold">{inventory.length} SKUs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-stone-600 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Pending Managers</span>
                                        <Badge variant={allUsers.some(u => u.role === 'admin' && u.status === 'pending') ? "destructive" : "secondary"}>
                                            {allUsers.filter(u => u.role === 'admin' && u.status === 'pending').length}
                                        </Badge>
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <Link to="/admin?tab=orders">
                                            <Button className="w-full bg-stone-100 text-stone-900 hover:bg-stone-200">
                                                Manage Orders <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- TAB 2: STAFF MANAGEMENT --- */}
                    <TabsContent value="staff">
                        <Card>
                            <CardHeader>
                                <CardTitle>Staff Management</CardTitle>
                                <CardDescription>Approve new managers and oversee staff access.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Pending Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Pending Approvals</h3>
                                    {allUsers.filter(u => u.role === 'admin' && u.status === 'pending').length === 0 ? (
                                        <div className="p-4 border border-dashed rounded-lg text-center text-stone-500">No pending requests</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {allUsers.filter(u => u.role === 'admin' && u.status === 'pending').map(manager => (
                                                <div key={manager.uid} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-yellow-50/50 border-yellow-100">
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                                                            {manager.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-stone-900">{manager.name}</p>
                                                            <p className="text-xs text-stone-500">{manager.email}</p>
                                                            <Badge variant="outline" className="mt-1 bg-white text-yellow-700 border-yellow-200">Awaiting Approval</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700" onClick={() => handleManagerStatus(manager.uid, 'active')}>
                                                            <UserCheck className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="flex-1 sm:flex-none" onClick={() => handleManagerStatus(manager.uid, 'rejected')}>
                                                            <UserX className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Active Team</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-stone-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Role</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {allUsers.filter(u => ['admin', 'superadmin'].includes(u.role) && u.status !== 'pending').map(staff => (
                                                    <tr key={staff.uid} className="bg-white">
                                                        <td className="px-4 py-3 font-medium">{staff.name}</td>
                                                        <td className="px-4 py-3 text-stone-500">{staff.email}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={staff.role === 'superadmin' ? 'default' : 'secondary'}>
                                                                {staff.role === 'superadmin' ? 'HQ' : 'MANAGER'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${staff.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                {staff.status?.toUpperCase() || 'ACTIVE'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {staff.role !== 'superadmin' && (
                                                                <Button variant="ghost" size="sm" onClick={() => handleManagerStatus(staff.uid, 'rejected')} className="text-red-600 hover:bg-red-50">
                                                                    Revoke Access
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TAB 3: INVENTORY --- */}
                    <TabsContent value="inventory">
                        <Card>
                            <CardHeader><CardTitle>Global Inventory Control</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {inventory.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="relative">
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                                    {item.featured && <div className="absolute -top-2 -left-2 bg-yellow-400 text-white p-1 rounded-full"><Star className="w-3 h-3 fill-current" /></div>}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-stone-900">{item.name}</h3>
                                                    <p className="text-xs text-stone-500 mb-1">SKU: {item.sku || 'N/A'}</p>
                                                    <div className="flex items-center gap-2">
                                                        {item.salePrice ? (
                                                            <>
                                                                <span className="text-stone-400 line-through text-sm">₹{item.price}</span>
                                                                <span className="text-green-600 font-bold">₹{item.salePrice}</span>
                                                                <Badge variant="outline" className="text-green-600 border-green-200 text-[10px]">OFFER</Badge>
                                                            </>
                                                        ) : <span className="text-stone-600">₹{item.price}</span>}
                                                        <Badge variant="secondary" className="ml-2 text-[10px]">Stock: {item.stock || 0}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                                <Button variant="outline" size="sm" onClick={() => handleToggleFeature(item)} className={item.featured ? "bg-yellow-50 border-yellow-200 text-yellow-700" : ""}><Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} /></Button>
                                                <Dialog>
                                                    <DialogTrigger asChild><Button variant="outline" size="sm" className={item.salePrice ? "bg-green-50 border-green-200 text-green-700" : ""} onClick={() => { setSelectedProduct(item); setOfferPrice(item.salePrice || ''); }}><Percent className="w-4 h-4" /></Button></DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Set Special Offer</DialogTitle></DialogHeader>
                                                        <div className="py-4 space-y-4">
                                                            <Label>Original: ₹{selectedProduct?.price}</Label>
                                                            <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="New Price" />
                                                        </div>
                                                        <DialogFooter><Button onClick={handleSetOffer}>Save</Button></DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TAB 4: USERS --- */}
                    <TabsContent value="users">
                        <Card>
                            <CardHeader><CardTitle>User Role Management</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {allUsers.map((u) => (
                                        <div key={u.uid} className="flex items-center justify-between p-3 border rounded hover:bg-stone-50">
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-xs text-stone-500">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{u.role}</Badge>
                                                {u.role !== 'superadmin' && (
                                                    <Select onValueChange={(val) => handleRoleChange(u.uid, val as UserRole)}>
                                                        <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="business">Business</SelectItem>
                                                            <SelectItem value="admin">Manager</SelectItem>
                                                            <SelectItem value="superadmin">HQ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TAB 5: REQUESTS --- */}
                    <TabsContent value="requests">
                        <Card>
                            <CardHeader><CardTitle>Product Approvals</CardTitle></CardHeader>
                            <CardContent>
                                {requests.length === 0 ? <p className="text-center py-10 text-stone-500">All caught up!</p> : (
                                    <div className="space-y-4">
                                        {requests.map((request) => (
                                            <div key={request.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
                                                <div className="flex gap-4">
                                                    <img src={request.image} className="w-16 h-16 rounded object-cover" />
                                                    <div>
                                                        <p className="font-bold">{request.name}</p>
                                                        <p className="text-sm text-stone-500">₹{request.price}</p>
                                                        {request.sku && <Badge variant="outline" className="mt-1 text-[10px]">SKU: {request.sku}</Badge>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleApprove(request)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleReject(request.id)} className="text-red-600 hover:bg-red-50">Reject</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TAB 6: SETTINGS --- */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader><CardTitle>System Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Logistics API Key</Label>
                                        <Input type="password" value={apiKeys.logisticsKey} onChange={(e) => setApiKeys({ ...apiKeys, logisticsKey: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Google Maps API Key</Label>
                                        <Input type="password" value={apiKeys.mapKey} onChange={(e) => setApiKeys({ ...apiKeys, mapKey: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSettings} className="bg-stone-900">Save Configuration</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
            <MobileNavigation />
        </div>
    );
};

export default SuperAdmin;