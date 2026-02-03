import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Filter, Minus, Plus, Search, ShoppingBag, Trash2, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

import {
  CART_STORAGE_KEY,
  STORE_PRODUCTS,
  WHATSAPP_NUMBER,
  type CartState,
  type StoreProduct,
} from "@/lib/tienda";

type SortKey = "recommended" | "price_asc" | "price_desc" | "name_asc";

const Tienda = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isEnglish = i18n.language === "en" || i18n.language?.startsWith("en");

  const products = useMemo(() => STORE_PRODUCTS, []);

  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false); // desktop dialog
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false); // mobile drawer

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | StoreProduct["category"]>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("recommended");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartState;
      if (parsed && typeof parsed === "object") {
        setCart(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  );

  const cartItems = useMemo(() => {
    const entries = Object.entries(cart)
      .map(([key, qty]) => ({ key, qty }))
      .filter((x) => (x.qty ?? 0) > 0);

    const parseKey = (key: string): { productId: number; size?: string } => {
      const [idRaw, sizeRaw] = key.split(":");
      const productId = Number(idRaw);
      return { productId, size: sizeRaw || undefined };
    };

    return entries
      .map((e) => {
        const parsed = parseKey(e.key);
        const product = products.find((p) => p.id === parsed.productId);
        if (!product) return null;
        return { product, qty: e.qty, size: parsed.size, key: e.key };
      })
      .filter(Boolean) as Array<{ product: StoreProduct; qty: number; size?: string; key: string }>;
  }, [cart, products]);

  const cartSingleProductStripeLink = useMemo(() => {
    if (cartItems.length !== 1) return undefined;
    return cartItems[0]?.product?.stripePaymentLink;
  }, [cartItems]);

  const cartStripeEnabled = Boolean(cartSingleProductStripeLink);
  const anyStripeLinks = useMemo(() => products.some((p) => Boolean(p.stripePaymentLink)), [products]);

  const totalEur = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.priceEur ?? 0) * item.qty, 0);
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice) : undefined;
    const max = maxPrice.trim() ? Number(maxPrice) : undefined;

    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (q) {
        const hay = `${p.name} ${p.name_en} ${p.description} ${p.description_en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const price = typeof p.priceEur === "number" ? p.priceEur : undefined;
      if (typeof min === "number" && !Number.isNaN(min)) {
        if (typeof price !== "number") return false;
        if (price < min) return false;
      }
      if (typeof max === "number" && !Number.isNaN(max)) {
        if (typeof price !== "number") return false;
        if (price > max) return false;
      }
      return true;
    });

    const collator = new Intl.Collator(isEnglish ? "en" : "es", { sensitivity: "base" });

    switch (sort) {
      case "price_asc":
        list = [...list].sort((a, b) => (a.priceEur ?? Number.POSITIVE_INFINITY) - (b.priceEur ?? Number.POSITIVE_INFINITY));
        break;
      case "price_desc":
        list = [...list].sort((a, b) => (b.priceEur ?? Number.NEGATIVE_INFINITY) - (a.priceEur ?? Number.NEGATIVE_INFINITY));
        break;
      case "name_asc":
        list = [...list].sort((a, b) =>
          collator.compare(isEnglish ? a.name_en : a.name, isEnglish ? b.name_en : b.name)
        );
        break;
      default:
        // recommended: keep original order
        break;
    }

    return list;
  }, [category, isEnglish, maxPrice, minPrice, products, query, sort]);

  const setQty = (key: string, nextQty: number) => {
    setCart((prev) => {
      const safe = Math.max(0, Math.min(99, nextQty));
      const next: CartState = { ...prev };
      if (safe === 0) delete next[key];
      else next[key] = safe;
      return next;
    });
  };

  const addOne = (key: string) => {
    setQty(key, (cart[key] ?? 0) + 1);
    if (!isMobile) {
      toast({
        title: isEnglish ? "Added to cart" : "Añadido al carrito",
        description: isEnglish ? "You can review your cart anytime." : "Puedes revisar tu carrito cuando quieras.",
      });
    }
  };

  const removeOne = (key: string) => {
    setQty(key, (cart[key] ?? 0) - 1);
  };

  const clearCart = () => {
    setCart({});
  };

  const whatsappCheckoutUrl = useMemo(() => {
    const lines = cartItems.map((item) => {
      const baseName = isEnglish ? item.product.name_en : item.product.name;
      const name = item.size ? `${baseName} (${isEnglish ? "Size" : "Talla"} ${item.size})` : baseName;
      const price = item.product.priceEur ?? 0;
      return `- ${name} x${item.qty} = €${(price * item.qty).toFixed(2)}`;
    });

    const header = isEnglish ? "Hello! I want to buy:" : "¡Hola! Quiero comprar:";
    const totalLine = isEnglish ? `Total: €${totalEur.toFixed(2)}` : `Total: €${totalEur.toFixed(2)}`;
    const message = [header, "", ...lines, "", totalLine].join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [cartItems, isEnglish, totalEur]);

  const openCart = () => {
    if (isMobile) setCartDrawerOpen(true);
    else setCartOpen(true);
  };

  const categoryLabel = (key: StoreProduct["category"] | "all") => {
    if (key === "all") return isEnglish ? "All" : "Todo";
    if (key === "ropa") return isEnglish ? "Clothing" : "Ropa";
    return isEnglish ? "All" : "Todo";
  };

  const FiltersPanel = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold">{isEnglish ? "Category" : "Categoría"}</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "ropa"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-transparent border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">{isEnglish ? "Price" : "Precio"}</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="decimal"
            placeholder={isEnglish ? "Min" : "Mín"}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder={isEnglish ? "Max" : "Máx"}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isEnglish ? "Leave empty for no limit." : "Deja vacío para sin límite."}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">{isEnglish ? "Sort" : "Ordenar"}</p>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">{isEnglish ? "Recommended" : "Recomendado"}</SelectItem>
            <SelectItem value="price_asc">{isEnglish ? "Price: Low to high" : "Precio: menor a mayor"}</SelectItem>
            <SelectItem value="price_desc">{isEnglish ? "Price: High to low" : "Precio: mayor a menor"}</SelectItem>
            <SelectItem value="name_asc">{isEnglish ? "Name: A to Z" : "Nombre: A a Z"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setQuery("");
            setCategory("all");
            setMinPrice("");
            setMaxPrice("");
            setSort("recommended");
          }}
        >
          {isEnglish ? "Clear" : "Limpiar"}
        </Button>
        {isMobile ? (
          <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
            {isEnglish ? "Apply" : "Aplicar"}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const CartPanel = ({ compactHeader }: { compactHeader?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={compactHeader ? "px-4 pt-2 pb-2" : "px-4 sm:px-6 pt-5 pb-3"}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{isEnglish ? "Your cart" : "Tu carrito"}</p>
            <p className="text-xs text-muted-foreground">
              {isEnglish ? "Checkout via WhatsApp" : "Finaliza tu pedido por WhatsApp"}
            </p>
          </div>
          {cartCount > 0 ? (
            <Badge variant="secondary">{cartCount}</Badge>
          ) : null}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 overflow-y-auto flex-1 min-h-0 space-y-3">
        {cartItems.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {isEnglish ? "Your cart is empty." : "Tu carrito está vacío."}
          </div>
        ) : (
          cartItems.map(({ product, qty, size, key }) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border p-3 bg-white/80 dark:bg-gray-900/40">
              <img
                src={product.image}
                alt={isEnglish ? product.name_en : product.name}
                className="h-12 w-12 object-contain rounded bg-white dark:bg-gray-900"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {isEnglish ? product.name_en : product.name}
                  {size ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {isEnglish ? "Size" : "Talla"} {size}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {typeof product.priceEur === "number"
                    ? `€${product.priceEur.toFixed(2)}`
                    : isEnglish
                      ? "Ask"
                      : "Consultar"}{" "}
                  · x{qty}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeOne(key)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addOne(key)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => setQty(key, 0)}
                  title={isEnglish ? "Remove" : "Eliminar"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 sm:px-6 pt-3 pb-5 border-t flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{isEnglish ? "Total" : "Total"}</span>
          <span className="text-lg font-bold">€{totalEur.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={clearCart}
            disabled={cartItems.length === 0}
          >
            {isEnglish ? "Clear" : "Vaciar"}
          </Button>
          <a
            className="flex-1"
            href={whatsappCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (cartItems.length === 0) {
                e.preventDefault();
                toast({
                  title: isEnglish ? "Empty cart" : "Carrito vacío",
                  description: isEnglish
                    ? "Add products before checking out."
                    : "Añade productos antes de finalizar el pedido.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={cartItems.length === 0}
            >
              {isEnglish ? "WhatsApp" : "WhatsApp"}
            </Button>
          </a>
        </div>

        <div className="space-y-2">
          {anyStripeLinks ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                disabled={cartItems.length === 0 || !cartStripeEnabled}
                onClick={() => {
                  if (!cartSingleProductStripeLink) return;
                  window.open(cartSingleProductStripeLink, "_blank", "noopener,noreferrer");
                }}
                title={
                  cartItems.length !== 1
                    ? (isEnglish
                      ? "Stripe checkout is available for single-product orders (for now)."
                      : "Stripe está disponible (por ahora) solo para pedidos de 1 producto.")
                    : undefined
                }
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isEnglish ? "Pay by card (Stripe)" : "Pagar con tarjeta (Stripe)"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isEnglish
                  ? "Card payment available for single-product orders."
                  : "Pago con tarjeta disponible para pedidos de un producto."}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-28 pb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {isEnglish ? "Store" : "Tienda"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {isEnglish
                ? "Official DAME merchandise. Add to cart or order directly via WhatsApp."
                : "Merchandising oficial DAME. Añade al carrito o pide directamente por WhatsApp."}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={openCart}
            className="shrink-0 border-purple-300 dark:border-purple-700"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isEnglish ? "Cart" : "Carrito"}
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-xs px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isEnglish ? "Search products..." : "Buscar productos..."}
                className="pl-9"
              />
            </div>
            {isMobile ? (
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                <Filter className="h-4 w-4 mr-2" />
                {isEnglish ? "Filters" : "Filtros"}
              </Button>
            ) : null}
          </div>

          {!isMobile ? (
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">{isEnglish ? "Recommended" : "Recomendado"}</SelectItem>
                  <SelectItem value="price_asc">{isEnglish ? "Price: Low to high" : "Precio: menor a mayor"}</SelectItem>
                  <SelectItem value="price_desc">{isEnglish ? "Price: High to low" : "Precio: mayor a menor"}</SelectItem>
                  <SelectItem value="name_asc">{isEnglish ? "Name: A to Z" : "Nombre: A a Z"}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
                <Filter className="h-4 w-4 mr-2" />
                {isEnglish ? "Filters" : "Filtros"}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Desktop filters */}
          {!isMobile && filtersOpen ? (
            <Card className="lg:col-span-3 h-fit sticky top-28 border border-purple-100 dark:border-purple-900/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <FiltersPanel />
              </CardContent>
            </Card>
          ) : null}

          <div className={(!isMobile && filtersOpen) ? "lg:col-span-9" : "lg:col-span-12"}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                {isEnglish
                  ? `${filteredProducts.length} product(s)`
                  : `${filteredProducts.length} producto(s)`}
              </p>
              {category !== "all" ? (
                <Badge variant="secondary">{categoryLabel(category)}</Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
            const qtyKey = `${p.id}`;
            const qty = cart[qtyKey] ?? 0;
            const productHref = p.id === 1 ? "/camiseta" : `/tienda/${p.id}`;
            return (
              <Card key={p.id} className="overflow-hidden border border-purple-100 dark:border-purple-900/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <div className="relative">
                  {p.tag ? (
                    <span className="absolute top-2 left-2 z-10 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                      {p.tag}
                    </span>
                  ) : null}
                  <Link to={productHref} className="block">
                    <img
                      src={p.image}
                      alt={isEnglish ? p.name_en : p.name}
                      className="h-36 sm:h-44 w-full object-contain bg-white dark:bg-gray-900"
                      loading="lazy"
                    />
                  </Link>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Link to={productHref} className="block">
                      <h3 className="font-semibold leading-tight hover:underline underline-offset-4">
                        {isEnglish ? p.name_en : p.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isEnglish ? p.description_en : p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-bold text-purple-700 dark:text-purple-300">
                      {typeof p.priceEur === "number" ? `€${p.priceEur.toFixed(2)}` : (isEnglish ? "Ask" : "Consultar")}
                    </p>
                    {p.id === 1 ? (
                      <Link to="/camiseta">
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="sm"
                        >
                          {isEnglish ? "Customize" : "Personalizar"}
                        </Button>
                      </Link>
                    ) : p.whatsappOnly ? (
                      <Link to={`/tienda/${p.id}`}>
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="sm"
                        >
                          {isEnglish ? "Buy via WhatsApp" : "Comprar por WhatsApp"}
                        </Button>
                      </Link>
                    ) : p.sizes?.length ? (
                      <Link to={`/tienda/${p.id}`}>
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="sm"
                        >
                          {isEnglish ? "Choose size" : "Elegir talla"}
                        </Button>
                      </Link>
                    ) : qty === 0 ? (
                      <Button
                        onClick={() => addOne(qtyKey)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="sm"
                      >
                        {isEnglish ? "Add" : "Añadir"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeOne(qtyKey)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{qty}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addOne(qtyKey)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {p.stripePaymentLink ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => window.open(p.stripePaymentLink, "_blank", "noopener,noreferrer")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isEnglish ? "Buy with Stripe" : "Comprar con Stripe"}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
              })}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                {isEnglish ? "No products match your filters." : "No hay productos para esos filtros."}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop cart */}
      {!isMobile ? (
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 w-[calc(100vw-2rem)] sm:w-full">
            <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {isEnglish ? "Your cart" : "Tu carrito"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEnglish
                  ? "Complete your order via WhatsApp. Card payment available for single-product orders."
                  : "Finaliza tu pedido por WhatsApp. Pago con tarjeta disponible para pedidos de un producto."}
              </DialogDescription>
            </DialogHeader>
            <CartPanel />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {isEnglish ? "Cart" : "Carrito"}
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                {isEnglish
                  ? "Complete your order via WhatsApp."
                  : "Finaliza tu pedido por WhatsApp."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="rounded-lg border bg-background overflow-hidden">
                <CartPanel compactHeader />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Mobile filters drawer */}
      {isMobile ? (
        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center gap-2">
                <Filter className="h-5 w-5" />
                {isEnglish ? "Filters" : "Filtros"}
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                {isEnglish ? "Refine products" : "Refina productos"}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-5 overflow-y-auto">
              <FiltersPanel />
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  );
};

export default Tienda;

