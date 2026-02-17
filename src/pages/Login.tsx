import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, User, Lock, Briefcase, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { validateGST } from '@/lib/utils';

type ApprovalStatus = 'none' | 'pending' | 'unauthorized';

const Login = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [gstNumber, setGstNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStaffView, setIsStaffView] = useState(false);

    // --- NEW: Track Approval Screens ---
    const [viewStatus, setViewStatus] = useState<ApprovalStatus>('none');

    useEffect(() => {
        if (user && viewStatus === 'none') {
            if (user.role === 'admin' && user.status === 'pending') {
                setViewStatus('pending');
            } else if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'superadmin') navigate('/super-admin');
            else navigate('/');
        }
    }, [user, navigate, viewStatus]);

    const handleLogin = async (roleType: 'user' | 'business' | 'admin') => {
        if (roleType === 'business' && !validateGST(gstNumber)) {
            toast.error("Please enter a valid GST Number");
            return;
        }

        setIsLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const authUser = result.user;

            const userDocRef = doc(db, 'users', authUser.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                const initialStatus = roleType === 'admin' ? 'pending' : 'active';
                await setDoc(userDocRef, {
                    email: authUser.email,
                    name: authUser.displayName,
                    role: roleType,
                    status: initialStatus,
                    gstNumber: roleType === 'business' ? gstNumber : null,
                    createdAt: serverTimestamp()
                });

                if (roleType === 'admin') {
                    setViewStatus('pending');
                    return;
                }
            } else {
                const userData = userSnapshot.data();

                // 1. Check for Pending Managers
                if (userData.role === 'admin' && userData.status === 'pending') {
                    setViewStatus('pending');
                    return;
                }

                // 2. Check for Unauthorized Access (Customer trying to log into Staff Portal)
                if (isStaffView && !['admin', 'superadmin'].includes(userData.role)) {
                    setViewStatus('unauthorized');
                    return;
                }
            }
        } catch (error: any) {
            toast.error("Login Failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExitStatus = async () => {
        await signOut(auth);
        setViewStatus('none');
        setIsStaffView(false);
    };

    // --- RENDER LOGIC FOR SPECIAL SCREENS ---
    if (viewStatus === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
                <Card className="w-full max-w-md text-center py-8">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold">Approval Pending</CardTitle>
                            <CardDescription className="text-base px-4">
                                Your Manager request has been sent to HQ. For security, a Super Admin must manually verify your credentials.
                            </CardDescription>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-600 border border-stone-100">
                            <strong>Note:</strong> You will be able to access the dashboard once your status is set to "Active".
                        </div>
                        <Button variant="outline" onClick={handleExitStatus} className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (viewStatus === 'unauthorized') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
                <Card className="w-full max-w-md text-center py-8 border-red-100">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold">Staff Access Only</CardTitle>
                            <CardDescription className="text-base">
                                Your account is registered as a <strong>Customer</strong>. You do not have permission to access the Staff Portal.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => navigate('/')} className="w-full bg-stone-900">
                                Go to Storefront
                            </Button>
                            <Button variant="ghost" onClick={handleExitStatus} className="w-full text-stone-500">
                                Sign in with different account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- NORMAL LOGIN VIEW ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-warm-50 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${isStaffView ? 'bg-stone-900' : 'bg-gradient-to-r from-warm-600 to-warm-700'}`}>
                            {isStaffView ? <Shield className="h-8 w-8 text-white" /> : <User className="h-8 w-8 text-white" />}
                        </div>
                        <CardTitle className="text-2xl font-bold text-stone-800">
                            {isStaffView ? "Staff Portal" : "Welcome to Kuruchi"}
                        </CardTitle>
                        <CardDescription>
                            {isStaffView ? "Secure access for Managers & HQ" : "Sign in to access your account"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isStaffView ? (
                            <div className="space-y-4">
                                <div className="bg-stone-100 p-4 rounded-lg border border-stone-200 mb-4">
                                    <div className="flex items-center gap-3 text-stone-700 mb-2">
                                        <Briefcase className="h-5 w-5" />
                                        <span className="font-medium">Apply for Manager Role</span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        Use your Google account to request access. HQ will review your profile shortly.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleLogin('admin')}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg bg-stone-900 hover:bg-black"
                                >
                                    {isLoading ? 'Verifying...' : 'Sign in as Staff'}
                                </Button>
                            </div>
                        ) : (
                            <Tabs defaultValue="customer" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="customer">Customer</TabsTrigger>
                                    <TabsTrigger value="business">Business (B2B)</TabsTrigger>
                                </TabsList>

                                <TabsContent value="customer" className="space-y-4">
                                    <Button
                                        onClick={() => handleLogin('user')}
                                        disabled={isLoading}
                                        className="w-full h-12 text-lg bg-warm-700 hover:bg-warm-800"
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign in with Google'}
                                    </Button>
                                </TabsContent>

                                <TabsContent value="business" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gst">GST Number</Label>
                                        <Input
                                            id="gst"
                                            placeholder="Ex: 22AAAAA0000A1Z5"
                                            value={gstNumber}
                                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => handleLogin('business')}
                                        disabled={isLoading}
                                        className="w-full h-12 text-lg bg-blue-700 hover:bg-blue-800"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Sign in'}
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>

                    <CardFooter className="bg-stone-50/50 border-t flex justify-center py-4">
                        <Button
                            variant="link"
                            className="text-xs text-stone-500 hover:text-stone-900"
                            onClick={() => setIsStaffView(!isStaffView)}
                        >
                            {isStaffView ? (
                                <>← Back to Customer Login</>
                            ) : (
                                <><Lock className="w-3 h-3 mr-1" /> Staff Login (Managers & HQ)</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;