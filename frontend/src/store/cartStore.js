import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '../services/api';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Get cart from server
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartApi.get();
          set({ items: response.data.items || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      // Add item to cart
      addItem: async (product, variant, quantity = 1) => {
        try {
          const response = await cartApi.add({
            productId: product.id,
            variantId: variant?.id,
            quantity,
          });
          
          // Update local state
          const existingItem = get().items.find(
            (item) => item.productId === product.id && item.variantId === variant?.id
          );

          if (existingItem) {
            set({
              items: get().items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          } else {
            set({ items: [...get().items, response.data] });
          }

          toast.success('Đã thêm vào giỏ hàng!');
        } catch (error) {
          toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
      },

      // Update item quantity
      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) return;
        
        try {
          await cartApi.update(itemId, quantity);
          set({
            items: get().items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          });
        } catch (error) {
          toast.error('Không thể cập nhật số lượng');
        }
      },

      // Remove item from cart
      removeItem: async (itemId) => {
        try {
          await cartApi.remove(itemId);
          set({ items: get().items.filter((item) => item.id !== itemId) });
          toast.success('Đã xóa khỏi giỏ hàng');
        } catch (error) {
          toast.error('Không thể xóa sản phẩm');
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          await cartApi.clear();
          set({ items: [] });
        } catch (error) {
          set({ items: [] });
        }
      },

      // Local cart operations (for guest users)
      addItemLocal: (product, variant, quantity = 1) => {
        const existingItem = get().items.find(
          (item) => item.productId === product.id && item.variantId === variant?.id
        );

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.productId === product.id && item.variantId === variant?.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem = {
            id: Date.now(),
            productId: product.id,
            product: product,
            variantId: variant?.id,
            variant: variant,
            quantity,
            price: variant?.price || product.salePrice || product.basePrice,
          };
          set({ items: [...get().items, newItem] });
        }
        toast.success('Đã thêm vào giỏ hàng!');
      },

      updateQuantityLocal: (itemId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      removeItemLocal: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
        toast.success('Đã xóa khỏi giỏ hàng');
      },

      clearCartLocal: () => set({ items: [] }),

      // Computed values
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((total, item) => {
          const price = item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice || 0;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.price || item.variant?.price || item.product?.salePrice || item.product?.basePrice || 0;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
