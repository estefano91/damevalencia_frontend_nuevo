import { useAuth } from "@/contexts/AuthContext";
import EventsSection from "@/components/EventsSection";

const Demo = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Eventos DAME por Categoría - Directamente sin banner */}
      <div className="container mx-auto px-4 py-6">
        <EventsSection maxEventsPerCategory={4} />
      </div>
    </div>
  );
};

export default Demo;