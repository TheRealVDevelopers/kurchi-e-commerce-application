import { useState, useEffect } from 'react';
import { Send, MessageCircle, X, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

// --- Interfaces ---
interface Message {
  id: number;
  sender: 'user' | 'admin';
  content: string;
  timestamp: any; // Firestore timestamp or ISO string
}

interface SupportRequest {
  id: string;
  name: string; // Changed from customerName to match Contact form
  email: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  messages: Message[];
  createdAt: any;
  message?: string; // Legacy field from simple contact form
}

const CustomerSupport = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch Real Data from Firestore
  useEffect(() => {
    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // DATA NORMALIZATION:
        // If the ticket comes from the simple Contact Form, it won't have a 'messages' array yet.
        // We create a fake first message using the original 'message' field.
        const normalizedMessages = data.messages || [
            {
                id: Date.now(),
                sender: 'user',
                content: data.message || 'No message content',
                timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            }
        ];

        return {
          id: doc.id,
          ...data,
          messages: normalizedMessages,
          // If no priority set, default to medium
          priority: data.priority || 'medium' 
        };
      }) as SupportRequest[];

      setRequests(fetchedRequests);
      
      // Update selected request in real-time if it's open
      if (selectedRequest) {
          const updated = fetchedRequests.find(r => r.id === selectedRequest.id);
          if (updated) setSelectedRequest(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedRequest?.id]); // Re-run if selection changes to keep sync

  // 2. Send Reply (Save to Firestore)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;
    setIsSending(true);

    const message: Message = {
      id: Date.now(),
      sender: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
        const ticketRef = doc(db, 'support_tickets', selectedRequest.id);
        
        await updateDoc(ticketRef, {
            messages: arrayUnion(message), // Add to array
            status: 'in-progress' // Auto-update status
        });

        setNewMessage('');
        // Toast is optional here as the UI updates instantly via onSnapshot
    } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send reply");
    } finally {
        setIsSending(false);
    }
  };

  // 3. Helper to mark as resolved
  const handleMarkResolved = async () => {
      if (!selectedRequest) return;
      try {
          await updateDoc(doc(db, 'support_tickets', selectedRequest.id), { status: 'resolved' });
          toast.success("Ticket marked as resolved");
      } catch (e) { toast.error("Action failed"); }
  };

  const getPriorityColor = (priority: string = 'medium') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to format time safely
  const formatTime = (timestamp: any) => {
      if (!timestamp) return '';
      // Handle Firestore Timestamp or String
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Requests List */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Inbox ({requests.filter(r => r.status !== 'resolved').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto flex-1 pr-2">
            {requests.length === 0 ? (
                <div className="text-center text-stone-500 py-10">No tickets found.</div>
            ) : (
                requests.map((request) => (
                <div
                    key={request.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedRequest?.id === request.id ? 'bg-stone-100 border-stone-300 shadow-inner' : 'hover:bg-stone-50'}`}
                    onClick={() => setSelectedRequest(request)}
                >
                    <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-stone-900">{request.name || 'Unknown User'}</h4>
                    <div className="flex gap-1">
                        {request.priority && (
                            <Badge className={`text-[10px] px-1 py-0 ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                            </Badge>
                        )}
                        <Badge className={`text-[10px] px-1 py-0 ${getStatusColor(request.status)}`}>
                            {request.status}
                        </Badge>
                    </div>
                    </div>
                    <p className="text-sm font-medium text-stone-800 truncate">{request.subject}</p>
                    <p className="text-xs text-stone-500 mt-1 truncate">
                        {request.messages[request.messages.length - 1]?.content || 'No messages'}
                    </p>
                </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        {selectedRequest ? (
          <Card className="h-full flex flex-col border-stone-200 shadow-sm">
            <CardHeader className="border-b bg-stone-50/50 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{selectedRequest.name}</CardTitle>
                    <span className="text-xs text-stone-400">({selectedRequest.email})</span>
                  </div>
                  <p className="text-sm font-medium text-stone-700 mt-1">{selectedRequest.subject}</p>
                </div>
                <div className="flex gap-2">
                    {selectedRequest.status !== 'resolved' && (
                        <Button variant="outline" size="sm" onClick={handleMarkResolved} className="text-green-600 border-green-200 hover:bg-green-50 h-8">
                            Mark Resolved
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)} className="lg:hidden">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {selectedRequest.messages.map((message, index) => (
                <div
                  key={index} // Using index as fallback key since IDs might duplicate in migrations
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${message.sender === 'admin'
                      ? 'bg-stone-900 text-white rounded-br-none'
                      : 'bg-stone-100 text-stone-800 rounded-bl-none'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                      {message.sender === 'admin' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span className="text-xs font-medium">
                        {message.sender === 'admin' ? 'Support Team' : selectedRequest.name}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-[10px] opacity-60 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 bg-stone-50">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedRequest.status === 'resolved' ? "Ticket resolved. Reopen to chat." : "Type your reply..."}
                  disabled={selectedRequest.status === 'resolved' || isSending}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white"
                />
                <Button 
                    onClick={handleSendMessage} 
                    disabled={selectedRequest.status === 'resolved' || isSending}
                    className="bg-stone-900 hover:bg-stone-800 w-12 px-0"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center bg-stone-50 border-dashed">
            <div className="text-center text-stone-400">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a ticket</p>
              <p className="text-sm">View conversation history and reply</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;