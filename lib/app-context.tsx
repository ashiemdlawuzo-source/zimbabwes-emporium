'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CartItem, Order, RegisteredHub, ChatMessage, OrderStatus } from './types';

export function generateDeliveryCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
import { usePiSdk } from './use-pi-sdk';

const CART_KEY = 'ze_cart';
const ORDERS_KEY = 'ze_orders';
const HUBS_KEY = 'ze_registered_hubs';
const CHATS_KEY = 'ze_chats';
const PI_USER_KEY = 'ze_pi_user';

interface PiUser {
  uid: string;
  username: string;
}

interface AppContextValue {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Pi Auth
  piUser: PiUser | null;
  piLoading: boolean;
  piAuthenticating: boolean;
  authenticatePi: () => Promise<PiUser | null>;

  // Orders
  orders: Order[];
  saveOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  getOrder: (id: string) => Order | undefined;
  verifyDeliveryCode: (orderId: string, code: string) => boolean;
  confirmReceipt: (orderId: string) => void;
  reportProblem: (orderId: string, reason: string) => void;
  autoCompleteOrders: () => void;

  // Hubs
  registeredHubs: RegisteredHub[];
  saveHub: (hub: RegisteredHub) => void;
  approveHub: (hubId: string) => void;

  // Chat
  chats: ChatMessage[];
  sendMessage: (msg: ChatMessage) => void;
  getOrderChats: (orderId: string) => ChatMessage[];

  // Refresh trigger
  refreshTrigger: number;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { sdk, loading: sdkLoading, authenticate } = usePiSdk();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredHubs, setRegisteredHubs] = useState<RegisteredHub[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [piAuthenticating, setPiAuthenticating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setCart(safeGet<CartItem[]>(CART_KEY, []));
    setOrders(safeGet<Order[]>(ORDERS_KEY, []));
    setRegisteredHubs(safeGet<RegisteredHub[]>(HUBS_KEY, []));
    setChats(safeGet<ChatMessage[]>(CHATS_KEY, []));
    setPiUser(safeGet<PiUser | null>(PI_USER_KEY, null));
  }, []);

  const refresh = useCallback(() => {
    setCart(safeGet<CartItem[]>(CART_KEY, []));
    setOrders(safeGet<Order[]>(ORDERS_KEY, []));
    setRegisteredHubs(safeGet<RegisteredHub[]>(HUBS_KEY, []));
    setChats(safeGet<ChatMessage[]>(CHATS_KEY, []));
    setRefreshTrigger((n) => n + 1);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      let next: CartItem[];
      if (existing) {
        next = prev.map((c) =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      } else {
        next = [...prev, item];
      }
      safeSet(CART_KEY, next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const next = prev.filter((c) => c.productId !== productId);
      safeSet(CART_KEY, next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const next = prev
        .map((c) => (c.productId === productId ? { ...c, quantity: qty } : c))
        .filter((c) => c.quantity > 0);
      safeSet(CART_KEY, next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    safeSet(CART_KEY, []);
  }, []);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.pricePi * c.quantity, 0);

  const authenticatePi = useCallback(async (): Promise<PiUser | null> => {
    if (!sdk) return null;
    setPiAuthenticating(true);
    try {
      const result = await authenticate();
      if (result) {
        const user: PiUser = { uid: result.user.uid, username: result.user.username };
        setPiUser(user);
        safeSet(PI_USER_KEY, user);
        return user;
      }
      return null;
    } catch {
      return null;
    } finally {
      setPiAuthenticating(false);
    }
  }, [sdk, authenticate]);

  const saveOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const next = [order, ...prev];
      safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: Date.now() } : o
      );
      safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const updateOrder = useCallback((orderId: string, patch: Partial<Order>) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId ? { ...o, ...patch, updatedAt: Date.now() } : o
      );
      safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const verifyDeliveryCode = useCallback((orderId: string, code: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.deliveryCode) return false;
    return order.deliveryCode === code.trim();
  }, [orders]);

  const confirmReceipt = useCallback((orderId: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId ? { ...o, status: 'completed' as OrderStatus, confirmedAt: Date.now(), updatedAt: Date.now() } : o
      );
      safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const reportProblem = useCallback((orderId: string, reason: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId ? { ...o, status: 'disputed' as OrderStatus, disputeReason: reason, disputedAt: Date.now(), updatedAt: Date.now() } : o
      );
      safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const autoCompleteOrders = useCallback(() => {
    setOrders((prev) => {
      const now = Date.now();
      let changed = false;
      const next = prev.map((o) => {
        if (o.status === 'delivered_pending' && o.deliveredAt && now - o.deliveredAt > TWENTY_FOUR_HOURS) {
          changed = true;
          return { ...o, status: 'completed' as OrderStatus, confirmedAt: now, updatedAt: now };
        }
        return o;
      });
      if (changed) safeSet(ORDERS_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    autoCompleteOrders();
    const interval = setInterval(autoCompleteOrders, 60 * 1000);
    return () => clearInterval(interval);
  }, [autoCompleteOrders]);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const saveHub = useCallback((hub: RegisteredHub) => {
    setRegisteredHubs((prev) => {
      const next = [hub, ...prev];
      safeSet(HUBS_KEY, next);
      return next;
    });
  }, []);

  const approveHub = useCallback((hubId: string) => {
    setRegisteredHubs((prev) => {
      const next = prev.map((h) =>
        h.id === hubId ? { ...h, status: 'approved' as const } : h
      );
      safeSet(HUBS_KEY, next);
      return next;
    });
  }, []);

  const sendMessage = useCallback((msg: ChatMessage) => {
    setChats((prev) => {
      const next = [...prev, msg];
      safeSet(CHATS_KEY, next);
      return next;
    });
  }, []);

  const getOrderChats = useCallback(
    (orderId: string) => chats.filter((c) => c.orderId === orderId).sort((a, b) => a.createdAt - b.createdAt),
    [chats]
  );

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        piUser,
        piLoading: sdkLoading,
        piAuthenticating,
        authenticatePi,
        orders,
        saveOrder,
        updateOrderStatus,
        updateOrder,
        getOrder,
        verifyDeliveryCode,
        confirmReceipt,
        reportProblem,
        autoCompleteOrders,
        registeredHubs,
        saveHub,
        approveHub,
        chats,
        sendMessage,
        getOrderChats,
        refreshTrigger,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
