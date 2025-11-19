import { useLocation } from "react-router-dom";
import WhatsAppIcon from "@/assets/WhatsApp.svg.webp";

const WhatsAppButton = () => {
  const location = useLocation();
  const hideOnEventDetail = location.pathname.startsWith("/eventos/");
  if (hideOnEventDetail) return null;

  const whatsappNumber = "34658236665";
  const message = "Hola, me gustaría información sobre DAME Valencia";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
      aria-label="Contactar por WhatsApp"
      title="Contáctanos por WhatsApp"
    >
      <img 
        src={WhatsAppIcon} 
        alt="WhatsApp" 
        className="h-8 w-8"
      />
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-0 group-hover:opacity-20 animate-ping" />
    </a>
  );
};

export default WhatsAppButton;




