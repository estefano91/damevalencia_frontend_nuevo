import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, Paperclip, Smile, Phone, Video, MoreVertical,
  Search, MessageSquare, ArrowLeft, Check, CheckCheck
} from "lucide-react";

interface ChatSummary {
  chat_id: string;
  chat_name: string | null;
  chat_type: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  other_participants: any;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[] | null;
  message_type: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ChatDetails {
  id: string;
  type: string;
  name: string | null;
  participants: any[];
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get('chat');

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(chatIdParam || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatIdParam) {
      setSelectedChat(chatIdParam);
    }
  }, [chatIdParam]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadChats();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedChat && user) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [selectedChat, user]);

  // Reload chats when chatIdParam changes
  useEffect(() => {
    if (chatIdParam) {
      loadChats();
    }
  }, [chatIdParam]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      // Simple load from chat_members
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('chat_members')
        .select('chat_id, chat:chats(*)')
        .eq('user_id', user!.id);

      if (fallbackError) throw fallbackError;

      if (fallbackData) {
        // Get other participants for each chat
        const enrichedChats = await Promise.all(
          fallbackData.map(async (cm: any) => {
            // Get other participants
            const { data: otherMembers } = await supabase
              .from('chat_members')
              .select('user_id')
              .eq('chat_id', cm.chat_id)
              .neq('user_id', user!.id);
            
            // Get profile info for each member
            const participantsData = await Promise.all(
              (otherMembers || []).map(async (member: any) => {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('full_name, avatar_url')
                  .eq('id', member.user_id)
                  .single();
                
                return {
                  name: profile?.full_name || 'Unknown',
                  avatar: profile?.avatar_url || null
                };
              })
            );

            // Get last message
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('chat_id', cm.chat_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              chat_id: cm.chat_id,
              chat_name: cm.chat?.name || null,
              chat_type: cm.chat?.type || 'private',
              last_message: lastMsg?.content || null,
              last_message_time: lastMsg?.created_at || null,
              unread_count: 0,
              other_participants: participantsData || []
            };
          })
        );

        setChats(enrichedChats);
      }
    } catch (error: any) {
      console.error("Error in loadChats:", error);
      toast({
        title: "Loading chats...",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id(full_name, avatar_url)
        `)
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Load chat details
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id, type, name')
        .eq('id', selectedChat)
        .single();

      if (!chatError && chatData) {
        setChatDetails(chatData);
      }

      // Mark messages as read
      markMessagesAsRead();
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    if (!selectedChat) return;

    const channel = supabase
      .channel(`chat:${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        (payload) => {
          loadMessages();
          if (payload.new.sender_id !== user!.id) {
            toast({
              title: "New message",
              description: "You have a new message",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat || !user) return;

    try {
      const { data } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('chat_id', selectedChat)
        .neq('sender_id', user.id);

      if (data) {
        for (const message of data) {
          const readBy = message.read_by || [];
          if (!readBy.includes(user.id)) {
            await supabase.rpc('mark_message_read', {
              message_id: message.id,
              user_id: user.id
            });
          }
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat,
          sender_id: user.id,
          content: messageInput.trim(),
          message_type: 'text',
          read_by: []
        });

      if (error) throw error;

      setMessageInput("");
      loadMessages();
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getChatName = (chat: ChatSummary) => {
    if (chat.chat_name) return chat.chat_name;
    
    if (chat.other_participants && Array.isArray(chat.other_participants)) {
      const names = chat.other_participants
        .map((p: any) => p.name)
        .filter(Boolean)
        .join(', ');
      return names || 'Unknown User';
    }
    
    return 'Unknown User';
  };

  const getChatAvatar = (chat: ChatSummary) => {
    if (chat.other_participants && Array.isArray(chat.other_participants) && chat.other_participants.length > 0) {
      return chat.other_participants[0].avatar;
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isMessageRead = (message: Message, currentUserId: string) => {
    const readBy = message.read_by || [];
    return readBy.includes(currentUserId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="w-full px-4 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/discover')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Sidebar - Chat List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No chats yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {chats.map((chat) => {
                      const chatName = getChatName(chat);
                      const avatar = getChatAvatar(chat);
                      
                      return (
                        <div
                          key={chat.chat_id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedChat === chat.chat_id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedChat(chat.chat_id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                              {avatar ? (
                                <img src={avatar} alt={chatName} className="w-full h-full rounded-full" />
                              ) : (
                                chatName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold truncate">{chatName}</h3>
                                {chat.unread_count > 0 && (
                                  <Badge variant="default" className="ml-2">
                                    {chat.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground truncate">
                                  {chat.last_message}
                                </p>
                                {chat.last_message_time && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatTime(chat.last_message_time)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {chatDetails?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {chatDetails?.name || 'Chat'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {chatDetails?.type === 'private' ? 'Private' : 'Group'} chat
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user!.id;
                      const isRead = isMessageRead(message, user!.id);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg px-4 py-2 ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-card border'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs opacity-70">
                                  {formatTime(message.created_at)}
                                </span>
                                {isOwn && (
                                  <span className="ml-1">
                                    {isRead ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isOwn && (
                              <p className="text-xs text-muted-foreground mt-1 ml-2">
                                {message.sender_profile?.full_name || 'Unknown'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No chat selected</p>
                    <p className="text-sm">Select a chat from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;

