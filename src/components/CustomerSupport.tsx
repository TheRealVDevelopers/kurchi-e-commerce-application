
import { useState } from 'react';
import { Send, MessageCircle, X, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  sender: 'user' | 'admin';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface SupportRequest {
  id: number;
  customerName: string;
  email: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  messages: Message[];
  createdAt: string;
}

const CustomerSupport = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([
    {
      id: 1,
      customerName: 'Alice Johnson',
      email: 'alice@example.com',
      subject: 'Issue with my chair delivery',
      status: 'open',
      priority: 'high',
      createdAt: '2024-06-01T10:00:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Hello, I ordered a chair last week but it hasn\'t arrived yet. Can you help?',
          timestamp: '2024-06-01T10:00:00Z',
          status: 'read'
        }
      ]
    },
    {
      id: 2,
      customerName: 'Bob Smith',
      email: 'bob@example.com',
      subject: 'Product inquiry about sofa',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2024-06-01T09:30:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          content: 'Hi, I\'m interested in the modern sectional sofa. What are the dimensions?',
          timestamp: '2024-06-01T09:30:00Z',
          status: 'read'
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Hello Bob! The sectional sofa dimensions are 120" W x 85" D x 32" H. Would you like more details?',
          timestamp: '2024-06-01T11:15:00Z',
          status: 'delivered'
        }
      ]
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRequest) return;

    const message: Message = {
      id: Date.now(),
      sender: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setRequests(prev => 
      prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, messages: [...req.messages, message], status: 'in-progress' as const }
          : req
      )
    );

    setSelectedRequest(prev => 
      prev ? { ...prev, messages: [...prev.messages, message] } : null
    );

    setNewMessage('');
  };

  const getPriorityColor = (priority: string) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Requests List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Customer Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id ? 'bg-amber-50 border-amber-200' : 'hover:bg-stone-50'
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{request.customerName}</h4>
                  <div className="flex gap-1">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-stone-600 truncate">{request.subject}</p>
                <p className="text-xs text-stone-500 mt-1">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        {selectedRequest ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedRequest.customerName}</CardTitle>
                  <p className="text-sm text-stone-600">{selectedRequest.email}</p>
                  <p className="text-sm font-medium mt-1">{selectedRequest.subject}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedRequest.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'admin'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'admin' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === 'admin' ? 'Admin' : selectedRequest.customerName}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-amber-700 hover:bg-amber-800">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-stone-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a customer request to start chatting</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;
