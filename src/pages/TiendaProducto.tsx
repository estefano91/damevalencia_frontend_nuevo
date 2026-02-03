import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, MessageCircle, ShoppingBag, Wand2 } from "lucide-react";
import { CART_STORAGE_KEY, STORE_PRODUCTS, WHATSAPP_NUMBER, type CartState } from "@/lib/tienda";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function readCart(): CartState {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeCart(cart: CartState) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

const TiendaProducto = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();

  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");
  const productId = Number(params.id);

  const product = useMemo(() => STORE_PRODUCTS.find((p) => p.id === productId), [productId]);

  const [size, setSize] = useState<string>(() => product?.sizes?.[0] ?? "");
  const [qty, setQty] = useState<number>(1);

  const priceLabel = useMemo(() => {
    if (!product) return "";
    if (typeof product.priceEur === "number") return `€${product.priceEur.toFixed(2)}`;
    return isEnglish ? "Ask price" : "Precio a consultar";
  }, [isEnglish, product]);

  const canChooseSize = Boolean(product?.sizes?.length);
  const sizeRequired = canChooseSize;
  const sizeOk = !sizeRequired || Boolean(size);

  const addToCart = () => {
    if (!product) return;
    if (!sizeOk) {
      toast({
        title: isEnglish ? "Select a size" : "Selecciona una talla",
        description: isEnglish ? "Please choose a size first." : "Elige una talla antes de añadir.",
        variant: "destructive",
      });
      return;
    }

    const key = size ? `${product.id}:${size}` : `${product.id}`;
    const cart = readCart();
    const nextQty = Math.max(1, Math.min(99, qty));
    cart[key] = Math.min(99, (cart[key] ?? 0) + nextQty);
    writeCart(cart);

    toast({
      title: isEnglish ? "Added to cart" : "Añadido al carrito",
      description: isEnglish
        ? `${product.name_en}${size ? ` (Size ${size})` : ""}`
        : `${product.name}${size ? ` (Talla ${size})` : ""}`,
    });
  };

  if (!product || Number.isNaN(productId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <div className="container mx-auto px-4 pt-28 pb-10">
          <Button variant="outline" onClick={() => navigate("/tienda")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEnglish ? "Back to store" : "Volver a la tienda"}
          </Button>
          <div className="mt-6 text-sm text-muted-foreground">
            {isEnglish ? "Product not found." : "Producto no encontrado."}
          </div>
        </div>
      </div>
    );
  }

  const title = isEnglish ? product.name_en : product.name;
  const description = isEnglish ? product.description_en : product.description;

  const whatsappMessage = (() => {
    if (product.whatsappOnly) {
      const lines: string[] = [];
      lines.push(isEnglish ? "Hello! I'd like to order a t-shirt:" : "¡Hola! Me gustaría reservar una camiseta:");
      lines.push("");
      lines.push(`• ${title}`);
      if (size) lines.push(isEnglish ? `• Size: ${size}` : `• Talla: ${size}`);
      if (typeof product.priceEur === "number") lines.push(`• ${isEnglish ? "Price" : "Precio"}: ${priceLabel}`);
      lines.push("");
      lines.push(
        isEnglish
          ? "I understand that payment will be in cash on delivery."
          : "Sé que el pago se realizará en efectivo en el momento de la entrega."
      );
      lines.push("");
      lines.push(isEnglish ? "Thank you!" : "¡Gracias!");
      return lines.join("\n");
    }
    const lines: string[] = [];
    lines.push(isEnglish ? "Hello! I want to order:" : "¡Hola! Quiero pedir:");
    lines.push(`- ${title}`);
    if (size) lines.push(isEnglish ? `Size: ${size}` : `Talla: ${size}`);
    lines.push(isEnglish ? `Quantity: ${qty}` : `Cantidad: ${qty}`);
    if (typeof product.priceEur === "number") lines.push(isEnglish ? `Price: ${priceLabel}` : `Precio: ${priceLabel}`);
    lines.push("");
    lines.push(isEnglish ? "Thanks!" : "¡Gracias!");
    return lines.join("\n");
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-28 pb-10">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => navigate("/tienda")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEnglish ? "Store" : "Tienda"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/tienda")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isEnglish ? "Go to store" : "Ir a la tienda"}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-7 overflow-hidden border border-purple-100 dark:border-purple-900/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900">
              <img
                src={product.image}
                alt={title}
                className="w-full h-64 sm:h-80 object-contain"
                loading="lazy"
              />
            </div>
          </Card>

          <Card className="lg:col-span-5 h-fit border border-purple-100 dark:border-purple-900/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h1>
                  {product.tag ? <Badge variant="secondary">{product.tag}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{priceLabel}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canChooseSize ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{isEnglish ? "Size" : "Talla"}</p>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger>
                        <SelectValue placeholder={isEnglish ? "Select size" : "Selecciona talla"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(product.sizes ?? []).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {!product.whatsappOnly ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{isEnglish ? "Quantity" : "Cantidad"}</p>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                    />
                  </div>
                ) : null}
              </div>

              {product.id === 1 ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => navigate("/camiseta")}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isEnglish ? "Open designer" : "Abrir diseñador"}
                  </Button>

                  <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {isEnglish ? "Ask via WhatsApp" : "Consultar por WhatsApp"}
                    </Button>
                  </a>
                </div>
              ) : product.whatsappOnly ? (
                <div className="space-y-2">
                  <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {isEnglish ? "Buy via WhatsApp" : "Comprar por WhatsApp"}
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={addToCart}
                    disabled={!sizeOk}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {isEnglish ? "Add to cart" : "Añadir al carrito"}
                  </Button>

                  <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {isEnglish ? "Buy via WhatsApp" : "Comprar por WhatsApp"}
                    </Button>
                  </a>

                  {product.stripePaymentLink ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(product.stripePaymentLink, "_blank", "noopener,noreferrer")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isEnglish ? "Pay by card (Stripe)" : "Pagar con tarjeta (Stripe)"}
                    </Button>
                  ) : null}
                </div>
              )}

              {canChooseSize ? (
                <p className="text-xs text-muted-foreground">
                  {product.whatsappOnly
                    ? (isEnglish ? "Choose your size and send your order via WhatsApp." : "Elige tu talla y envía tu pedido por WhatsApp.")
                    : (isEnglish ? "Tip: choose the right size before adding to cart." : "Tip: elige tu talla antes de añadir al carrito.")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TiendaProducto;

