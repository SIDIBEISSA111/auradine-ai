import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Utensils,
  ChefHat,
  Package,
  Leaf,
  Clock,
  Award,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Wine,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  X,
  ChevronRight,
  Check,
  Bell,
  BarChart3
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

type View = 'dashboard' | 'menu' | 'kds' | 'inventory';

type Dish = {
  id: string;
  name: string;
  category: string;
  price: number;
  prepTime: number; // minutes
  co2Impact: number; // kg CO2e
  calories: number;
  dietary: string[];
  allergens: string[];
  description: string;
  image: string;
  winePairing: string;
  isEcoHighlight: boolean;
};

type OrderStatus = 'todo' | 'in_progress' | 'ready' | 'served';

type KdsOrder = {
  id: string;
  table: string;
  guestCount: number;
  createdAt: string; // ISO
  status: OrderStatus;
  items: { name: string; quantity: number; notes: string }[];
  carbonScore: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  expiryDays: number;
  status: 'optimal' | 'expiring' | 'critical';
  unitPrice: number;
};

type CartItem = { dish: Dish; quantity: number };

type ToastType = 'success' | 'warning' | 'info';

type Toast = { id: number; message: string; type: ToastType; title: string };

// ==========================================
// MOCK DATA & INITIAL STATES
// ==========================================

const INITIAL_DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Pavé de Saumon Bio Encroûté aux Herbes',
    category: 'Plats Principaux',
    price: 32.00,
    prepTime: 14,
    co2Impact: 0.8, // kg CO2e
    calories: 520,
    dietary: ['Sans Gluten', 'Bas Carbone'],
    allergens: ['Poisson'],
    description: 'Saumon sauvage de pêche durable, mousseline de céleri à la truffe douce et jeunes pousses bio du potager.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Chablis Premier Cru 2021',
    isEcoHighlight: true
  },
  {
    id: 'd2',
    name: 'Risotto Végétal aux Champignons Sauvages & Truffe',
    category: 'Plats Principaux',
    price: 28.50,
    prepTime: 12,
    co2Impact: 0.3,
    calories: 440,
    dietary: ['Végétalien', 'Sans Gluten', 'Kéto', 'Bas Carbone'],
    allergens: ['Fruits à coque'],
    description: 'Riz Carnaroli bio, émulsion de truffe noire d’Alba, cèpes poêlés et tuile de parmesan végétal.',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Pinot Noir Domaine Leflaive',
    isEcoHighlight: true
  },
  {
    id: 'd3',
    name: 'Tartare de Thon Rouge & Avocat à la Citronnelle',
    category: 'Entrées',
    price: 24.00,
    prepTime: 10,
    co2Impact: 0.6,
    calories: 310,
    dietary: ['Sans Gluten', 'Halal', 'Kéto'],
    allergens: ['Poisson', 'Sésame'],
    description: 'Thon d’origine éco-certifiée, dés d’avocat Hass, sésame grillé et vinaigrette ponzu yuzu.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Sancerre Blanc Les Baronnes',
    isEcoHighlight: false
  },
  {
    id: 'd4',
    name: 'Filet de Bœuf Simmental & Jus Réduit au Thym',
    category: 'Plats Principaux',
    price: 42.00,
    prepTime: 18,
    co2Impact: 2.4,
    calories: 680,
    dietary: ['Halal', 'Kéto'],
    allergens: ['Sulfites'],
    description: 'Bœuf élevé en plein air dans le Massif Central, écrasé de pommes de terre de Noirmoutier au beurre d’Échiré.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Saint-Émilion Grand Cru 2018',
    isEcoHighlight: false
  },
  {
    id: 'd5',
    name: 'Carpaccio de Saint-Jacques & Caviar Végétal',
    category: 'Entrées',
    price: 26.00,
    prepTime: 8,
    co2Impact: 0.4,
    calories: 220,
    dietary: ['Sans Gluten', 'Bas Carbone'],
    allergens: ['Mollusques'],
    description: 'Saint-Jacques de la Baie de Seine, huile de combava, perles de citron caviar et fleurs comestibles.',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Champagne Laurent-Perrier Brut',
    isEcoHighlight: true
  },
  {
    id: 'd6',
    name: 'Boulgour Bio aux Légumes Rôtis & Hummus d’Édamamés',
    category: 'Plats Principaux',
    price: 22.00,
    prepTime: 9,
    co2Impact: 0.2,
    calories: 390,
    dietary: ['Végétalien', 'Halal', 'Bas Carbone'],
    allergens: ['Sésame'],
    description: 'Courgettes, carottes anciennes rôties aux épices douces, grenades fraîches et réduction de balsamique blanc.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Côtes de Provence Rosé Premium',
    isEcoHighlight: true
  },
  {
    id: 'd7',
    name: 'Dôme en Chocolat Valrhona & Cœur Passion',
    category: 'Desserts',
    price: 16.00,
    prepTime: 7,
    co2Impact: 0.5,
    calories: 410,
    dietary: ['Végétarien'],
    allergens: ['Lait', 'Soja'],
    description: 'Chocolat noir 70% équitable, coulis tiède de fruit de la passion et éclats de noisettes péruviennes.',
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Sauternes Château Guiraud',
    isEcoHighlight: false
  },
  {
    id: 'd8',
    name: 'Pavlova Végétale aux Fruits Rouges de Saison',
    category: 'Desserts',
    price: 15.00,
    prepTime: 6,
    co2Impact: 0.3,
    calories: 280,
    dietary: ['Végétalien', 'Sans Gluten', 'Bas Carbone'],
    allergens: [],
    description: 'Meringue d’aquafaba, crème montée au coco-vanille de Madagascar et framboises fraîches locales.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Moscato d’Asti Sparkling',
    isEcoHighlight: true
  },
  {
    id: 'd10',
    name: 'Magret de Canard du Sud-Ouest aux Figues',
    category: 'Plats Principaux',
    price: 36.00,
    prepTime: 16,
    co2Impact: 1.8,
    calories: 610,
    dietary: ['Sans Gluten', 'Halal'],
    allergens: ['Sulfites'],
    description: 'Canard fermier label rouge, mousseline de patate douce au gingembre et jus infusé aux figues rôties.',
    image: 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=800&q=80',
    winePairing: 'Châteauneuf-du-Pape Red 2019',
    isEcoHighlight: false
  }
];

