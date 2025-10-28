import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { 
  Calendar, Video, Clock, Users, Zap, 
  Plus, Filter, TrendingUp, MapPin, Building2,
  UserCircle, Briefcase, DollarSign, Award
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  theme: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  format: string;
  video_link: string | null;
  room_url: string | null;
  max_participants: number;
  target_audience: string[] | null;
  target_sports: string[] | null;
  status: string;
  registration_open: boolean;
  registration_count: number;
  requires_verification: boolean;
  host?: {
    full_name: string;
    user_type: string;
  };
  is_registered?: boolean;
}

const NetworkingEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const eventTypes = [
    { value: "all", label: "All Events", icon: Calendar },
    { value: "speed_networking", label: "Speed Networking", icon: Zap },
    { value: "showcase", label: "Player Showcase", icon: UserCircle },
    { value: "pitch", label: "Pitch Sessions", icon: Briefcase },
    { value: "panel", label: "Panels", icon: Users },
    { value: "workshop", label: "Workshops", icon: Award }
  ];

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadEvents();
  }, [user, navigate, selectedFilter]);

  const loadEvents = async () => {
    try {
      let query = supabase
        .from('networking_events')
        .select(`
          *,
          host:profiles!host_id(full_name, user_type)
        `)
        .in('status', ['upcoming', 'live'])
        .order('start_time', { ascending: true })
        .limit(50);

      if (selectedFilter !== "all") {
        query = query.eq('event_type', selectedFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Check which events user is registered for
      if (data) {
        const eventIds = data.map(e => e.id);
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id, status')
          .in('event_id', eventIds)
          .eq('user_id', user!.id);

        const eventsWithRegistration = data.map(event => ({
          ...event,
          is_registered: registrations?.some(r => r.event_id === event.id) || false
        }));

        setEvents(eventsWithRegistration);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user!.id,
          status: 'registered'
        });

      if (error) throw error;

      toast({
        title: "Registered!",
        description: "You will receive reminders before the event.",
      });

      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    const typeInfo = eventTypes.find(t => t.value === type);
    return typeInfo?.icon || Calendar;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Networking Events</h1>
          <p className="text-muted-foreground">
            Join virtual networking events and connect with professionals in sports
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={selectedFilter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(type.value)}
                className="whitespace-nowrap"
              >
                <Icon className="mr-2 h-4 w-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {events.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No upcoming events</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for new networking opportunities</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const Icon = getEventTypeIcon(event.event_type);
              const dateTime = formatDateTime(event.start_time);
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Status Banner */}
                  {event.status === 'live' && (
                    <div className="bg-red-500 text-white p-2 text-center text-xs font-semibold">
                      ⚡ LIVE NOW
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="capitalize">{event.event_type.replace('_', ' ')}</Badge>
                      {event.requires_verification && (
                        <Badge variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>

                      {/* DateTime */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{dateTime.date}</span>
                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                        <span>{dateTime.time}</span>
                      </div>

                      {/* Format */}
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground capitalize">{event.format}</span>
                      </div>

                      {/* Audience */}
                      {event.target_audience && event.target_audience.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.target_audience.map((audience, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Participants */}
                      <div className="flex items-center justify-between text-sm pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {event.registration_count} / {event.max_participants}
                          </span>
                        </div>
                        {event.host && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {event.host.user_type}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      {event.is_registered ? (
                        <Button className="w-full" variant="outline" disabled>
                          ✓ Registered
                        </Button>
                      ) : !event.registration_open ? (
                        <Button className="w-full" variant="outline" disabled>
                          Registration Closed
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleRegister(event.id)}
                        >
                          Register Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default NetworkingEvents;


