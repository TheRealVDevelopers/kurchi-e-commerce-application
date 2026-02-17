import { useState, useEffect } from 'react';
import { Send, Phone, Mail, MapPin, Loader2, MessageSquare, Clock, CheckCircle, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

interface Message {
    sender: 'user' | 'admin';
    content: string;
    timestamp: any;
}

interface Ticket {
    id: string;
    subject: string;
    status: 'open' | 'in-progress' | 'resolved';
    messages: Message[];
    createdAt: any;
}

const Contact = () => {
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState('new');

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });

    // Ticket History State
    const [myTickets, setMyTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState('');

    // 1. Fetch User's Tickets
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'support_tickets'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tickets = snapshot.docs.map(doc => {
                const data = doc.data();
                // Normalize old tickets that might just have 'message' string
                const msgs = data.messages || [
                    { sender: 'user', content: data.message, timestamp: data.createdAt }
                ];
                return { id: doc.id, ...data, messages: msgs } as Ticket;
            });
            setMyTickets(tickets);

            // Keep selected ticket synced
            if (selectedTicket) {
                const updated = tickets.find(t => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            }
        });

        return () => unsubscribe();
    }, [user, selectedTicket?.id]);

    // 2. Create New Ticket
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to contact support");
            return;
        }
        setIsSubmitting(true);

        try {
            // Create initial message object
            const firstMessage = {
                sender: 'user',
                content: formData.message,
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, 'support_tickets'), {
                ...formData,
                userId: user.uid,
                status: 'open',
                createdAt: serverTimestamp(),
                messages: [firstMessage] // Start array
            });

            toast.success("Ticket created! Check 'My Tickets' for replies.");
            setFormData({ ...formData, subject: '', message: '' });
            setActiveTab('history'); // Switch to history tab
        } catch (error) {
            toast.error("Failed to send message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. User Reply Logic
    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;

        const newMessage = {
            sender: 'user',
            content: replyText,
            timestamp: new Date().toISOString()
        };

        try {
            await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
                messages: arrayUnion(newMessage),
                status: 'open' // Re-open if admin marked resolved but user replies
            });
            setReplyText('');
        } catch (e) {
            toast.error("Failed to send reply");
        }
    };

    return (
        <div className="min-h-screen bg-cream pb-20">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-stone-900 mb-4">Help Center</h1>
                    <p className="text-stone-600">Track your support requests and chat with our team.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="new">Contact Us</TabsTrigger>
                        <TabsTrigger value="history">My Tickets ({myTickets.length})</TabsTrigger>
                    </TabsList>

                    {/* --- TAB 1: NEW TICKET FORM --- */}
                    <TabsContent value="new">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Info Side */}
                            <div className="space-y-6">
                                <Card className="bg-warm-800 text-white border-0 h-full">
                                    <CardContent className="p-8 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-6">We're here to help</h3>
                                            <div className="space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <Phone className="w-6 h-6 text-warm-300" />
                                                    <div>
                                                        <p className="font-medium">Phone Support</p>
                                                        <p className="text-stone-400">+91 98765 43210</p>
                                                        <p className="text-xs text-stone-500">Mon-Fri 9am-6pm</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <Mail className="w-6 h-6 text-warm-300" />
                                                    <div>
                                                        <p className="font-medium">Email</p>
                                                        <p className="text-stone-400">support@kurchi.com</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <MapPin className="w-6 h-6 text-warm-300" />
                                                    <div>
                                                        <p className="font-medium">Visit Us</p>
                                                        <p className="text-stone-400">123 Furniture Lane, Indiranagar<br />Bangalore, 560038</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Form Side */}
                            <Card>
                                <CardContent className="p-8">
                                    <h3 className="text-xl font-bold mb-6 text-stone-900">Start a New Conversation</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Order Inquiry / Product Question"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Message</label>
                                            <Textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="How can we help you?"
                                                className="h-32"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-warm-700 hover:bg-warm-800 h-12"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                            Create Ticket
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- TAB 2: TICKET HISTORY / CHAT --- */}
                    <TabsContent value="history">
                        <div className="grid md:grid-cols-3 gap-6 h-[600px]">

                            {/* List of Tickets */}
                            <Card className="col-span-1 overflow-hidden flex flex-col">
                                <CardHeader className="bg-stone-50 border-b py-3">
                                    <CardTitle className="text-lg">Your Conversations</CardTitle>
                                </CardHeader>
                                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                    {myTickets.length === 0 ? (
                                        <p className="text-center text-stone-500 py-8 text-sm">No tickets found.</p>
                                    ) : (
                                        myTickets.map(ticket => (
                                            <div
                                                key={ticket.id}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedTicket?.id === ticket.id ? 'bg-warm-50 border-warm-200' : 'hover:bg-stone-50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                                            ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                                'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {ticket.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-stone-400">
                                                        {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm truncate">{ticket.subject}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>

                            {/* Chat Window */}
                            <Card className="col-span-1 md:col-span-2 flex flex-col overflow-hidden">
                                {selectedTicket ? (
                                    <>
                                        <CardHeader className="border-b bg-stone-50 py-3 flex flex-row justify-between items-center">
                                            <div>
                                                <CardTitle className="text-base">{selectedTicket.subject}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    Ticket ID: {selectedTicket.id.slice(0, 8)}
                                                </CardDescription>
                                            </div>
                                            {selectedTicket.status === 'resolved' && (
                                                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Resolved
                                                </Badge>
                                            )}
                                        </CardHeader>

                                        {/* Messages Area */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                                            {selectedTicket.messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                                            ? 'bg-warm-700 text-white rounded-br-none'
                                                            : 'bg-stone-100 text-stone-800 rounded-bl-none'
                                                        }`}>
                                                        <div className="flex items-center gap-1 mb-1 opacity-80 text-xs">
                                                            {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                            <span>{msg.sender === 'user' ? 'You' : 'Support Team'}</span>
                                                        </div>
                                                        <p>{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reply Box */}
                                        <div className="p-3 border-t bg-stone-50 flex gap-2">
                                            <Input
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder={selectedTicket.status === 'resolved' ? "Ticket resolved. Reply to re-open." : "Type a reply..."}
                                                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                                className="bg-white"
                                            />
                                            <Button onClick={handleReply} className="bg-warm-700 hover:bg-warm-800 px-3">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-stone-400">
                                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                        <p>Select a ticket to view the conversation</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <MobileNavigation />
        </div>
    );
};

export default Contact;