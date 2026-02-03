import camisetaPersonalizadaImg from "@/assets/camisetablanca.png";

export type StoreCategory = "ropa";

export type StoreProduct = {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  image: string;
  category: StoreCategory;
  tag?: string;
  priceEur?: number;
  whatsappOnly?: boolean;
  sizes?: string[];
  stripePaymentLink?: string;
};

// key -> qty. key can include variant: "2:M"
export type CartState = Record<string, number>;

export const CART_STORAGE_KEY = "dame_tienda_cart_v1";
export const WHATSAPP_NUMBER = "34658236665";

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 1,
    name: "Camiseta DAME personalizada",
    name_en: "Custom DAME T-shirt",
    description: "Camiseta personalizada. Escríbenos por WhatsApp para diseñarla.",
    description_en: "Custom t-shirt. Message us on WhatsApp to design it.",
    image: camisetaPersonalizadaImg, // placeholder hasta que pases el logo/imagen final
    category: "ropa",
    tag: "Personalizada",
    whatsappOnly: true,
  },
  {
    id: 2,
    name: "Camiseta Unisex DameFestival",
    name_en: "Unisex DameFestival T-shirt",
    description: "Camiseta oficial del festival, unisex. Elige tu talla. El pago se realiza en efectivo en el momento de la entrega.",
    description_en: "Official festival t-shirt, unisex. Choose your size. Payment in cash on delivery.",
    image: "/CAMISETA (1080 x 1080 px).png",
    category: "ropa",
    tag: "Festival",
    priceEur: 19.9,
    sizes: ["XS", "S", "M", "L", "XL"],
    whatsappOnly: true,
  },
];

