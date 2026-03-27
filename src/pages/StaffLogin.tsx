import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, ArrowLeft, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

type ViewState = 'form' | 'no-invite' | 'error';

const StaffLogin = () => {
    const { user } = useApp();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewState, setViewState] = useState<ViewState>('form');

    // Redirect if already logged in as staff
    useEffect(() => {
        if (user) {
            if (user.role === 'admin' && user.status === 'active') navigate('/admin');
            else if (user.role === 'superadmin') navigate('/super-admin');
            else if (['user', 'business'].includes(user.role)) {
                // Customer ended up here — send them away
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleSignIn = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AppContext onAuthStateChanges picks up the user.
            // The useEffect above will redirect based on role.
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                toast.error("No account found. Create one using the Sign Up form.");
            } else if (error.code === 'auth/wrong-password') {
                toast.error("Incorrect password.");
            } else {
                toast.error("Sign in failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        if (!name.trim()) {
            toast.error("Please enter your full name");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the Firebase Auth account FIRST (so we're authenticated for Firestore reads)
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const authUser = result.user;

            // 2. Now check if an invite exists (user is now authenticated)
            const inviteRef = doc(db, 'staff_invites', email.toLowerCase());
            const inviteSnap = await getDoc(inviteRef);

            if (!inviteSnap.exists()) {
                // No invite — rollback: delete the auth account and sign out
                await authUser.delete();
                await signOut(auth);
                setViewState('no-invite');
                setIsLoading(false);
                return;
            }

            const inviteData = inviteSnap.data();

            // Set display name
            await updateProfile(authUser, { displayName: name.trim() });

            // 3. Create the Firestore user doc with the INVITED role
            await setDoc(doc(db, 'users', authUser.uid), {
                email: authUser.email,
                name: name.trim(),
                role: inviteData.role,
                status: 'active',
                createdAt: serverTimestamp()
            });

            // 4. Delete the invite (it's been claimed)
            await deleteDoc(inviteRef);

            toast.success("Account created! Welcome aboard.");
            // useEffect redirect will handle navigation
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                toast.error("An account with this email already exists. Try signing in instead.");
                setIsSignUp(false);
            } else {
                toast.error("Sign up failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setViewState('form');
        setEmail('');
        setPassword('');
        setName('');
    };

    // --- NO INVITE SCREEN ---
    if (viewState === 'no-invite') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4">
                <Card className="w-full max-w-md text-center py-8 border-red-200/20 bg-white">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold">No Invite Found</CardTitle>
                            <CardDescription className="text-base px-4">
                                There is no staff invitation for <strong>{email}</strong>.
                                Only HQ can invite new staff members.
                            </CardDescription>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-600 border border-stone-100">
                            <strong>Need access?</strong> Contact your Super Admin to request an invitation.
                        </div>
                        <Button variant="outline" onClick={handleReset} className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Staff Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- MAIN LOGIN FORM ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 bg-stone-900">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-stone-800">
                            Staff Portal
                        </CardTitle>
                        <CardDescription>
                            {isSignUp
                                ? "Create your staff account with an active invitation"
                                : "Secure access for Managers & HQ"
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            isSignUp ? handleSignUp() : handleSignIn();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={isSignUp ? handleSignUp : handleSignIn}
                            disabled={isLoading}
                            className="w-full h-12 text-lg bg-stone-900 hover:bg-black"
                        >
                            {isLoading ? 'Please wait...' : (
                                isSignUp ? (
                                    <><UserPlus className="w-5 h-5 mr-2" /> Create Account</>
                                ) : (
                                    <><LogIn className="w-5 h-5 mr-2" /> Sign In</>
                                )
                            )}
                        </Button>

                        {isSignUp && (
                            <div className="bg-stone-50 p-3 rounded-lg text-xs text-stone-500 border border-stone-100">
                                <strong>Note:</strong> You must have a valid invitation from HQ to create an account.
                                Your email must match the invited email exactly.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="bg-stone-50/50 border-t flex justify-center py-4">
                        <Button
                            variant="link"
                            className="text-xs text-stone-500 hover:text-stone-900"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp
                                ? "Already have an account? Sign In"
                                : "Have an invitation? Create Account"
                            }
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-center text-stone-500 text-xs mt-6">
                    Not a staff member?{' '}
                    <a href="/login" className="text-white underline hover:text-warm-300">
                        Go to Customer Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default StaffLogin;
