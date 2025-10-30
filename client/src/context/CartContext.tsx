import React, { createContext, useContext, useEffect, useReducer } from 'react';

type CartItem = { id: string; title: string; price: number; qty: number; inventory?: number };

type State = { items: CartItem[] };

type Action =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; id: string }
  | { type: 'updateQty'; id: string; qty: number }
  | { type: 'clear' };

const initial: State = { items: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        // increase qty but not beyond inventory
        const newQty = Math.min((existing.inventory || 9999), existing.qty + action.item.qty);
        return { items: state.items.map(i => i.id === existing.id ? { ...i, qty: newQty } : i) };
      }
      return { items: [...state.items, action.item] };
    }
    case 'remove':
      return { items: state.items.filter(i => i.id !== action.id) };
    case 'updateQty':
      return { items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) };
    case 'clear':
      return { items: [] };
    default:
      return state;
  }
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(state)); } catch {}
  }, [state]);

  const api = {
    items: state.items,
    add: (item: CartItem) => dispatch({ type: 'add', item }),
    remove: (id: string) => dispatch({ type: 'remove', id }),
    updateQty: (id: string, qty: number) => dispatch({ type: 'updateQty', id, qty }),
    clear: () => dispatch({ type: 'clear' })
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