// Plat du jour proposé par l'« IA » anti-gaspi : il n'est ajouté à la carte
// que lorsqu'on clique sur « Activer le Plat Anti-Gaspi » ou « Injecter au Menu ».
const ANTI_WASTE_DISH: Dish = {
  id: 'd9',
  name: 'Velouté Éco-Responsable Truffe & Champignons',
  category: 'Entrées',
  price: 19.50,
  prepTime: 11,
  co2Impact: 0.2,
  calories: 260,
  dietary: ['Végétarien', 'Sans Gluten', 'Bas Carbone'],
  allergens: ['Lait'],
  description: 'Recette créative anti-gaspillage optimisée par IA à partir de surstocks d’ingrédients frais d’aujourd’hui.',
  image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  winePairing: 'Meursault Domaine Coche-Dury',
  isEcoHighlight: true
};

const INITIAL_KDS_ORDERS: KdsOrder[] = [
  {
    id: 'ORD-801',
    table: 'Table 04',
    guestCount: 2,
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    status: 'todo', // todo, in_progress, ready
    items: [
      { name: 'Pavé de Saumon Bio Encroûté', quantity: 1, notes: 'Cuisson unilatérale' },
      { name: 'Tartare de Thon Rouge', quantity: 1, notes: 'Sans sésame' }
    ],
    carbonScore: '0.7 kg CO2'
  },
  {
    id: 'ORD-802',
    table: 'Table 12',
    guestCount: 4,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    status: 'in_progress',
    items: [
      { name: 'Risotto Végétal aux Champignons', quantity: 2, notes: 'Extra truffe' },
      { name: 'Filet de Bœuf Simmental', quantity: 2, notes: 'Saignant' }
    ],
    carbonScore: '1.4 kg CO2'
  },
  {
    id: 'ORD-803',
    table: 'VIP Salon Vatel',
    guestCount: 6,
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    status: 'in_progress',
    items: [
      { name: 'Carpaccio de Saint-Jacques', quantity: 3, notes: 'Entrées prioritaires' },
      { name: 'Velouté Éco-Responsable Truffe', quantity: 3, notes: 'Bien chaud' }
    ],
    carbonScore: '0.9 kg CO2'
  },
  {
    id: 'ORD-804',
    table: 'Table 08',
    guestCount: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'todo',
    items: [
      { name: 'Boulgour Bio aux Légumes Rôtis', quantity: 1, notes: 'Sans oignons' },
      { name: 'Dôme en Chocolat Valrhona', quantity: 1, notes: 'Service direct' }
    ],
    carbonScore: '0.4 kg CO2'
  },
  {
    id: 'ORD-805',
    table: 'Terrasse 02',
    guestCount: 3,
    createdAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    status: 'ready',
    items: [
      { name: 'Magret de Canard aux Figues', quantity: 2, notes: 'À po point' },
      { name: 'Pavlova Végétale', quantity: 1, notes: 'Bougie anniversaire' }
    ],
    carbonScore: '1.2 kg CO2'
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Pavé de Saumon Bio (Norvège)', category: 'Poissons', currentStock: 4.2, minStock: 5.0, unit: 'kg', expiryDays: 1, status: 'expiring', unitPrice: 38.00 },
  { id: 'i2', name: 'Courgettes Bio Locales', category: 'Légumes', currentStock: 14.5, minStock: 6.0, unit: 'kg', expiryDays: 2, status: 'expiring', unitPrice: 3.20 },
  { id: 'i3', name: 'Truffe Noire d’Alba', category: 'Épicerie Fine', currentStock: 0.3, minStock: 0.2, unit: 'kg', expiryDays: 12, status: 'optimal', unitPrice: 1200.00 },
  { id: 'i4', name: 'Champignons de Paris Bio', category: 'Légumes', currentStock: 8.0, minStock: 4.0, unit: 'kg', expiryDays: 3, status: 'expiring', unitPrice: 6.50 },
  { id: 'i5', name: 'Filet de Bœuf Simmental', category: 'Viandes', currentStock: 2.1, minStock: 8.0, unit: 'kg', expiryDays: 5, status: 'critical', unitPrice: 48.00 },
  { id: 'i6', name: 'Riz Carnaroli Supérieur', category: 'Épicerie', currentStock: 25.0, minStock: 10.0, unit: 'kg', expiryDays: 90, status: 'optimal', unitPrice: 5.40 },
  { id: 'i7', name: 'Thon Rouge Pêche Sélective', category: 'Poissons', currentStock: 6.8, minStock: 5.0, unit: 'kg', expiryDays: 3, status: 'optimal', unitPrice: 42.00 },
  { id: 'i8', name: 'Coquilles Saint-Jacques', category: 'Poissons', currentStock: 3.5, minStock: 4.0, unit: 'kg', expiryDays: 2, status: 'expiring', unitPrice: 55.00 },
  { id: 'i9', name: 'Chocolat Noir Valrhona 70%', category: 'Pâtisserie', currentStock: 12.0, minStock: 5.0, unit: 'kg', expiryDays: 180, status: 'optimal', unitPrice: 22.00 },
  { id: 'i10', name: 'Crème Fraîche Bio d’Isigny', category: 'Produits Frais', currentStock: 1.2, minStock: 5.0, unit: 'L', expiryDays: 4, status: 'critical', unitPrice: 4.80 },
  { id: 'i11', name: 'Avocats Hass Bio', category: 'Légumes', currentStock: 9.0, minStock: 4.0, unit: 'kg', expiryDays: 5, status: 'optimal', unitPrice: 8.50 },
  { id: 'i12', name: 'Framboises Locales Bio', category: 'Fruits', currentStock: 2.4, minStock: 2.0, unit: 'kg', expiryDays: 2, status: 'expiring', unitPrice: 18.00 }
];

const HOURLY_ORDER_DATA = [
  { hour: '11h', count: 12, rev: 480 },
  { hour: '12h', count: 34, rev: 1360 },
  { hour: '13h', count: 48, rev: 1920 },
  { hour: '14h', count: 22, rev: 880 },
  { hour: '19h', count: 28, rev: 1120 },
  { hour: '20h', count: 56, rev: 2240 },
  { hour: '21h', count: 42, rev: 1680 },
  { hour: '22h', count: 18, rev: 720 },
];

const CARBON_TREND_DATA = [
  { day: 'Lun', co2Saved: 38, wastePrevented: '12 kg' },
  { day: 'Mar', co2Saved: 42, wastePrevented: '15 kg' },
  { day: 'Mer', co2Saved: 55, wastePrevented: '19 kg' },
  { day: 'Jeu', co2Saved: 49, wastePrevented: '16 kg' },
  { day: 'Ven', co2Saved: 68, wastePrevented: '24 kg' },
  { day: 'Sam', co2Saved: 84, wastePrevented: '31 kg' },
  { day: 'Dim', co2Saved: 76, wastePrevented: '27 kg' },
];

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<View>('dashboard');

  // Data States
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [kdsOrders, setKdsOrders] = useState<KdsOrder[]>(INITIAL_KDS_ORDERS);
  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTip, setSelectedTip] = useState(5); // % tip
  const [isAntiWasteModalOpen, setIsAntiWasteModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Heure courante pour les minuteurs du KDS (rafraîchie toutes les 30 s)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Toast Notification System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info', title = 'Notification') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Filters State for Menu View
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [ecoFilterOnly, setEcoFilterOnly] = useState(false);
  const [fastPrepOnly, setFastPrepOnly] = useState(false);

  // AI Sommelier State
  const [selectedSommelierDish, setSelectedSommelierDish] = useState<Dish | null>(null);

  // Stats Calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const co2Saved = cart.reduce((sum, item) => sum + (1.5 - item.dish.co2Impact) * item.quantity, 0);
    const tipAmount = (subtotal * selectedTip) / 100;
    const grandTotal = subtotal + tipAmount;
    return {
      subtotal,
      co2Saved: Math.max(0, co2Saved).toFixed(2),
      tipAmount,
      grandTotal
    };
  }, [cart, selectedTip]);

  // Cart Handlers
  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
    addToast(`${dish.name} ajouté au panier éco-responsable.`, 'success', 'Ajout au Panier');
  };

  const updateCartQuantity = (dishId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.dish.id === dishId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const tableNum = `Table ${Math.floor(Math.random() * 20) + 1}`;
    const newOrder: KdsOrder = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      table: tableNum,
      guestCount: Math.floor(Math.random() * 4) + 1,
      createdAt: new Date().toISOString(),
      status: 'todo',
      items: cart.map((item) => ({
        name: item.dish.name,
        quantity: item.quantity,
        notes: item.dish.dietary.join(', ') || 'Standard'
      })),
      carbonScore: `${(Number(cartTotals.co2Saved) * 0.8).toFixed(1)} kg CO2`
    };

    setKdsOrders((prev) => [newOrder, ...prev]);
    clearCart();
    addToast(`Commande envoyée au KDS en cuisine pour la ${tableNum}!`, 'success', 'Commande Confirmée');
  };

  // KDS Status Transition
  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setKdsOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: nextStatus };
        }
        return order;
      })
    );
    const statusLabels: Record<OrderStatus, string> = {
      todo: 'À Préparer',
      in_progress: 'En Cuisine',
      ready: 'Prêt à Servir',
      served: 'Livré'
    };
    addToast(`Commande ${orderId} passée à: ${statusLabels[nextStatus]}`, 'info', 'Mise à jour KDS');
  };

  // AI Push Urgent Alert Dish to Menu
  const handlePushAIDishToMenu = () => {
    const existing = dishes.find((d) => d.id === ANTI_WASTE_DISH.id);
    if (existing) {
      addToast('Le Plat Anti-Gaspi du Jour est déjà actif sur la carte client.', 'warning', 'IA Optimisation');
    } else {
      setDishes((prev) => [ANTI_WASTE_DISH, ...prev]);
      addToast('Nouveau plat éco-conçu injecté en direct dans la carte client!', 'success', 'Succès Anti-Gaspi');
    }
  };

  // Filter Dishes Logic
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Category filter
      if (selectedCategory !== 'Tous' && dish.category !== selectedCategory) return false;
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = dish.name.toLowerCase().includes(query);
        const matchDesc = dish.description.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      // Dietary filter (MUST match all selected tags)
      if (selectedDietary.length > 0) {
        const hasAllDietary = selectedDietary.every((tag) => dish.dietary.includes(tag));
        if (!hasAllDietary) return false;
      }
      // Eco highlight
      if (ecoFilterOnly && !dish.isEcoHighlight) return false;
      // Fast prep time
      if (fastPrepOnly && dish.prepTime > 12) return false;

      return true;
    });
  }, [dishes, selectedCategory, searchQuery, selectedDietary, ecoFilterOnly, fastPrepOnly]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-900 selection:text-amber-400">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-emerald-950/95 text-white border-b border-emerald-800 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Vatel Badge */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-md border border-amber-300">
              <Leaf className="w-7 h-7 text-emerald-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-white font-serif">
                  AuraDine <span className="text-amber-400 font-sans text-xl">AI</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 tracking-widest uppercase">
                  Vatel Hackathon Edition
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium hidden sm:block">
                Smart Dining & Eco-Restaurant System
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics Header Counter */}
          <div className="hidden lg:flex items-center space-x-6 bg-emerald-900/60 px-4 py-2 rounded-xl border border-emerald-700/50">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <div>
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Service En Cours</p>
                <p className="text-xs font-bold text-white">Service du Soir • 42 Couverts</p>
              </div>
            </div>
            <div className="h-6 w-px bg-emerald-700/60" />
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Empreinte Évitée</p>
                <p className="text-xs font-bold text-amber-300">423 kg CO₂ / Semaine</p>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 transition-colors border border-emerald-700/50"
              title="Alertes & Suggestions IA"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-950 animate-pulse" />
            </button>

            {/* Client Cart Button Indicator */}
            <button
              onClick={() => setActiveView('menu')}
              className="relative flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 px-4 py-2.5 rounded-xl font-bold shadow-md transition-all border border-amber-300"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Panier</span>
              {cart.length > 0 && (
                <span className="bg-emerald-950 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER & NAVIGATION ================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 h-fit sticky top-24 z-30">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:block">
            Navigation Vues
          </div>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeView === 'dashboard'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/20 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="truncate">Dashboard & Eco-Analytics</span>
          </button>

          <button
            onClick={() => setActiveView('menu')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeView === 'menu'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/20 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-900'
            }`}
          >
            <Utensils className={`w-5 h-5 ${activeView === 'menu' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="truncate">Menu Client Interactif</span>
          </button>

          <button
            onClick={() => setActiveView('kds')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all justify-between ${
              activeView === 'kds'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/20 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-900'
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              <ChefHat className={`w-5 h-5 ${activeView === 'kds' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="truncate">Cuisine KDS</span>
            </div>
            {kdsOrders.filter((o) => o.status !== 'ready').length > 0 && (
              <span className="bg-amber-500 text-emerald-950 font-bold text-xs px-2 py-0.5 rounded-full">
                {kdsOrders.filter((o) => o.status !== 'ready').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('inventory')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeView === 'inventory'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-900/20 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-900'
            }`}
          >
            <Package className={`w-5 h-5 ${activeView === 'inventory' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="truncate">Stocks & Anti-Gaspi</span>
          </button>

          <div className="mt-auto pt-4 border-t border-slate-100 hidden md:block">
            <div className="bg-gradient-to-br from-emerald-50 to-amber-50/50 p-3 rounded-xl border border-emerald-100/60">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>IA Assistant Actif</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Prédictions de consommation et alertes surstocks réactualisées en temps réel.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="flex-1 min-w-0">
          
          {/* ================= VUE 1 : DASHBOARD OPÉRATIONNEL & ECO-ANALYTICS ================= */}
          {activeView === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Welcome Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
                  <Leaf className="w-64 h-64 text-amber-400" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-400/30 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tableau de Bord Exécutif Vatel Management</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
                    Performance Opérationnelle & Impact Écologique
                  </h1>
                  <p className="text-emerald-100/80 text-sm mt-2 leading-relaxed">
                    Pilotage de l'établissement en temps réel avec optimisation anti-gaspillage par intelligence artificielle.
                  </p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Chiffre d'Affaires</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">3 420 €</span>
                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3 mr-1" /> +12.4%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Objectif du jour (3 000 €) atteint</p>
                </div>

                {/* KPI 2 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Taux d'Occupation</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">88 %</span>
                    <span className="text-xs font-semibold text-slate-500">22 / 25 Tables</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Score Anti-Gaspi</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <Leaf className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-900">94 / 100</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      Excellent
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Seulement 2.1 kg de pertes cette semaine</p>
                </div>

                {/* KPI 4 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Temps de Service</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">14 min</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      -2 min vs cible
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Optimisation KDS fluide</p>
                </div>

              </div>

              {/* Urgent AI Priority Suggestion Banner */}
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-emerald-900/10 border-2 border-amber-400/60 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 bg-amber-500 text-emerald-950 rounded-xl shadow-md shrink-0 mt-0.5">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500 text-emerald-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                        Alerte Prioritaire IA Stock
                      </span>
                      <span className="text-xs font-semibold text-amber-800">Surstock Détecté</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Surplus imminent : Pavé de Saumon Bio (4.2 kg) & Courgettes (14.5 kg)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Péremption estimée à 24h. L'IA recommande d'injecter la suggestion "Velouté Éco-Responsable & Tartare de Saumon" au menu client avec une remise solidaire de 15%.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePushAIDishToMenu}
                  className="shrink-0 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 border border-emerald-700 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Activer le Plat Anti-Gaspi en Carte</span>
                </button>
              </div>

              {/* Visual Charts Grid (SVG Interactive Charts) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Hourly Orders Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-800" />
                        Commandes & Chiffre d'Affaires par Heure
                      </h3>
                      <p className="text-xs text-slate-500">Distribution du flux client sur la journée</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Aujourd'hui
                    </span>
                  </div>

                  {/* Custom SVG Bar Chart */}
                  <div className="h-64 w-full pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

                      {/* Bars */}
                      {HOURLY_ORDER_DATA.map((d, index) => {
                        const barWidth = 36;
                        const gap = (500 - HOURLY_ORDER_DATA.length * barWidth) / (HOURLY_ORDER_DATA.length + 1);
                        const x = gap + index * (barWidth + gap);
                        const maxVal = 60;
                        const height = (d.count / maxVal) * 140;
                        const y = 160 - height;
                        
                        return (
                          <g key={d.hour} className="group cursor-pointer">
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={height}
                              rx="6"
                              className="fill-emerald-800 hover:fill-amber-500 transition-colors"
                            />
                            <text
                              x={x + barWidth / 2}
                              y="185"
                              textAnchor="middle"
                              className="text-[10px] fill-slate-400 font-medium"
                            >
                              {d.hour}
                            </text>
                            <text
                              x={x + barWidth / 2}
                              y={y - 8}
                              textAnchor="middle"
                              className="text-[10px] fill-emerald-950 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {d.count} cdes
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"/> Volume de Commandes</span>
                    <span className="font-semibold text-slate-700">Pointe de service à 20h (56 cdes)</span>
                  </div>
                </div>

                {/* Chart 2: 7-Day Carbon Footprint Saved */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-emerald-800" />
                        Économies Carbone & Anti-Gaspi (7 Jours)
                      </h3>
                      <p className="text-xs text-slate-500">kg CO₂ évités grâce aux algorithmes d'ingrédients</p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                      +18% ce mois
                    </span>
                  </div>

                  {/* Custom SVG Line Chart */}
                  <div className="h-64 w-full pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0F5132" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0F5132" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d="M 30,140 L 95,130 L 160,100 L 225,115 L 290,70 L 355,30 L 420,50 L 420,170 L 30,170 Z"
                        fill="url(#emeraldGradient)"
                      />

                      {/* Line */}
                      <path
                        d="M 30,140 L 95,130 L 160,100 L 225,115 L 290,70 L 355,30 L 420,50"
                        fill="none"
                        stroke="#0F5132"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      {CARBON_TREND_DATA.map((pt, idx) => {
                        const coords = [
                          { x: 30, y: 140 },
                          { x: 95, y: 130 },
                          { x: 160, y: 100 },
                          { x: 225, y: 115 },
                          { x: 290, y: 70 },
                          { x: 355, y: 30 },
                          { x: 420, y: 50 },
                        ];
                        const c = coords[idx];
                        return (
                          <g key={pt.day} className="group cursor-pointer">
                            <circle cx={c.x} cy={c.y} r="5" className="fill-amber-400 stroke-emerald-950 stroke-2" />
                            <text x={c.x} y="190" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                              {pt.day}
                            </text>
                            <text x={c.x} y={c.y - 10} textAnchor="middle" className="text-[10px] fill-slate-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              {pt.co2Saved}kg
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> Réduction Empreinte Carbone</span>
                    <span className="font-semibold text-slate-700">Record samedi (84 kg évités)</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= VUE 2 : EXPÉRIENCE CLIENT & MENU INTERACTIF ================= */}
          {activeView === 'menu' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              
              {/* MENU CONTENT (LEFT 2 COLUMNS) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Search & Multi-criteria Filter Bar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un plat, ingrédient ou saveur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800/30 focus:border-emerald-800"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Category Selector */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
                    >
                      <option value="Tous">Toutes les catégories</option>
                      <option value="Entrées">Entrées</option>
                      <option value="Plats Principaux">Plats Principaux</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  {/* Dietary Tags Toggle Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Régimes :</span>
                    
                    {['Végétalien', 'Sans Gluten', 'Halal', 'Kéto'].map((tag) => {
                      const isActive = selectedDietary.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedDietary((prev) =>
                              isActive ? prev.filter((t) => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-emerald-900 text-white shadow-sm font-semibold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}

                    <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                    {/* Eco & Prep Fast Toggles */}
                    <button
                      onClick={() => setEcoFilterOnly(!ecoFilterOnly)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                        ecoFilterOnly
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Bas Carbone Éco-Conçu</span>
                    </button>

                    <button
                      onClick={() => setFastPrepOnly(!fastPrepOnly)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                        fastPrepOnly
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>&lt; 15 min de prep</span>
                    </button>
                  </div>
                </div>

                {/* AI Sommelier Accord Mets-Vins Suggestion Box */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-400/30 shrink-0">
                      <Wine className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Sommelier IA & Accord Mets-Vins
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        Besoin d'un conseil d'accord gastronomique sur mesure ?
                      </h4>
                      <p className="text-xs text-emerald-200/80">
                        Sélectionnez un plat pour découvrir la recommandation d'alliance avec la cave Vatel.
                      </p>
                    </div>
                  </div>

                  {selectedSommelierDish ? (
                    <div className="bg-emerald-900/80 p-3 rounded-xl border border-amber-400/40 text-xs shrink-0 max-w-xs text-right">
                      <p className="text-amber-300 font-bold">{selectedSommelierDish.name}</p>
                      <p className="text-emerald-100 mt-0.5">🍷 Accord : {selectedSommelierDish.winePairing}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic shrink-0">
                      Cliquez sur l'icône 🍷 d'un plat
                    </span>
                  )}
                </div>

                {/* Dish Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Image & Badges */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {dish.isEcoHighlight && (
                            <span className="bg-emerald-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center space-x-1 shadow-sm">
                              <Leaf className="w-3 h-3 text-amber-400" />
                              <span>Éco-Conçu</span>
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => setSelectedSommelierDish(dish)}
                            className="bg-slate-900/80 backdrop-blur-md hover:bg-amber-500 hover:text-emerald-950 text-amber-300 p-2 rounded-full border border-amber-400/30 transition-colors"
                            title="Consulter l'accord vin recommandé"
                          >
                            <Wine className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-900 transition-colors">
                              {dish.name}
                            </h3>
                            <span className="font-black text-emerald-900 text-base shrink-0">
                              {dish.price.toFixed(2)} €
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {dish.description}
                          </p>
                        </div>

                        {/* Dietary & Meta Tags */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1">
                            {dish.dietary.map((tag) => (
                              <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {dish.prepTime} min prep
                            </span>
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <Leaf className="w-3 h-3 text-emerald-600" />
                              {dish.co2Impact} kg CO₂
                            </span>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(dish)}
                          className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all border border-emerald-800 active:scale-[0.99]"
                        >
                          <Plus className="w-4 h-4 text-amber-400" />
                          <span>Ajouter au Panier Éco</span>
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {filteredDishes.length === 0 && (
                  <div className="bg-white p-12 rounded-2xl text-center border border-slate-200">
                    <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">Aucun plat trouvé</h3>
                    <p className="text-xs text-slate-400 mt-1">Essayez de réinitialiser vos filtres de recherche.</p>
                    <button
                      onClick={() => {
                        setSelectedDietary([]);
                        setSelectedCategory('Tous');
                        setSearchQuery('');
                        setEcoFilterOnly(false);
                        setFastPrepOnly(false);
                      }}
                      className="mt-4 text-xs font-bold text-emerald-800 underline"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                )}

              </div>

              {/* CART DRAWER / SIDEBAR (RIGHT COLUMN) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sticky top-24 space-y-5">
                  
                  {/* Cart Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Votre Panier</h3>
                        <p className="text-xs text-slate-400">Commande Table ou Limité</p>
                      </div>
                    </div>
                    {cart.length > 0 && (
                      <button onClick={clearCart} className="text-xs text-red-500 hover:underline">
                        Vider
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <ShoppingBag className="w-10 h-10 mx-auto text-slate-200" />
                      <p className="text-xs">Votre panier est actuellement vide.</p>
                      <p className="text-[11px] text-slate-400">Sélectionnez des mets éco-conçus à gauche.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.dish.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-slate-800 leading-snug">{item.dish.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.dish.price.toFixed(2)} € × {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => updateCartQuantity(item.dish.id, -1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-slate-800 px-1">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.dish.id, 1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Eco Carbon Saved Badge */}
                  {cart.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-amber-50/60 p-3.5 rounded-xl border border-emerald-100/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <Leaf className="w-4 h-4 text-emerald-700" /> Impact Carbone Évité
                        </span>
                        <span className="text-emerald-700">{cartTotals.co2Saved} kg CO₂</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Repas optimisé : -40% d'émissions vs un menu gastronomique traditionnel.
                      </p>
                    </div>
                  )}

                  {/* Eco-Solidaire Tip Selector */}
                  {cart.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Pourboire Éco-Solidaire</span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Dédié à la reboisement local
                        </span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 5, 10, 15].map((tip) => (
                          <button
                            key={tip}
                            onClick={() => setSelectedTip(tip)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              selectedTip === tip
                                ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tip}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals & Submit Order */}
                  {cart.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Sous-total</span>
                          <span>{cartTotals.subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Pourboire Éco ({selectedTip}%)</span>
                          <span>{cartTotals.tipAmount.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 text-base pt-1 border-t border-slate-200">
                          <span>Total à régler</span>
                          <span className="text-emerald-900">{cartTotals.grandTotal.toFixed(2)} €</span>
                        </div>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-gradient-to-r from-emerald-900 to-emerald-950 hover:from-emerald-950 hover:to-slate-900 text-amber-300 font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 border border-emerald-700 active:scale-[0.99]"
                      >
                        <CheckCircle className="w-4 h-4 text-amber-400" />
                        <span>Confirmer la Commande & Transmettre</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* ================= VUE 3 : KITCHEN DISPLAY SYSTEM / KDS ================= */}
          {activeView === 'kds' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Info Banner */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-emerald-800" />
                    Kitchen Display System (KDS Live)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestion fluide des bons de commande par statut avec alertes chronométrées
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Vert : &lt; 10 min
                  </span>
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                    Orange : 10-18 min
                  </span>
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-800 px-3 py-1.5 rounded-lg border border-red-200 font-semibold">
                    Rouge : &gt; 18 min
                  </span>
                </div>
              </div>

              {/* 3 Columns Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* COLUMN 1: À PRÉPARER (TODO) */}
                <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col space-y-4 min-h-[500px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      À Préparer ({kdsOrders.filter((o) => o.status === 'todo').length})
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Nouvelles</span>
                  </div>

                  <div className="space-y-4 flex-1">
                    {kdsOrders
                      .filter((o) => o.status === 'todo')
                      .map((order) => {
                        const minsElapsed = Math.floor(
                          (now - new Date(order.createdAt).getTime()) / 60000
                        );
                        let timerColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        if (minsElapsed >= 10 && minsElapsed < 18) {
                          timerColor = 'bg-amber-100 text-amber-800 border-amber-300';
                        } else if (minsElapsed >= 18) {
                          timerColor = 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse';
                        }

                        return (
                          <div
                            key={order.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                                <span className="text-xs text-slate-500 font-semibold ml-2">({order.table})</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${timerColor}`}>
                                {minsElapsed} min
                              </span>
                            </div>

                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-start">
                                  <span className="font-semibold">
                                    {item.quantity}× {item.name}
                                  </span>
                                  {item.notes && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                      {item.notes}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                🌱 {order.carbonScore}
                              </span>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'in_progress')}
                                className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                              >
                                <span>Lancer Cuisine</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {kdsOrders.filter((o) => o.status === 'todo').length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                        <span>Aucune commande en attente</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: EN COURS (IN_PROGRESS) */}
                <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col space-y-4 min-h-[500px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                      En Cours de Cuisson ({kdsOrders.filter((o) => o.status === 'in_progress').length})
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Aux Fourneaux</span>
                  </div>

                  <div className="space-y-4 flex-1">
                    {kdsOrders
                      .filter((o) => o.status === 'in_progress')
                      .map((order) => {
                        const minsElapsed = Math.floor(
                          (now - new Date(order.createdAt).getTime()) / 60000
                        );
                        let timerColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        if (minsElapsed >= 10 && minsElapsed < 18) {
                          timerColor = 'bg-amber-100 text-amber-800 border-amber-300';
                        } else if (minsElapsed >= 18) {
                          timerColor = 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse';
                        }

                        return (
                          <div
                            key={order.id}
                            className="bg-white p-4 rounded-xl shadow-sm border-2 border-blue-200 space-y-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                                <span className="text-xs text-slate-500 font-semibold ml-2">({order.table})</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${timerColor}`}>
                                {minsElapsed} min
                              </span>
                            </div>

                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-start">
                                  <span className="font-semibold">
                                    {item.quantity}× {item.name}
                                  </span>
                                  {item.notes && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                      {item.notes}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                🌱 {order.carbonScore}
                              </span>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                              >
                                <span>Marquer Prêt</span>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {kdsOrders.filter((o) => o.status === 'in_progress').length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                        <span>Aucun plat en cours de préparation</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: PRÊT À SERVIR (READY) */}
                <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col space-y-4 min-h-[500px]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                      Prêt à Servir ({kdsOrders.filter((o) => o.status === 'ready').length})
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Passe Plat</span>
                  </div>

                  <div className="space-y-4 flex-1">
                    {kdsOrders
                      .filter((o) => o.status === 'ready')
                      .map((order) => (
                        <div
                          key={order.id}
                          className="bg-emerald-50/60 p-4 rounded-xl shadow-sm border border-emerald-200 space-y-3 opacity-90"
                        >
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                            <div>
                              <span className="font-extrabold text-emerald-950 text-sm">{order.id}</span>
                              <span className="text-xs text-emerald-800 font-semibold ml-2">({order.table})</span>
                            </div>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                              Prêt !
                            </span>
                          </div>

                          <ul className="space-y-1 text-xs text-slate-700">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="font-medium">
                                {item.quantity}× {item.name}
                              </li>
                            ))}
                          </ul>

                          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Service imminent</span>
                            <button
                              onClick={() => {
                                setKdsOrders((prev) => prev.filter((o) => o.id !== order.id));
                                addToast(`Commande ${order.id} servie en salle!`, 'success', 'Service Effectué');
                              }}
                              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                            >
                              Archiver
                            </button>
                          </div>
                        </div>
                      ))}

                    {kdsOrders.filter((o) => o.status === 'ready').length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                        <span>Passe plat vide</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= VUE 4 : GESTION DES STOCKS & ANTI-GASPILLAGE ================= */}
          {activeView === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Title & AI Generator Action */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-800" />
                    Gestion des Stocks & Algorithme Anti-Gaspi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inventaire intelligent en temps réel avec calcul de péremption prioritaire
                  </p>
                </div>

                <button
                  onClick={() => setIsAntiWasteModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 border border-amber-300 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>Générer Recette IA Anti-Gaspi</span>
                </button>
              </div>

              {/* Data Table Container */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{inventory.length} Ingrédients Référencés</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{inventory.filter((item) => item.expiryDays < 3).length} Péremptions Proches (&lt; 3 jours)</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-4">Ingrédient</th>
                        <th className="py-3.5 px-4">Catégorie</th>
                        <th className="py-3.5 px-4">Niveau de Stock</th>
                        <th className="py-3.5 px-4">Péremption</th>
                        <th className="py-3.5 px-4">Prix Unitaire</th>
                        <th className="py-3.5 px-4">Statut IA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map((item) => {
                        const stockRatio = Math.min(100, (item.currentStock / (item.minStock * 2.5)) * 100);
                        
                        let statusBadge = (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            Optimal
                          </span>
                        );
                        if (item.status === 'expiring') {
                          statusBadge = (
                            <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px] flex items-center w-fit gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Péremption Proche
                            </span>
                          );
                        } else if (item.status === 'critical') {
                          statusBadge = (
                            <span className="bg-red-50 text-red-900 border border-red-300 font-bold px-2.5 py-1 rounded-full text-[10px] flex items-center w-fit gap-1">
                              <ShieldAlert className="w-3 h-3 text-red-600" /> Réappro Requis
                            </span>
                          );
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                            <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                            <td className="py-3.5 px-4 w-48">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-bold text-slate-700">
                                  {item.currentStock} {item.unit}
                                </span>
                                <span className="text-slate-400 text-[10px]">Min: {item.minStock} {item.unit}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.status === 'expiring'
                                      ? 'bg-amber-500'
                                      : item.status === 'critical'
                                      ? 'bg-red-500'
                                      : 'bg-emerald-700'
                                  }`}
                                  style={{ width: `${stockRatio}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`font-semibold ${item.expiryDays <= 2 ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                                {item.expiryDays} jour{item.expiryDays > 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {item.unitPrice.toFixed(2)} € / {item.unit}
                            </td>
                            <td className="py-3.5 px-4">{statusBadge}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ================= MODALE INTERACTIVE IA ANTI-GASPI ================= */}
      {isAntiWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-amber-300/40 relative space-y-5">
            <button
              onClick={() => setIsAntiWasteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-500 text-emerald-950 rounded-xl shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Algorithme Culinaire Vatel AI
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-serif">
                  Formule Anti-Gaspillage Générée
                </h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 rounded-2xl space-y-3 border border-emerald-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Plat du Jour Recommandé
                  </span>
                  <h4 className="text-base font-bold text-amber-300 mt-1">
                    Velouté Éco-Responsable Truffe & Champignons Sauvages
                  </h4>
                </div>
                <span className="text-lg font-black text-white">19.50 €</span>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Formulé scientifiquement pour résorber 4.2 kg de Saumon et 14.5 kg de Courgettes proches de la date limite avec zéro perte d'arôme.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/80 text-center text-xs">
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-300">Coût / Portion</p>
                  <p className="font-bold text-white">3.40 €</p>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-300">Marge Brute</p>
                  <p className="font-bold text-amber-400">82.5%</p>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-lg">
                  <p className="text-[10px] text-emerald-300">Pertes Évitées</p>
                  <p className="font-bold text-emerald-300">18.7 kg</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAntiWasteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsAntiWasteModalOpen(false);
                  handlePushAIDishToMenu();
                }}
                className="bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2 border border-emerald-700"
              >
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Injecter Directement au Menu Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DRAWER NOTIFICATIONS SYSTEM ================= */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between border-l border-slate-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-emerald-900" />
                  <h3 className="font-bold text-slate-900 text-base">Alertes & IA Insights</h3>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900">💡 Suggestion IA Stocks</span>
                  <p className="text-slate-700">Stock de Pavé de Saumon proche de l'expiration. Option anti-gaspi activable.</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-900">🌱 Objectif RSE Atteint</span>
                  <p className="text-slate-700">Plus de 400 kg de CO₂ évités cette semaine grâce aux menus éco-conçus.</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900">⏱️ Performance KDS</span>
                  <p className="text-slate-700">Temps moyen de préparation réduit à 14 minutes sur le service en cours.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
            >
              Fermer le panneau
            </button>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATIONS CONTAINER ================= */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-emerald-500/40 flex items-start space-x-3 animate-slide-up"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h5 className="font-bold text-xs text-amber-300">{toast.title}</h5>
              <p className="text-xs text-slate-200 mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}