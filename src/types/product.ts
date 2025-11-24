export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  cartId?: string;
  quantity?: number; // quantity in cart
}
