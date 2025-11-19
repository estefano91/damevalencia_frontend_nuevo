import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, RotateCcw, ShoppingCart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Importar las imágenes de las camisetas (PNG sin fondo)
import tshirtWhite from "@/assets/camisetablanca.png";
import tshirtBlack from "@/assets/camisetanegra.png";

// Importar los logos DAME
import dameLogoWhite from "@/assets/damelogo blanco.png";
import dameLogoBlack from "@/assets/dame logo negro.png";

const TShirtDesigner = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [tshirtColor, setTshirtColor] = useState<"white" | "black">("white");
  const [text, setText] = useState("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [gender, setGender] = useState<"feminino" | "masculino" | "">("");
  
  const currentTshirtImage = tshirtColor === "white" ? tshirtWhite : tshirtBlack;
  // Logo: camiseta blanca = logo negro, camiseta negra = logo blanco
  const currentLogo = tshirtColor === "white" ? dameLogoBlack : dameLogoWhite;
  // Color de texto automático: camiseta blanca = texto negro, camiseta negra = texto blanco
  const textColor = tshirtColor === "white" ? "#000000" : "#FFFFFF";
  const fontSize = 12; // Tamaño fijo

  const resetDesign = () => {
    setText("");
  };

  const downloadDesign = () => {
    // Aquí puedes implementar la funcionalidad de descarga
    // Por ahora solo mostramos un mensaje
    alert(i18n.language === 'en' 
      ? 'Download functionality coming soon!' 
      : '¡Funcionalidad de descarga próximamente!');
  };

  const handleOrderClick = () => {
    setIsOrderDialogOpen(true);
  };

  const handleWhatsAppOrder = () => {
    if (!name || !size || !gender) {
      alert(i18n.language === 'en' 
        ? 'Please fill in all fields' 
        : 'Por favor completa todos los campos');
      return;
    }

    const whatsappNumber = "34658236665";
    const tshirtColorText = tshirtColor === "white" 
      ? (i18n.language === 'en' ? 'White' : 'Blanca')
      : (i18n.language === 'en' ? 'Black' : 'Negra');
    const textColorText = tshirtColor === "white" 
      ? (i18n.language === 'en' ? 'Black' : 'Negro')
      : (i18n.language === 'en' ? 'White' : 'Blanco');
    const genderText = gender === "feminino" 
      ? (i18n.language === 'en' ? 'Female' : 'Femenino')
      : (i18n.language === 'en' ? 'Male' : 'Masculino');

    const message = i18n.language === 'en'
      ? `Hello! I would like to order a custom DAME t-shirt:

👤 Customer Name: ${name}

📦 Order Details:
• Size: ${size}
• Gender: ${genderText}
• T-shirt Color: ${tshirtColorText}
• Text Color: ${textColorText}
• Custom Text: "${text || 'No text'}"

I understand that:
- Delivery takes 7 days
- I will pick it up at DAME events

Thank you!`
      : `¡Hola! Me gustaría hacer un pedido de una camiseta DAME personalizada:

👤 Nombre del Cliente: ${name}

📦 Detalles del Pedido:
• Talla: ${size}
• Género: ${genderText}
• Color de Camiseta: ${tshirtColorText}
• Color del Texto: ${textColorText}
• Texto Personalizado: "${text || 'Sin texto'}"

Entiendo que:
- La entrega tarda 7 días
- La recogeré en eventos DAME

¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOrderDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {i18n.language === 'en' ? 'T-Shirt Designer' : 'Diseñador de Camisetas'}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vista previa de la camiseta */}
          <Card className="lg:sticky lg:top-8 lg:h-fit">
            <CardHeader>
              <CardTitle>
                {i18n.language === 'en' ? 'Preview' : 'Vista Previa'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-xl p-8">
                {/* Mockup de camiseta */}
                <div className="relative mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                  {/* Imagen de la camiseta */}
                  <div className="relative w-full">
                    <img
                      src={currentTshirtImage}
                      alt={tshirtColor === "white" ? "Camiseta Blanca" : "Camiseta Negra"}
                      className="w-full h-auto object-contain"
                    />

                    {/* Logo DAME fijo en el centro */}
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2"
                      style={{
                        top: '25%', // Logo más abajo
                        zIndex: 10,
                        width: '150px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={currentLogo}
                        alt="DAME Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback si la imagen no se carga
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-logo')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'fallback-logo';
                            fallback.textContent = '🦄';
                            fallback.style.fontSize = '60px';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>

                    {/* Texto personalizado - siempre justo debajo del logo */}
                    {text && (
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 text-center"
                        style={{
                          top: 'calc(25% + 100px)', // Justo debajo del logo
                          fontSize: `${fontSize}px`,
                          fontFamily: 'Mansalva, cursive',
                          color: textColor,
                          fontWeight: 'normal',
                          zIndex: 10,
                          width: '80%',
                          marginTop: '0',
                          textShadow: tshirtColor === "white" 
                            ? '0 2px 4px rgba(0,0,0,0.2)' 
                            : '0 2px 4px rgba(255,255,255,0.3)',
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleOrderClick}
                  className="flex-1"
                  variant="default"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {i18n.language === 'en' ? 'Order' : 'Hacer Pedido'}
                </Button>
                <Button
                  onClick={resetDesign}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Panel de controles */}
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === 'en' ? 'Customize Your Design' : 'Personaliza tu Diseño'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selector de color de camiseta */}
              <div className="space-y-2">
                <Label>
                  {i18n.language === 'en' ? 'T-Shirt Color' : 'Color de Camiseta'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tshirtColor === "white" ? "default" : "outline"}
                    onClick={() => setTshirtColor("white")}
                    className="w-full"
                  >
                    {i18n.language === 'en' ? 'White' : 'Blanca'}
                  </Button>
                  <Button
                    variant={tshirtColor === "black" ? "default" : "outline"}
                    onClick={() => setTshirtColor("black")}
                    className="w-full"
                  >
                    {i18n.language === 'en' ? 'Black' : 'Negra'}
                  </Button>
                </div>
              </div>

              {/* Input de texto */}
              <div className="space-y-2">
                <Label htmlFor="text">
                  {i18n.language === 'en' ? 'Text' : 'Texto'}
                </Label>
                <Input
                  id="text"
                  placeholder={i18n.language === 'en' ? 'Enter your text...' : 'Ingresa tu texto...'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  {text.length}/30 {i18n.language === 'en' ? 'characters' : 'caracteres'}
                </p>
              </div>


              {/* Información */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'en' 
                    ? '💡 The DAME logo is fixed and the text color changes automatically based on the t-shirt color (white text on black shirt, black text on white shirt). Your custom text will appear just below the logo in Mansalva font at 12px.'
                    : '💡 El logo DAME está fijo y el color del texto cambia automáticamente según el color de la camiseta (texto blanco en camiseta negra, texto negro en camiseta blanca). Tu texto personalizado aparecerá justo debajo del logo en fuente Mansalva a 12px.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Pedido */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'en' ? 'Place Your Order' : 'Realizar Pedido'}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'en' 
                ? 'Fill in the details to complete your order'
                : 'Completa los detalles para realizar tu pedido'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {i18n.language === 'en' ? 'Name' : 'Nombre'} *
              </Label>
              <Input
                id="name"
                placeholder={i18n.language === 'en' ? 'Enter your name' : 'Ingresa tu nombre'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Talla */}
            <div className="space-y-2">
              <Label htmlFor="size">
                {i18n.language === 'en' ? 'Size' : 'Talla'} *
              </Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size">
                  <SelectValue placeholder={i18n.language === 'en' ? 'Select size' : 'Selecciona talla'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Género */}
            <div className="space-y-2">
              <Label>
                {i18n.language === 'en' ? 'Gender' : 'Género'} *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={gender === "feminino" ? "default" : "outline"}
                  onClick={() => setGender("feminino")}
                  className="w-full"
                >
                  {i18n.language === 'en' ? 'Female' : 'Femenino'}
                </Button>
                <Button
                  type="button"
                  variant={gender === "masculino" ? "default" : "outline"}
                  onClick={() => setGender("masculino")}
                  className="w-full"
                >
                  {i18n.language === 'en' ? 'Male' : 'Masculino'}
                </Button>
              </div>
            </div>

            {/* Información importante */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {i18n.language === 'en' ? 'Important Information' : 'Información Importante'}
                  </p>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                    <li>
                      {i18n.language === 'en' 
                        ? 'Delivery takes 7 days'
                        : 'La entrega tarda 7 días'}
                    </li>
                    <li>
                      {i18n.language === 'en' 
                        ? 'Pick up at DAME events'
                        : 'Recogida en eventos DAME'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resumen del diseño */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                {i18n.language === 'en' ? 'Order Summary' : 'Resumen del Pedido'}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {i18n.language === 'en' ? 'T-shirt:' : 'Camiseta:'} {tshirtColor === "white" 
                    ? (i18n.language === 'en' ? 'White' : 'Blanca')
                    : (i18n.language === 'en' ? 'Black' : 'Negra')}
                </p>
                <p>
                  {i18n.language === 'en' ? 'Text:' : 'Texto:'} {text || (i18n.language === 'en' ? 'No text' : 'Sin texto')}
                </p>
                <p>
                  {i18n.language === 'en' ? 'Text Color:' : 'Color del Texto:'} {tshirtColor === "white" 
                    ? (i18n.language === 'en' ? 'Black' : 'Negro')
                    : (i18n.language === 'en' ? 'White' : 'Blanco')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDialogOpen(false)}
            >
              {i18n.language === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              disabled={!name || !size || !gender}
            >
              {i18n.language === 'en' ? 'Order via WhatsApp' : 'Pedir por WhatsApp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TShirtDesigner;

