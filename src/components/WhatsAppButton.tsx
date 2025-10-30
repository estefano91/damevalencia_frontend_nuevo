import { Phone } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappNumber = "34658236665";
  const message = "Hola, me gustaría información sobre DAME Valencia";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group"
      aria-label="Contactar por teléfono"
      title="Contáctanos por teléfono"
    >
      <Phone className="h-7 w-7 text-white" />
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-0 group-hover:opacity-20 animate-ping" />
    </a>
  );
};

export default WhatsAppButton;




