import './style.css';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ===== API & STATE =====
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:8000/api/v1';
const CURRENT_USER_ID = localStorage.getItem('nutrijj_user_id') || 'usr_' + Math.random().toString(36).substring(2, 9);
localStorage.setItem('nutrijj_user_id', CURRENT_USER_ID);

let currentParty: any = null;
let partyPollingInterval: any = null;

// ===== DATA =====
let MEALS_DATA: any[] = [
  {
    id: 1, name: "Açaí Power Bowl", type: "breakfast", emoji: "🫐", calories: 420, protein: 18, carbs: 52, fat: 14, prepTime: 10, difficulty: "Easy", budget: "low", diet: ["balanced", "vegan"], aiScore: 96,
    description: "Antioxidant-rich açaí blended with banana, topped with granola, berries, and chia seeds.",
    aiExplanation: "This meal fills your Vitamin C gap from yesterday and provides complex carbs ideal for your morning workout at 7 AM. The chia seeds add omega-3s which support your cardiovascular recovery based on your elevated resting heart rate.",
    image: "/meal_breakfast.png",
    recipeIngredients: ["3 Ripe Bananas", "1 cup Milk", "2 tbsp Peanut Butter", "2 tbsp Instant Oats", "1 tbsp Cocoa Powder", "4 Dates", "4 tbsp Walnuts", "1/4 cup Wheat Bran", "2 tbsp Cranberries"],
    recipeInstructions: "1. Add bananas, milk, peanut butter, oats, cocoa powder, and dates to a blender.\n2. Blend until smooth.\n3. Pour into a bowl.\n4. Top with walnuts, banana slices, wheat bran, and cranberries.\n5. Serve immediately."
  },
  {
    id: 2, name: "Grilled Salmon & Quinoa", type: "lunch", emoji: "🐟", calories: 580, protein: 42, carbs: 38, fat: 24, prepTime: 25, difficulty: "Medium", budget: "mid", diet: ["balanced", "mediterranean", "paleo"], aiScore: 94,
    description: "Wild-caught salmon with fluffy quinoa, roasted asparagus, and lemon-dill sauce.",
    aiExplanation: "Your wearable data shows 8,200 steps by noon — this high-protein meal supports muscle synthesis. Omega-3 from salmon improves your HRV trend which has been declining this week.",
    recipeIngredients: ["1/2 cup Olive Oil", "5 cloves Garlic", "2.5 tbsp Lemon Juice", "1 tbsp Brown Sugar", "1 tsp Dried Oregano", "1 tsp Dried Thyme", "Salt & Pepper", "3 lb Salmon Fillet", "1/4 cup Parsley", "1 Lemon, sliced"],
    recipeInstructions: "1. Preheat oven to 375°F (190°C).\n2. Combine olive oil, garlic, lemon juice, sugar, oregano, thyme, salt, and pepper.\n3. Place salmon on foil on a baking sheet. Drizzle with mixture.\n4. Fold foil over salmon to seal.\n5. Bake 20-25 minutes until flaky.\n6. Garnish with parsley and lemon."
  },
  {
    id: 3, name: "Chicken Buddha Bowl", type: "dinner", emoji: "🥗", calories: 520, protein: 38, carbs: 45, fat: 18, prepTime: 30, difficulty: "Medium", budget: "low", diet: ["balanced"], aiScore: 92,
    description: "Grilled chicken breast over brown rice with roasted sweet potato, broccoli, and tahini drizzle.",
    aiExplanation: "Based on your calorie expenditure of 2,400 kcal today, this balanced dinner keeps you within your macro targets. The sweet potato provides slow-release carbs for overnight muscle recovery.",
    recipeIngredients: ["2.5 qts Chicken Stock", "2 lbs Chicken Legs", "3 Carrots, chopped", "1 White Onion, chopped", "2 stalks Celery, chopped", "1/4 cup Cilantro", "1 clove Garlic", "1 tbsp Mint", "3 cups Cooked Rice", "1 Avocado", "2 Limes"],
    recipeInstructions: "1. Boil stock over high heat. Add chicken.\n2. Reduce heat, cover, and simmer 10 mins. Skim foam.\n3. Add carrots, onion, celery, cilantro, garlic, mint.\n4. Cook 30 mins until chicken is tender. Shred meat, discard bones.\n5. Return chicken to pot, season. Serve over rice with avocado and lime."
  },
  {
    id: 4, name: "Greek Yogurt Parfait", type: "snack", emoji: "🍯", calories: 280, protein: 20, carbs: 32, fat: 8, prepTime: 5, difficulty: "Easy", budget: "low", diet: ["balanced"], aiScore: 90,
    description: "Thick Greek yogurt layered with honey, mixed nuts, and fresh seasonal berries.",
    aiExplanation: "Your pantry has Greek yogurt expiring tomorrow — this snack uses it perfectly. The casein protein supports overnight recovery, ideal before your 10 PM bedtime.",
    recipeIngredients: ["1 cup Strawberries", "1 Banana", "1/2 cup Greek Yogurt", "1/4 cup Pineapple Juice", "1.5 tsp Honey", "1 tsp Orange Juice", "1 tbsp Mixed Nuts"],
    recipeInstructions: "1. Slice strawberries and banana.\n2. In a glass, add a layer of Greek yogurt.\n3. Add a layer of sliced fruit and nuts.\n4. Drizzle with honey and juices.\n5. Repeat layers until ingredients are used."
  },
  {
    id: 5, name: "Avocado Toast Stack", type: "breakfast", emoji: "🥑", calories: 380, protein: 14, carbs: 35, fat: 22, prepTime: 8, difficulty: "Easy", budget: "low", diet: ["balanced", "vegan"], aiScore: 88,
    description: "Sourdough toast with smashed avocado, cherry tomatoes, microgreens, and everything seasoning.",
    aiExplanation: "Healthy fats from avocado support your cognitive function for the busy morning ahead. Your sleep score was 72 last night — the B vitamins here help with energy restoration.",
    recipeIngredients: ["4 slices Whole-Grain Bread", "1 Avocado, pitted", "2 tbsp Parsley", "1.5 tsp Olive Oil", "1/2 Lemon, juiced", "1/2 tsp Salt & Pepper", "1/2 tsp Onion & Garlic Powder", "Cherry Tomatoes"],
    recipeInstructions: "1. Toast bread slices.\n2. Scoop avocado into a bowl. Mash with parsley, olive oil, lemon juice, and seasonings.\n3. Spread avocado mixture onto toast.\n4. Top with sliced cherry tomatoes and microgreens."
  },
  {
    id: 6, name: "Turkey Meatball Pasta", type: "dinner", emoji: "🍝", calories: 620, protein: 36, carbs: 58, fat: 22, prepTime: 35, difficulty: "Medium", budget: "mid", diet: ["balanced"], aiScore: 87,
    description: "Lean turkey meatballs in marinara sauce over whole wheat penne with parmesan.",
    aiExplanation: "You've had an intense activity day (12,000+ steps). This carb-rich dinner replenishes glycogen stores. Turkey provides lean protein without excess saturated fat, aligning with your heart health goals.",
    recipeIngredients: ["1 lb Ground Turkey", "1/2 cup Breadcrumbs", "1 Egg", "1/4 cup Parmesan", "1 tsp Garlic Powder", "1 jar Marinara Sauce", "8 oz Whole Wheat Penne", "1 tbsp Olive Oil"],
    recipeInstructions: "1. Boil pasta according to package.\n2. Mix turkey, breadcrumbs, egg, parmesan, and spices. Form meatballs.\n3. Heat oil in a pan, brown meatballs on all sides.\n4. Add marinara sauce, simmer for 15 minutes.\n5. Serve meatballs and sauce over pasta."
  },
  {
    id: 7, name: "Keto Steak Bowl", type: "lunch", emoji: "🥩", calories: 550, protein: 45, carbs: 8, fat: 38, prepTime: 20, difficulty: "Medium", budget: "high", diet: ["keto", "paleo"], aiScore: 85,
    description: "Grass-fed ribeye strips with cauliflower rice, avocado, and chimichurri.",
    aiExplanation: "This keto-friendly option maintains your fat-adaptation goals. The high protein supports your strength training recovery from this morning's gym session.",
    recipeIngredients: ["2 tbsp Olive Oil", "2 tbsp Lime Juice", "2 cloves Garlic", "4 Steak Strips", "1 Avocado", "1/4 cup Bell Pepper", "1/2 Onion", "2 tbsp Cilantro", "1 Jalapeno", "Spices (Paprika, Cayenne, Thyme, Oregano)"],
    recipeInstructions: "1. Whisk oil, lime juice, and garlic. Marinate steak for 1 hour.\n2. Mix avocado, peppers, onion, cilantro, and jalapeno for salsa.\n3. Mix spices, coat steak.\n4. Sear steak in a hot skillet, 3 mins per side.\n5. Serve over cauliflower rice topped with salsa."
  },
  {
    id: 8, name: "Tropical Smoothie Bowl", type: "snack", emoji: "🥭", calories: 310, protein: 12, carbs: 48, fat: 8, prepTime: 7, difficulty: "Easy", budget: "low", diet: ["balanced", "vegan"], aiScore: 83,
    description: "Mango-pineapple smoothie bowl topped with coconut flakes, granola, and kiwi.",
    aiExplanation: "Your hydration levels are slightly low today. This water-rich snack helps rehydrate while providing quick energy from natural fruit sugars for your afternoon activities.",
    recipeIngredients: ["1/2 Mango, chopped", "1/2 cup Low-Fat Yogurt", "1/2 cup Almond Milk", "1/2 cup Ice", "1 scoop Vanilla Protein Powder", "1 tsp Honey", "Kiwi & Coconut Flakes (for topping)"],
    recipeInstructions: "1. Add mango, yogurt, almond milk, ice, protein powder, and honey to a blender.\n2. Blend until smooth and thick.\n3. Pour into a bowl.\n4. Garnish with coconut flakes, granola, and sliced kiwi."
  },
  {
    id: 9, name: "Mediterranean Wrap", type: "lunch", emoji: "🌯", calories: 480, protein: 28, carbs: 42, fat: 20, prepTime: 12, difficulty: "Easy", budget: "low", diet: ["balanced", "mediterranean"], aiScore: 91,
    description: "Whole wheat wrap with hummus, grilled chicken, feta, cucumbers, and tzatziki.",
    aiExplanation: "Quick to prepare and nutrient-dense — perfect for your busy schedule today. The probiotics in tzatziki support gut health, which correlates with your improved sleep pattern.",
    recipeIngredients: ["1 Whole Wheat Wrap", "2 tbsp Hummus", "4 oz Grilled Chicken", "1/4 cup Feta Cheese", "1/2 Cucumber, sliced", "2 tbsp Tzatziki", "A handful of Spinach"],
    recipeInstructions: "1. Lay the wrap flat.\n2. Spread hummus evenly over the wrap.\n3. Layer spinach, cucumber, chicken, and feta.\n4. Drizzle with tzatziki sauce.\n5. Roll up tightly, tucking in the ends."
  },
  {
    id: 10, name: "Protein Power Shake", type: "snack", emoji: "🥤", calories: 350, protein: 35, carbs: 28, fat: 10, prepTime: 3, difficulty: "Easy", budget: "low", diet: ["balanced", "keto"], aiScore: 89,
    description: "Whey protein blended with banana, peanut butter, oat milk, and a handful of spinach.",
    aiExplanation: "Post-workout window detected! Your Fitbit logged a workout ending 20 minutes ago. This shake delivers fast-absorbing protein for optimal muscle protein synthesis timing.",
    recipeIngredients: ["6 Ice Cubes", "1 cup Oat Milk", "1 Banana", "1 scoop Chocolate Protein Powder", "2 tbsp Peanut Butter", "1 tbsp Honey", "1 tsp Cocoa Powder", "Handful of Spinach"],
    recipeInstructions: "1. Crush ice slightly.\n2. Add milk, banana, protein powder, peanut butter, honey, cocoa, and spinach.\n3. Blend on high until perfectly smooth.\n4. Serve immediately."
  },
];

const PANTRY_DATA = [
  { name: "Chicken Breast", qty: "1.2 kg", cat: "protein", emoji: "🍗", expiry: "2026-03-01" },
  { name: "Greek Yogurt", qty: "500g", cat: "dairy", emoji: "🥛", expiry: "2026-02-25" },
  { name: "Brown Rice", qty: "2 kg", cat: "grains", emoji: "🍚", expiry: "2026-06-15" },
  { name: "Broccoli", qty: "400g", cat: "produce", emoji: "🥦", expiry: "2026-02-27" },
  { name: "Eggs (12)", qty: "10 left", cat: "protein", emoji: "🥚", expiry: "2026-03-05" },
  { name: "Sweet Potato", qty: "800g", cat: "produce", emoji: "🍠", expiry: "2026-03-02" },
  { name: "Salmon Fillet", qty: "500g", cat: "protein", emoji: "🐟", expiry: "2026-02-26" },
  { name: "Quinoa", qty: "1 kg", cat: "grains", emoji: "🌾", expiry: "2026-08-10" },
  { name: "Avocados", qty: "3 pcs", cat: "produce", emoji: "🥑", expiry: "2026-02-26" },
  { name: "Oat Milk", qty: "1L", cat: "dairy", emoji: "🥛", expiry: "2026-03-08" },
  { name: "Spinach", qty: "200g", cat: "produce", emoji: "🥬", expiry: "2026-02-26" },
  { name: "Almonds", qty: "300g", cat: "protein", emoji: "🥜", expiry: "2026-05-20" },
];

const GROCERY_DATA = [
  { name: "Açaí Packets (4)", basePrice: 8.99, checked: false },
  { name: "Fresh Berries Mix", basePrice: 5.49, checked: false },
  { name: "Whole Wheat Bread", basePrice: 3.29, checked: true },
  { name: "Chia Seeds", basePrice: 6.99, checked: false },
  { name: "Turkey Mince 500g", basePrice: 7.49, checked: false },
  { name: "Marinara Sauce", basePrice: 3.99, checked: true },
  { name: "Peanut Butter", basePrice: 4.79, checked: false },
];

// ===== CURRENCY DETECTION =====
interface CurrencyInfo {
  code: string;
  rate: number; // approximate exchange rate from USD
}

function detectCurrency(): CurrencyInfo {
  try {
    const locale = navigator.language || 'en-US';
    const regionMatch = locale.match(/[-_]([A-Z]{2})$/i);
    const region = regionMatch ? regionMatch[1].toUpperCase() : '';

    const regionToCurrency: Record<string, CurrencyInfo> = {
      'IN': { code: 'INR', rate: 83.5 },
      'GB': { code: 'GBP', rate: 0.79 },
      'EU': { code: 'EUR', rate: 0.92 },
      'DE': { code: 'EUR', rate: 0.92 },
      'FR': { code: 'EUR', rate: 0.92 },
      'IT': { code: 'EUR', rate: 0.92 },
      'ES': { code: 'EUR', rate: 0.92 },
      'NL': { code: 'EUR', rate: 0.92 },
      'JP': { code: 'JPY', rate: 149.5 },
      'CN': { code: 'CNY', rate: 7.24 },
      'KR': { code: 'KRW', rate: 1320 },
      'AU': { code: 'AUD', rate: 1.53 },
      'CA': { code: 'CAD', rate: 1.36 },
      'BR': { code: 'BRL', rate: 4.97 },
      'MX': { code: 'MXN', rate: 17.1 },
      'PK': { code: 'PKR', rate: 278.5 },
      'BD': { code: 'BDT', rate: 110 },
      'LK': { code: 'LKR', rate: 312 },
      'AE': { code: 'AED', rate: 3.67 },
      'SA': { code: 'SAR', rate: 3.75 },
      'ZA': { code: 'ZAR', rate: 18.5 },
      'NG': { code: 'NGN', rate: 1550 },
      'SE': { code: 'SEK', rate: 10.5 },
      'NO': { code: 'NOK', rate: 10.8 },
      'DK': { code: 'DKK', rate: 6.88 },
      'CH': { code: 'CHF', rate: 0.88 },
      'NZ': { code: 'NZD', rate: 1.65 },
      'SG': { code: 'SGD', rate: 1.34 },
      'HK': { code: 'HKD', rate: 7.82 },
      'TW': { code: 'TWD', rate: 31.5 },
      'TH': { code: 'THB', rate: 35.5 },
      'MY': { code: 'MYR', rate: 4.72 },
      'PH': { code: 'PHP', rate: 56.2 },
      'ID': { code: 'IDR', rate: 15600 },
      'RU': { code: 'RUB', rate: 92 },
      'TR': { code: 'TRY', rate: 30.5 },
      'PL': { code: 'PLN', rate: 4.05 },
      'CZ': { code: 'CZK', rate: 23.2 },
      'HU': { code: 'HUF', rate: 358 },
      'IL': { code: 'ILS', rate: 3.64 },
      'EG': { code: 'EGP', rate: 30.9 },
      'KE': { code: 'KES', rate: 153 },
      'AR': { code: 'ARS', rate: 850 },
      'CL': { code: 'CLP', rate: 935 },
      'CO': { code: 'COP', rate: 3950 },
      'PE': { code: 'PEN', rate: 3.72 },
    };

    if (region && regionToCurrency[region]) {
      return regionToCurrency[region];
    }

    // Fallback: try to detect from locale prefix
    const langRegionMap: Record<string, string> = {
      'hi': 'IN', 'bn': 'IN', 'ta': 'IN', 'te': 'IN', 'mr': 'IN', 'gu': 'IN', 'kn': 'IN', 'ml': 'IN', 'pa': 'IN', 'ur': 'PK',
      'ja': 'JP', 'ko': 'KR', 'zh': 'CN', 'th': 'TH', 'vi': 'VN', 'id': 'ID', 'ms': 'MY',
      'de': 'DE', 'fr': 'FR', 'it': 'IT', 'es': 'ES', 'pt': 'BR', 'nl': 'NL', 'pl': 'PL',
      'ru': 'RU', 'tr': 'TR', 'ar': 'SA', 'he': 'IL', 'sv': 'SE', 'da': 'DK', 'nb': 'NO', 'fi': 'EU',
    };
    const langCode = locale.split(/[-_]/)[0].toLowerCase();
    const mappedRegion = langRegionMap[langCode];
    if (mappedRegion && regionToCurrency[mappedRegion]) {
      return regionToCurrency[mappedRegion];
    }
  } catch { /* fallback */ }

  return { code: 'USD', rate: 1 };
}

function formatPrice(basePriceUSD: number): string {
  const curr = detectCurrency();
  const converted = basePriceUSD * curr.rate;
  try {
    return new Intl.NumberFormat(navigator.language || 'en-US', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: curr.rate > 100 ? 0 : 2,
      maximumFractionDigits: curr.rate > 100 ? 0 : 2,
    }).format(converted);
  } catch {
    return `${curr.code} ${converted.toFixed(2)}`;
  }
}

const TIMELINE_DATA = [
  { name: "Açaí Power Bowl", time: "7:30 AM", cals: 420, emoji: "🫐", completed: true, selected: true },
  { name: "Mediterranean Wrap", time: "12:30 PM", cals: 480, emoji: "🌯", completed: true, selected: true },
  { name: "Greek Yogurt Parfait", time: "3:30 PM", cals: 280, emoji: "🍯", completed: false, selected: true },
  { name: "Chicken Buddha Bowl", time: "7:00 PM", cals: 520, emoji: "🥗", completed: false, selected: true },
];

// ===== GLOBAL USER STATE =====
export const userProfile = {
  points: 1250,
  dms: 88,
  streak: 8,
  level: 52
};

export function calculateTier(points: number): string {
  if (points >= 50000) return 'Jeremite';
  if (points >= 20000) return 'Amethyst';
  if (points >= 10000) return 'Plutonium';
  if (points >= 5000) return 'Uranium';
  if (points >= 2500) return 'Dynamite';
  if (points >= 1000) return 'Crystal';
  return 'Neon';
}

export function updateProfileHUD() {
  const ptsDisp = document.getElementById('hudPoints');
  if (ptsDisp) ptsDisp.textContent = userProfile.points.toLocaleString() + ' pts';

  const tierName = calculateTier(userProfile.points);
  const tierConfig = getTierConfig(tierName);

  const heroTierDisp = document.getElementById('heroTierDisplay');
  const heroTierIcon = document.getElementById('heroTierContainer');

  if (heroTierDisp) {
    heroTierDisp.innerHTML = `${tierName} &middot; DMS ${userProfile.dms}`;
  }
  if (heroTierIcon && tierConfig) {
    heroTierIcon.innerHTML = `${tierConfig.icon}<span class="hero-stat-val" id="heroTierDisplay">${tierName} &middot; DMS ${userProfile.dms}</span>`;
  }
}

// ===== HELPERS =====
const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
const $$ = (s: string) => document.querySelectorAll(s);

function sanitizeInput(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function animateCount(el: HTMLElement, target: number, duration = 1200) {
  let start = 0;
  const step = (ts: number) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning, Jeremy";
  if (h < 17) return "Good afternoon, Jeremy";
  return "Good evening, Jeremy";
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initRouter();
  initSidebar();
  initTheme();
  initNotifications();
  initDashboard();
  initMeals();
  initPantry();
  initProfile();
  initModals();
  initAnimations();
  initWater();
  initChallenge();
  initDevices();
  initGeoMeals();
  initScan();
  initSessionTimeout();
  initCommunity();
  initQuests();
  initSearch();
  updateProfileHUD();
});

// ===== ROUTER =====
function initRouter() {
  const navItems = $$('.nav-item');
  function navigate(page: string) {
    $$('.page').forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    const target = $(`#page-${page}`);
    if (target) {
      target.classList.add('active');
      const nav = $(`.nav-item[data-page="${page}"]`);
      if (nav) nav.classList.add('active');
      triggerAnimations(target);
    }
  }
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const el = item as HTMLElement;
      const page = el.dataset.page;
      if (page) {
        window.location.hash = page;
        navigate(page);
      }
      if ($('#sidebar') && window.innerWidth < 768) {
        $('#sidebar')?.classList.remove('mobile-open');
      }
    });
  });
  const hash = window.location.hash.slice(1) || 'dashboard';
  navigate(hash);
  window.addEventListener('hashchange', () => navigate(window.location.hash.slice(1) || 'dashboard'));
}

// ===== SIDEBAR =====
function initSidebar() {
  const sidebar = $('#sidebar');
  const toggle = $('#sidebarToggle');
  const mobileBtn = $('#mobileMenuBtn');
  if (toggle && sidebar) toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  if (mobileBtn && sidebar) mobileBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  document.addEventListener('click', e => {
    if (sidebar && window.innerWidth < 768 && !sidebar.contains(e.target as Node) && mobileBtn && !mobileBtn.contains(e.target as Node)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

// ===== THEME =====
function initTheme() {
  const toggle = $('#themeToggle');
  const saved = localStorage.getItem('nutrijj-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nutrijj-theme', next);
      updateChartsTheme();
    });
  }
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#94a3b8' : '#475569',
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    bg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  };
}

// ===== NOTIFICATIONS =====
function initNotifications() {
  const btn = $('#notifBtn');
  const panel = $('#notifPanel');
  if (btn && panel) btn.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('active'); });
  document.addEventListener('click', e => { if (panel && !panel.contains(e.target as Node)) panel.classList.remove('active'); });
  const notifClear = $('#notifClear');
  if (notifClear) {
    notifClear.addEventListener('click', () => {
      $$('.notif-item').forEach(i => i.classList.remove('unread'));
      const badge = $('.notif-badge');
      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });
  }
}

// ===== WEB BLUETOOTH TYPE STUBS =====
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: any): Promise<any>;
    };
  }
}

// ===== DASHBOARD =====
declare global {
  interface Window {
    macroChart: any;
    weeklyChart: any;
    metabolicTrendChart: any;
    bodyCompChart: any;
    sleepNutritionChart: any;
    toggleMeal: (index: number) => void;
    swapMeal: (index: number) => void;
    openMealModal: (id: number) => void;
    rateMeal: (el: HTMLElement, rating: number) => void;
    addWater: (ml: number) => void;
    resetWater: () => void;
    joinChallenge: (btn: HTMLElement) => void;
    pairBluetoothDevice: () => void;
    toggleDeviceExpand: () => void;
  }
}
function initDashboard() {
  const greetingEl = $('#greeting');
  if (greetingEl) greetingEl.textContent = getGreeting();
  const now = new Date();
  const dateEl = $('#dateDisplay');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Animate metrics
  setTimeout(() => {
    const hr = $('#heartRate');
    const calories = $('#caloriesBurned');
    const steps = $('#steps');
    const sleep = $('#sleepScore');
    const hrv = $('#hrv');
    const active = $('#activeMin');

    if (hr) animateCount(hr, 72);
    if (calories) animateCount(calories, 1847);
    if (steps) animateCount(steps, 8432);
    if (sleep) animateCount(sleep, 85);
    if (hrv) animateCount(hrv, 48);
    if (active) animateCount(active, 67);
    animateMetabolicScore(82);
  }, 300);

  drawSparklines();
  initMacroChart();
  initWeeklyChart();
  renderTimeline();
}

function drawSparklines() {
  const configs = [
    { id: 'sparkHeart', data: [68, 71, 73, 70, 72, 74, 71, 69, 72], color: '#f43f5e' },
    { id: 'sparkCalories', data: [1200, 1400, 1600, 1500, 1700, 1650, 1847], color: '#f97316' },
    { id: 'sparkSteps', data: [5000, 6200, 7100, 6800, 8000, 7500, 8432], color: '#10b981' },
    { id: 'sparkSleep', data: [78, 80, 82, 79, 83, 84, 85], color: '#8b5cf6' },
    { id: 'sparkHRV', data: [42, 44, 43, 46, 45, 47, 48], color: '#f43f5e' },
    { id: 'sparkActive', data: [45, 52, 60, 55, 62, 58, 67], color: '#06b6d4' },
  ];
  configs.forEach(c => {
    const canvas = document.getElementById(c.id) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const max = Math.max(...c.data), min = Math.min(...c.data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    c.data.forEach((v, i) => {
      const x = (i / (c.data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function initMacroChart() {
  const ctx = document.getElementById('macroChart');
  if (!ctx) return;
  window.macroChart = new Chart(ctx as any, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        data: [120, 180, 65],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 4,
        borderRadius: 6
      }]
    },
    options: { cutout: '75%', responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${c.raw} kcal` } } } }
  });
}

function initWeeklyChart() {
  const ctx = document.getElementById('weeklyCalorieChart');
  if (!ctx) return;
  const colors = getChartColors();
  window.weeklyChart = new Chart(ctx as any, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Intake', data: [2100, 2250, 2150, 2300, 2400, 2600, 2200], backgroundColor: 'rgba(16,185,129,0.6)', borderRadius: 6, barPercentage: 0.5 },
        { label: 'Expenditure', data: [2300, 2150, 2400, 2200, 2350, 2100, 2400], backgroundColor: 'rgba(6,182,212,0.3)', borderRadius: 6, barPercentage: 0.5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text, font: { size: 11 } } },
        y: { grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 } }, beginAtZero: false, min: 1800 }
      },
      plugins: { legend: { labels: { color: colors.text, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } } }
    }
  });
}

function animateMetabolicScore(target: number) {
  const arc = document.getElementById('gaugeArc');
  const numEl = document.getElementById('metabolicScore');
  if (!arc || !numEl) return;
  const total = 534;
  let current = 0;
  const step = () => {
    current += 1;
    if (current > target) current = target;
    numEl.textContent = current.toString();
    const currentOffset = total - (current / 100) * total;
    arc.setAttribute('stroke-dashoffset', currentOffset.toString());
    if (current < target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderTimeline() {
  const container = $('#mealTimeline');
  if (!container) return;
  container.innerHTML = TIMELINE_DATA.map((m, i) => `
    <div class="timeline-item ${m.completed ? '' : ''} ${m.selected === false ? 'deselected' : ''}">
      <span class="timeline-emoji" style="display:flex;align-items:center;justify-content:center;opacity:0.8;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg></span>
      <div class="timeline-info">
        <div class="timeline-name">${m.name}</div>
        <div class="timeline-time">${m.time}</div>
      </div>
      <span class="timeline-cals">${m.cals} kcal</span>
      <button class="timeline-toggle ${m.selected !== false ? 'checked' : ''}" onclick="window.toggleMeal(${i})">✓</button>
      <button class="timeline-swap" onclick="window.swapMeal(${i})" title="Swap meal">⇄</button>
    </div>
  `).join('');
  updateMealBadge();
}

function updateMealBadge() {
  const badge = document.getElementById('mealPlanBadge');
  if (!badge) return;
  const active = TIMELINE_DATA.filter(m => m.selected !== false).length;
  badge.textContent = `${active} meals`;
}

window.toggleMeal = function (index: number) {
  TIMELINE_DATA[index].selected = TIMELINE_DATA[index].selected === false ? true : false;
  renderTimeline();
};

window.swapMeal = function (index: number) {
  const alternatives = [
    { name: 'Overnight Oats', emoji: '🥣', cals: 350 },
    { name: 'Poke Bowl', emoji: '🍣', cals: 490 },
    { name: 'Veggie Stir-Fry', emoji: '🥦', cals: 380 },
    { name: 'Turkey Club Wrap', emoji: '🌯', cals: 440 },
    { name: 'Protein Smoothie', emoji: '🥤', cals: 320 },
  ];
  const alt = alternatives[Math.floor(Math.random() * alternatives.length)];
  TIMELINE_DATA[index] = { ...TIMELINE_DATA[index], name: alt.name, emoji: alt.emoji, cals: alt.cals };
  renderTimeline();
};

// ===== MEALS =====
function initMeals() {
  renderMeals(MEALS_DATA);
  ['filterDiet', 'filterMealType', 'filterPrepTime', 'filterBudget'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', filterMeals);
  });
  
  fetchRecommendations();
}

async function fetchRecommendations() {
  try {
    const payload = {
      user_profile: {
        user_id: CURRENT_USER_ID,
        weight_kg: 75.0,
        height_cm: 180.0,
        age: 30,
        gender: "male",
        goal: "maintenance",
        dietary_restrictions: []
      },
      wearable_data: {
        sleep_hours: 7.5,
        hrv: 45,
        active_cals: 600
      }
    };
    
    // Add loading indicator
    const grid = document.getElementById('mealsGrid');
    if (grid) grid.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Generating your personalized AI meal plan... <br><br> <div class="loading-spinner"></div> </div>';

    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.recommended_meals && data.recommended_meals.length > 0) {
        const types = ["breakfast", "lunch", "dinner", "snack"];
        const mapped = data.recommended_meals.map((m: any, i: number) => ({
          id: i + 100,
          name: m.name || m.meal_id,
          type: types[i % types.length],
          emoji: "🍲",
          calories: m.macros?.calories || 400,
          protein: m.macros?.protein || 30,
          carbs: m.macros?.carbs || 30,
          fat: m.macros?.fat || 15,
          prepTime: Math.floor(Math.random() * 20) + 10,
          difficulty: "Medium",
          budget: "mid",
          diet: ["balanced"],
          aiScore: Math.round((m.match_score || 0.95) * 100),
          description: "AI-generated recommendation to match your daily macro needs.",
          aiExplanation: data.rationale || "Balanced to support your maintenance goal and HRV scores.",
          image: null,
          recipeIngredients: ["See backend database for full recipe"],
          recipeInstructions: "Customized recipe available soon."
        }));
        
        MEALS_DATA = mapped;
        filterMeals(); // Use the existing filter function to properly re-render active filters
      } else {
        if (grid) renderMeals(MEALS_DATA); // Revert on empty
      }
    } else {
      if (grid) renderMeals(MEALS_DATA); // Revert on failure
    }
  } catch (err) {
    console.error("Failed to fetch recommendations:", err);
    const grid = document.getElementById('mealsGrid');
    if (grid) renderMeals(MEALS_DATA);
  }
}

function filterMeals() {
  const dietEl = $('#filterDiet') as HTMLSelectElement;
  const typeEl = $('#filterMealType') as HTMLSelectElement;
  const prepEl = $('#filterPrepTime') as HTMLSelectElement;
  const budgetEl = $('#filterBudget') as HTMLSelectElement;

  const diet = dietEl ? dietEl.value : 'all';
  const type = typeEl ? typeEl.value : 'all';
  const prep = prepEl ? prepEl.value : 'all';
  const budget = budgetEl ? budgetEl.value : 'all';

  let filtered = [...MEALS_DATA];
  if (diet !== 'all') filtered = filtered.filter(m => m.diet.includes(diet));
  if (type !== 'all') filtered = filtered.filter(m => m.type === type);
  if (prep !== 'all') filtered = filtered.filter(m => m.prepTime <= parseInt(prep));
  if (budget !== 'all') filtered = filtered.filter(m => m.budget === budget);
  renderMeals(filtered);
}

function renderMeals(meals: any[]) {
  const grid = $('#mealsGrid');
  if (!grid) return;
  grid.innerHTML = meals.map(m => `
    <div class="meal-card animate-in" data-id="${m.id}" onclick="window.openMealModal(${m.id})">
      ${m.image ? `<img src="${m.image}" alt="${m.name}" class="meal-image" onerror="this.outerHTML='<div class=\\'meal-image-placeholder ${m.type}\\'>${'<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>'}</div>'">` : `<div class="meal-image-placeholder ${m.type}"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg></div>`}
      <div class="meal-card-body">
        <div class="meal-card-top">
          <span class="meal-type-badge ${m.type}">${m.type}</span>
          <span class="ai-score"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${m.aiScore}% match</span>
        </div>
        <h4 class="meal-card-title">${m.name}</h4>
        <div class="meal-macros">
          <div class="meal-macro"><strong>${m.calories}</strong>kcal</div>
          <div class="meal-macro"><strong>${m.protein}g</strong>protein</div>
          <div class="meal-macro"><strong>${m.carbs}g</strong>carbs</div>
          <div class="meal-macro"><strong>${m.fat}g</strong>fat</div>
        </div>
        <div class="meal-meta">
          <span>⏱ ${m.prepTime} min</span>
          <span>📊 ${m.difficulty}</span>
          <span>${m.budget === 'low' ? '$' : m.budget === 'mid' ? '$$' : '$$$'}</span>
        </div>
        <div class="meal-feedback">
          <button class="feedback-btn" onclick="event.stopPropagation();this.classList.toggle('liked')">👍 Helpful</button>
          <button class="feedback-btn" onclick="event.stopPropagation()">👎</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.openMealModal = function (id) {
  const meal = MEALS_DATA.find(m => m.id === id);
  if (!meal) return;
  const modal = $('#mealModal');
  const body = $('#modalBody');
  if (!modal || !body) return;

  const ingredientsHtml = meal.recipeIngredients && meal.recipeIngredients.length > 0
    ? `
      <div class="modal-section recipe-ingredients">
        <h4>🛒 Ingredients</h4>
        <ol class="ingredients-list" style="list-style-type:decimal;padding-left:20px;">
          ${meal.recipeIngredients.map((ing: string) => `<li style="list-style-type:decimal;margin-bottom:4px;">${ing}</li>`).join('')}
        </ol>
      </div>
      `
    : '';

  const instructionsHtml = meal.recipeInstructions
    ? `
      <div class="modal-section recipe-instructions">
        <h4>👩‍🍳 Instructions</h4>
        <div class="instructions-content">
          ${meal.recipeInstructions.split('\n').map(step => `<p>${step}</p>`).join('')}
        </div>
      </div>
      `
    : '';

  body.innerHTML = `
    <p class="modal-meal-type">${meal.type}</p>
    <h2>${meal.name}</h2>
    <div class="modal-section">
      <p>${meal.description}</p>
    </div>
    
    ${ingredientsHtml}
    ${instructionsHtml}

    <div class="modal-section">
      <h4>Nutrition Breakdown</h4>
      <div class="modal-macros-grid">
        <div class="modal-macro-item cal"><span class="mm-val">${meal.calories}</span><span class="mm-label">Calories</span></div>
        <div class="modal-macro-item prot"><span class="mm-val">${meal.protein}g</span><span class="mm-label">Protein</span></div>
        <div class="modal-macro-item carb"><span class="mm-val">${meal.carbs}g</span><span class="mm-label">Carbs</span></div>
        <div class="modal-macro-item fatt"><span class="mm-val">${meal.fat}g</span><span class="mm-label">Fat</span></div>
      </div>
    </div>
    <div class="ai-explanation">
      <h4>🤖 Why AI Recommended This</h4>
      <p>${meal.aiExplanation}</p>
    </div>
    <div class="modal-section" style="margin-top:16px">
      <h4>Rate This Recommendation</h4>
      <div class="modal-star-rating">
        ${[1, 2, 3, 4, 5].map(i => `<span class="modal-star" data-star="${i}" onclick="window.rateMeal(this,${i})">★</span>`).join('')}
      </div>
    </div>
  `;
  modal.classList.add('active');
};

window.rateMeal = function (el: HTMLElement, rating: number) {
  const container = el.closest('.modal-star-rating');
  if (!container) return;
  container.querySelectorAll('.modal-star').forEach((s, i) => {
    s.classList.toggle('active', i < rating);
  });
};

// ===== SEARCH =====
const SEARCH_ACTIONS = [
  { id: 'arena', term: 'arena challenge', title: 'Navigate to Metabolic Arena', desc: "View your tier & leaderboard ranking", type: 'action-goto', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>', action: () => { window.location.hash = 'challenge'; } },
  { id: 'water', term: 'water hydration drink', title: 'Log 250ml Water', desc: "Add one glass of water to today's intake", type: 'action-log', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>', action: () => { if ((window as any).addWater) (window as any).addWater(250); window.location.hash = 'dashboard'; } },
  { id: 'scan', term: 'scan camera photo food', title: 'Scan Food with Camera', desc: "Get AI macro estimates from a photo", type: 'action-scan', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>', action: () => { window.location.hash = 'scan'; } },
  { id: 'pantry', term: 'pantry kitchen ingredients', title: 'View Pantry Expiry', desc: "Check ingredients expiring soon", type: 'action-goto', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8L18.74 5.74A9.75 9.75 0 0012 3a9.75 9.75 0 00-6.74 2.74L3 8"></path><rect x="3" y="8" width="18" height="13" rx="2"></rect></svg>', action: () => { window.location.hash = 'pantry'; } },
  { id: 'macro', term: 'macro distribution nutrition calories protein carbs fat', title: 'View Macro Distribution', desc: "Open today's dashboard charts", type: 'action-goto', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>', action: () => { window.location.hash = 'dashboard'; } },
  { id: 'bluetooth', term: 'bluetooth device pair connect wearable', title: 'Pair Bluetooth Device', desc: "Connect a new health wearable via Bluetooth", type: 'action-scan', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"></path></svg>', action: () => { pairBluetoothDevice(); } },
  { id: 'profile', term: 'profile settings account', title: 'Profile & Settings', desc: "Customize your health journey", type: 'action-goto', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 00-16 0"></path></svg>', action: () => { window.location.hash = 'profile'; } },
  { id: 'community', term: 'community friends guild social', title: 'Community & Guilds', desc: "Connect with friends and join challenges", type: 'action-goto', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>', action: () => { window.location.hash = 'community'; } }
];

let searchHighlightIndex = -1;

function initSearch() {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchDropdown = document.getElementById('searchDropdown') as HTMLDivElement;

  if (!searchInput || !searchDropdown) return;

  // Auto-close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !searchDropdown.contains(e.target as Node)) {
      searchDropdown.classList.remove('active');
      searchHighlightIndex = -1;
    }
  });

  searchInput.addEventListener('input', () => {
    searchHighlightIndex = -1;
    renderSearchResults(searchInput, searchDropdown);
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = searchDropdown.querySelectorAll('.search-suggestion-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      searchHighlightIndex = Math.min(searchHighlightIndex + 1, items.length - 1);
      updateSearchHighlight(searchDropdown);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      searchHighlightIndex = Math.max(searchHighlightIndex - 1, 0);
      updateSearchHighlight(searchDropdown);
    } else if (e.key === 'Enter' && searchHighlightIndex >= 0) {
      e.preventDefault();
      (items[searchHighlightIndex] as HTMLElement).click();
    } else if (e.key === 'Escape') {
      searchDropdown.classList.remove('active');
      searchHighlightIndex = -1;
    }
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length > 0) {
      renderSearchResults(searchInput, searchDropdown);
    }
  });
}

function updateSearchHighlight(dropdown: HTMLDivElement) {
  const items = dropdown.querySelectorAll('.search-suggestion-item');
  items.forEach((item, i) => {
    (item as HTMLElement).classList.toggle('highlighted', i === searchHighlightIndex);
  });
  if (searchHighlightIndex >= 0 && items[searchHighlightIndex]) {
    (items[searchHighlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
  }
}

function renderSearchResults(searchInput: HTMLInputElement, searchDropdown: HTMLDivElement) {
  const term = searchInput.value.toLowerCase().trim();

  // Filter standard Meal/Pantry/Quests content for backwards compatibility
  document.querySelectorAll('.meal-card').forEach(card => {
    const text = card.textContent?.toLowerCase() || '';
    (card as HTMLElement).style.display = text.includes(term) ? '' : 'none';
  });
  document.querySelectorAll('.pantry-item').forEach(item => {
    const text = item.textContent?.toLowerCase() || '';
    (item as HTMLElement).style.display = text.includes(term) ? '' : 'none';
  });
  document.querySelectorAll('.quest-item').forEach(quest => {
    const text = quest.textContent?.toLowerCase() || '';
    (quest as HTMLElement).style.display = text.includes(term) ? '' : 'none';
  });

  if (term.length === 0) {
    searchDropdown.classList.remove('active');
    return;
  }

  searchDropdown.classList.add('active');

  // 1. Quick Actions
  const actionMatches = SEARCH_ACTIONS.filter(a =>
    a.term.includes(term) || a.title.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term)
  ).slice(0, 4);

  // 2. Food DB search
  const foodMatches = (typeof FOOD_DB !== 'undefined' ? FOOD_DB : []).filter((f: any) =>
    f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)
  ).slice(0, 5);

  // 3. Meals search
  const mealMatches = MEALS_DATA.filter(m =>
    m.name.toLowerCase().includes(term) || m.type.toLowerCase().includes(term)
  ).slice(0, 4);

  let html = '';

  if (actionMatches.length > 0) {
    html += `<div class="search-category-header">⚡ Quick Actions</div>`;
    html += actionMatches.map(match => `
      <div class="search-suggestion-item ${match.type}" data-action-id="${match.id}" data-search-type="action">
        <div class="s-icon">${match.icon}</div>
        <div class="s-content">
          <span class="s-title">${highlightMatch(match.title, term)}</span>
          <span class="s-desc">${match.desc}</span>
        </div>
      </div>
    `).join('');
  }

  if (foodMatches.length > 0) {
    html += `<div class="search-category-header">🔬 Food Database</div>`;
    html += foodMatches.map((food: any) => `
      <div class="search-suggestion-item action-scan" data-food-name="${food.name}" data-search-type="food">
        <div class="s-icon"><span style="font-size:1.2rem">${food.emoji}</span></div>
        <div class="s-content">
          <span class="s-title">${highlightMatch(food.name, term)}</span>
          <span class="s-desc">${food.calories} kcal · ${food.protein}g P · ${food.carbs}g C · ${food.fat}g F — ${food.serving}</span>
        </div>
      </div>
    `).join('');
  }

  if (mealMatches.length > 0) {
    html += `<div class="search-category-header">🍽️ Meal Plans</div>`;
    html += mealMatches.map(meal => `
      <div class="search-suggestion-item action-goto" data-meal-id="${meal.id}" data-search-type="meal">
        <div class="s-icon"><span style="font-size:1.2rem">${meal.emoji}</span></div>
        <div class="s-content">
          <span class="s-title">${highlightMatch(meal.name, term)}</span>
          <span class="s-desc">${meal.type} · ${meal.calories} kcal · ${meal.prepTime} min · ${meal.difficulty}</span>
        </div>
      </div>
    `).join('');
  }

  if (!html) {
    html = `
      <div style="padding: 16px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:4px;opacity:0.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <br>No results for "${sanitizeInput(term)}"
      </div>
    `;
  }

  searchDropdown.innerHTML = html;

  // Bind clicks
  searchDropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const searchType = item.getAttribute('data-search-type');
      if (searchType === 'action') {
        const actionId = item.getAttribute('data-action-id');
        const matched = SEARCH_ACTIONS.find(a => a.id === actionId);
        if (matched) matched.action();
      } else if (searchType === 'food') {
        // Navigate to scan page and show a toast about the food
        window.location.hash = 'scan';
        const foodName = item.getAttribute('data-food-name');
        const toast = document.getElementById('xpToast');
        if (toast && foodName) {
          toast.innerHTML = `🔬 Search: ${foodName} — scan or upload a photo to analyze!`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        }
      } else if (searchType === 'meal') {
        const mealId = parseInt(item.getAttribute('data-meal-id') || '0');
        if (mealId && (window as any).openMealModal) (window as any).openMealModal(mealId);
      }
      searchInput.value = '';
      searchDropdown.classList.remove('active');
      searchHighlightIndex = -1;
    });
  });
}

function highlightMatch(text: string, term: string): string {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return text.substring(0, idx) + '<mark>' + text.substring(idx, idx + term.length) + '</mark>' + text.substring(idx + term.length);
}

// ===== PANTRY =====
let pantryItems = [...PANTRY_DATA];
function initPantry() {
  renderPantry();
  renderExpiry();
  renderGrocery();
  $$('.pantry-tab').forEach(t => {
    const tab = t as HTMLElement;
    tab.addEventListener('click', () => {
      $$('.pantry-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      const filtered = cat === 'all' ? pantryItems : pantryItems.filter(i => i.cat === cat);
      renderPantryItems(filtered);
    });
  });

  const addBtn = $('#addPantryBtn');
  const addModal = $('#addItemModal');
  const addForm = $('#addItemForm') as HTMLFormElement;

  if (addBtn && addModal) {
    addBtn.addEventListener('click', () => addModal.classList.add('active'));
  }

  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameEl = $('#itemName') as HTMLInputElement;
      const qtyEl = $('#itemQty') as HTMLInputElement;
      const catEl = $('#itemCat') as HTMLSelectElement;
      const expEl = $('#itemExpiry') as HTMLInputElement;
      const item = {
        name: nameEl?.value || 'Unknown',
        qty: qtyEl?.value || '1',
        cat: catEl?.value || 'others',
        emoji: '📦',
        expiry: expEl?.value || '2026-04-01'
      };
      pantryItems.unshift(item);
      renderPantry();
      renderExpiry();
      addModal?.classList.remove('active');
      addForm.reset();
    });
  }
}

function renderPantry() { renderPantryItems(pantryItems); }
function renderPantryItems(items: any[]) {
  const pantryList = $('#pantryList');
  if (!pantryList) return;
  pantryList.innerHTML = items.map((item, i) => `
    <div class="pantry-item animate-in">
      <span class="pantry-emoji" style="display:flex;align-items:center;justify-content:center;opacity:0.8;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></span>
      <div class="pantry-info"><span class="pantry-name">${item.name}</span><span class="pantry-qty">${item.qty}</span></div>
      <span class="pantry-cat">${item.cat}</span>
      <button class="pantry-remove" onclick="window.removePantryItem(${i})">×</button>
    </div>
  `).join('');
}

window.removePantryItem = function (index) {
  pantryItems.splice(index, 1);
  renderPantry();
  renderExpiry();
};

function renderExpiry() {
  const soon = pantryItems.filter(i => {
    const exp = new Date(i.expiry);
    const diff = (exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });
  const expiryList = $('#expiryList');
  if (!expiryList) return;
  expiryList.innerHTML = soon.length ? soon.map(i => `
    <div class="expiry-item">
      <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
      <span>${i.name}</span>
      <span class="expiry-date">${new Date(i.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
    </div>
  `).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:8px;">No items expiring soon 🎉</p>';
}

function renderGrocery() {
  const groceryList = $('#groceryList');
  if (!groceryList) return;
  groceryList.innerHTML = GROCERY_DATA.map((item) => `
    <div class="grocery-item">
      <div class="grocery-check ${item.checked ? 'checked' : ''}" onclick="this.classList.toggle('checked')">✓</div>
      <span class="grocery-item-name" style="${item.checked ? 'text-decoration:line-through;opacity:0.5' : ''}">${item.name}</span>
      <span class="grocery-item-price">${formatPrice(item.basePrice)}</span>
    </div>
  `).join('');
}

// ===== PROFILE =====
function initProfile() {
  const actLabels = ['Sedentary', 'Light', 'Moderate', 'Very Active', 'Athlete'];
  const w = $('#targetWeight') as HTMLInputElement, wv = $('#targetWeightVal');
  const a = $('#activityLevel') as HTMLSelectElement, av = $('#activityLevelVal');
  const c = $('#calorieTarget') as HTMLInputElement, cv = $('#calorieTargetVal');
  const p = $('#proteinPct') as HTMLInputElement, pv = $('#proteinPctVal');
  const cb = $('#carbsPct') as HTMLInputElement, cbv = $('#carbsPctVal');
  const f = $('#fatPct') as HTMLInputElement, fv = $('#fatPctVal');
  if (w && wv) w.addEventListener('input', () => wv.textContent = w.value + ' kg');
  if (a && av) a.addEventListener('input', () => av.textContent = actLabels[parseInt(a.value) - 1]);
  if (c && cv) c.addEventListener('input', () => cv.textContent = parseInt(c.value).toLocaleString() + ' kcal');
  if (p && pv) p.addEventListener('input', () => pv.textContent = p.value + '%');
  if (cb && cbv) cb.addEventListener('input', () => cbv.textContent = cb.value + '%');
  if (f && fv) f.addEventListener('input', () => fv.textContent = f.value + '%');
  $('#exportDataBtn')?.addEventListener('click', () => {
    alert('Health data export initiated! Your data will be downloaded shortly.');
  });
}

// ===== MODALS =====
function initModals() {
  $('#modalClose')?.addEventListener('click', () => $('#mealModal')?.classList.remove('active'));
  $('#addItemClose')?.addEventListener('click', () => $('#addItemModal')?.classList.remove('active'));

  // Devices Modal
  const headerDeviceBtn = $('#headerDeviceBtn');
  const devicesModalOverlay = $('#devicesModalOverlay');
  const devicesCloseBtn = $('#devicesCloseBtn');

  headerDeviceBtn?.addEventListener('click', () => devicesModalOverlay?.classList.add('active'));
  devicesCloseBtn?.addEventListener('click', () => devicesModalOverlay?.classList.remove('active'));

  ['mealModal', 'addItemModal', 'devicesModalOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', e => {
        if (e.target === e.currentTarget) (e.currentTarget as HTMLElement).classList.remove('active');
      });
    }
  });
}

// ===== DEVICES =====
function initDevices() {
  const list = document.getElementById('modalDeviceList');
  if (list) {
    list.innerHTML = `
      <div class="device-item active">
        <div class="device-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg></div>
        <div class="device-info">
          <span class="device-name">Apple Watch Series 9</span>
          <span class="device-status">Synced 2min ago</span>
        </div>
      </div>
      <div class="device-item active">
        <div class="device-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
        <div class="device-info">
          <span class="device-name">MyFitnessPal</span>
          <span class="device-status">Synced 1hr ago</span>
        </div>
      </div>
    `;
  }
}

// ===== ANIMATIONS =====
function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
  }, { threshold: 0.1 });
  $$('.metric-card, .chart-card, .insight-card').forEach(el => observer.observe(el));
}

function triggerAnimations(page: HTMLElement) {
  page.querySelectorAll('.animate-in').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.animation = 'none';
    htmlEl.offsetHeight;
    htmlEl.style.animation = '';
  });
}

function updateChartsTheme() {
  const colors = getChartColors();
  [window.weeklyChart, window.metabolicTrendChart, window.bodyCompChart, window.sleepNutritionChart].forEach((chart: any) => {
    if (!chart) return;
    Object.values(chart.options.scales || {}).forEach((scale: any) => {
      if (scale.grid) scale.grid.color = colors.grid;
      if (scale.ticks) scale.ticks.color = colors.text;
      if (scale.title) scale.title.color = colors.text;
    });
    if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = colors.text;
    chart.update();
  });
}

// ===== WATER TRACKER =====
let waterMl = 0;
const WATER_GOAL = 2000;
const waterLog: number[] = [];

function initWater() {
  updateWaterUI();
}

window.addWater = function (ml: number) {
  waterMl = Math.min(waterMl + ml, 3000);
  waterLog.push(ml);
  updateWaterUI();
};

window.resetWater = function () {
  waterMl = 0;
  waterLog.length = 0;
  updateWaterUI();
};

function updateWaterUI() {
  const fill = document.getElementById('waterFill');
  const current = document.getElementById('waterCurrent');
  const badge = document.getElementById('waterBadge');
  const log = document.getElementById('waterLog');
  if (!fill || !current || !badge || !log) return;

  const pct = Math.min((waterMl / WATER_GOAL) * 100, 100);
  fill.style.height = pct + '%';
  current.textContent = (waterMl / 1000).toFixed(1) + ' L';
  const glasses = Math.floor(waterMl / 250);
  badge.textContent = `${glasses} / 8 glasses`;

  log.innerHTML = waterLog.map(ml =>
    `<span class="water-drop" title="${ml}ml"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg></span>`
  ).join('');
}

// ===== CHALLENGE =====
function initChallenge() {
  document.getElementById('generateChallengeBtn')?.addEventListener('click', generateChallenge);
  document.getElementById('searchLocationBtn')?.addEventListener('click', searchNearbyLocations);
  
  const arenaPage = document.getElementById('page-challenge');
  if (arenaPage) {
    renderPartyDashboard();
    syncMetricsWithBackend();
  }
}

function generateChallenge() {
  const cwEl = document.getElementById('challengeCurrentWeight') as HTMLInputElement;
  const twEl = document.getElementById('challengeTargetWeight') as HTMLInputElement;
  const daysEl = document.getElementById('challengeDays') as HTMLInputElement;
  if (!cwEl || !twEl || !daysEl) return;

  const cw = parseFloat(cwEl.value);
  const tw = parseFloat(twEl.value);
  const days = parseInt(daysEl.value);

  // Update stats
  const results = document.getElementById('challengeResults');
  if (results) results.style.display = 'block';

  renderStorylineRoadmap(days, cw, tw);
  results?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Add the active roadmap info to the HUD
  const hudDay = document.getElementById('hudRoadmapDay');
  if (hudDay) hudDay.textContent = `Day 1 / ${days}`;
}

let currentRoadmapStage = 0;
let roadmapNodesData: any[] = [];

function renderStorylineRoadmap(totalDays: number, cw: number, tw: number) {
  const container = document.getElementById('gameRoadmapContainer');
  if (!container) return;

  const weightDiff = cw - tw;
  const isLoss = weightDiff > 0;
  const interval = totalDays <= 30 ? 5 : 10;
  const numStages = Math.min(Math.ceil(totalDays / interval), 8);

  const terrains = [
    { zone: 'forest', icon: '🌿', color: '#10b981', glow: '#34d399', particles: '🍃🌱🦋', terrain: 'Enchanted Forest' },
    { zone: 'desert', icon: '🏜️', color: '#f59e0b', glow: '#fbbf24', particles: '✨🌵💨', terrain: 'Scorching Sands' },
    { zone: 'volcano', icon: '🌋', color: '#ef4444', glow: '#f87171', particles: '🔥💥🌶️', terrain: 'Molten Caldera' },
    { zone: 'frozen', icon: '🏔️', color: '#06b6d4', glow: '#22d3ee', particles: '❄️🌨️💎', terrain: 'Frozen Summit' },
    { zone: 'sky', icon: '☁️', color: '#8b5cf6', glow: '#a78bfa', particles: '⚡🌩️🦅', terrain: 'Sky Citadel' },
    { zone: 'throne', icon: '👑', color: '#f59e0b', glow: '#fde68a', particles: '✨👑🏆', terrain: 'Throne of Champions' },
    { zone: 'crystal', icon: '💎', color: '#ec4899', glow: '#f472b6', particles: '💎🔮✨', terrain: 'Crystal Caverns' },
    { zone: 'cosmos', icon: '🌌', color: '#6366f1', glow: '#818cf8', particles: '🌟⭐🚀', terrain: 'Cosmic Realm' },
  ];

  const lossQuests = [
    { title: 'The Awakening', desc: 'Begin your transformation. Establish a calorie deficit, master 3 foundational exercises, and track every meal with precision.', xp: 500, subQuests: ['Track all meals for 5 days', '3 pushups daily', 'Walk 5,000 steps'] },
    { title: 'Trial of Endurance', desc: 'Push through the desert heat. Add cardio intervals, increase step count by 20%, and conquer your first mini-boss: sugar cravings.', xp: 800, subQuests: ['10 pushups daily', '20 squats daily', 'No added sugar for 3 days'] },
    { title: 'Forging in Fire', desc: 'Enter the volcano\'s forge. Heavy resistance training begins. Your metabolism is transforming — push through the plateau.', xp: 1200, subQuests: ['30 pushups daily', 'Pull-ups introduced', 'Strict macro tracking'] },
    { title: 'The Ice Wall', desc: 'Scale the frozen peak. HIIT sessions, cold exposure, and nutrient timing become your weapons against stubborn fat.', xp: 1500, subQuests: ['4 HIIT sessions/week', 'Meal timing within 30min windows', '10,000 steps daily'] },
    { title: 'Storm Breaker', desc: 'Lightning-fast reflexes and peak conditioning. Every workout is a battle, every meal a strategic advantage.', xp: 2000, subQuests: ['Full-body workouts 5x/week', 'Sub-1800 kcal precision', 'Sleep 7+ hours nightly'] },
    { title: 'FINAL BOSS: The Crucible', desc: 'The ultimate test of will. Achieve your target of ' + tw + 'kg through perfect discipline, elite conditioning, and mental fortitude.', xp: 5000, subQuests: ['Achieve target weight', 'Body fat < 15%', 'Run 5K under 25min'] },
    { title: 'Crystal Mastery', desc: 'Discover hidden power within. Advanced body recomposition techniques activate your peak metabolic potential.', xp: 3000, subQuests: ['Master macro cycling', 'Complete 7-day streak', 'Unlock Crystal Armor'] },
    { title: 'Cosmic Ascension', desc: 'Transcend mortal limits. Your transformation is complete — maintain and inspire others.', xp: 10000, subQuests: ['Maintain for 2 weeks', 'Help 3 community members', 'Earn Legend status'] },
  ];

  const gainQuests = [
    { title: 'The Awakening', desc: 'Begin the path of strength. Focus on surplus calories, perfecting form, and building the foundation.', xp: 500, subQuests: ['Track calorie surplus', '3 compound lifts daily', 'Protein target: 1.6g/kg'] },
    { title: 'Hypertrophy Dawn', desc: 'The sands test your resolve. Volume training begins — muscles must grow through progressive overload.', xp: 800, subQuests: ['Increase all lifts 5%', '20 sets/muscle group/week', 'Mass gainer protocol'] },
    { title: 'The Iron Path', desc: 'Forge your body in molten iron. Heavy compound movements dominate. Barbell is your best friend.', xp: 1200, subQuests: ['Squat/Bench/Dead PR attempts', '4,000+ kcal daily', 'Creatine loading phase'] },
    { title: 'Titan\'s Resolve', desc: 'Push past frozen plateaus. Strategic deloads, advanced periodization, and nutrient cycling unlock new gains.', xp: 1500, subQuests: ['Deload week mastery', 'Carb cycling protocol', 'Sleep optimization'] },
    { title: 'Thunder God', desc: 'Channel raw power. Strength peaks, muscle density increases, your presence commands the gym.', xp: 2000, subQuests: ['All lifts +20% from start', 'Visual muscle definition', 'Power clean mastery'] },
    { title: 'FINAL BOSS: Apotheosis', desc: 'Transform into legend. Achieve ' + tw + 'kg of lean, powerful mass. The throne awaits.', xp: 5000, subQuests: ['Achieve target weight', 'All major lifts at advanced level', 'Body composition scan'] },
    { title: 'Crystal Mastery', desc: 'Refine your physique to perfection. Advanced hypertrophy techniques sculpt your ultimate form.', xp: 3000, subQuests: ['Peak week protocol', 'Symmetry assessment', 'Unlock Crystal Shield'] },
    { title: 'Cosmic Ascension', desc: 'Become immortal legend. Your gains inspire generations — maintain and transcend.', xp: 10000, subQuests: ['Maintain gains 2 weeks', 'Mentor 3 guild members', 'Earn Titan Crown'] },
  ];

  const quests = isLoss ? lossQuests : gainQuests;

  roadmapNodesData = [];
  for (let i = 0; i < numStages; i++) {
    const dayMark = i === numStages - 1 ? totalDays : (i + 1) * interval;
    const isBoss = i === numStages - 1;
    const quest = quests[i % quests.length];
    const terrain = terrains[i % terrains.length];

    roadmapNodesData.push({
      id: i,
      day: dayMark,
      isBoss,
      title: isBoss ? '⚔️ BOSS: ' + quest.title : quest.title,
      desc: quest.desc,
      xp: quest.xp,
      subQuests: quest.subQuests,
      ...terrain,
    });
  }

  currentRoadmapStage = 0;
  updateRoadmapUI();
}

window.completeCurrentRoadmapStage = function () {
  if (currentRoadmapStage < roadmapNodesData.length - 1) {
    currentRoadmapStage++;
    updateRoadmapUI();

    // Confetti burst
    spawnConfetti();

    const node = roadmapNodesData[currentRoadmapStage - 1];
    const toast = document.getElementById('xpToast');
    if (toast) {
      toast.innerHTML = `<span class="xp-burst">+${node.xp} XP</span> ${node.terrain} Conquered! ${node.icon}`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // Update points
    userProfile.points += node.xp;
    updateProfileHUD();
  }
};

function spawnConfetti() {
  const container = document.getElementById('gameRoadmapContainer');
  if (!container) return;
  const confettiEl = document.createElement('div');
  confettiEl.className = 'sc-confetti-burst';
  const colors = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
  let confettiHTML = '';
  for (let i = 0; i < 40; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = 30 + Math.random() * 40;
    const delay = Math.random() * 0.5;
    const angle = -30 + Math.random() * 60;
    const size = 4 + Math.random() * 8;
    confettiHTML += `<div class="sc-confetti-piece" style="left:${left}%;background:${color};animation-delay:${delay}s;--angle:${angle}deg;width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'}"></div>`;
  }
  confettiEl.innerHTML = confettiHTML;
  container.appendChild(confettiEl);
  setTimeout(() => confettiEl.remove(), 3000);
}

function updateRoadmapUI() {
  const container = document.getElementById('gameRoadmapContainer');
  if (!container) return;

  const displayedNodes = roadmapNodesData.slice(0, currentRoadmapStage + 2).slice(0, roadmapNodesData.length);

  // SVG terrain element generators for manga style
  const svgTree = (x: number, y: number, h: number, color: string) => `<g transform="translate(${x},${y})"><rect x="-3" y="${-h * 0.3}" width="6" height="${h * 0.4}" fill="#8B6914" rx="2"/><ellipse cx="0" cy="${-h * 0.5}" rx="${h * 0.35}" ry="${h * 0.4}" fill="${color}" opacity="0.9"/><ellipse cx="-${h * 0.15}" cy="${-h * 0.55}" rx="${h * 0.15}" ry="${h * 0.2}" fill="${color}" opacity="0.6"/></g>`;
  const svgPine = (x: number, y: number, h: number, color: string) => `<g transform="translate(${x},${y})"><rect x="-2" y="${-h * 0.2}" width="4" height="${h * 0.3}" fill="#6B4E15" rx="1"/><polygon points="0,${-h} -${h * 0.3},${-h * 0.2} ${h * 0.3},${-h * 0.2}" fill="${color}" opacity="0.9"/><polygon points="0,${-h * 0.85} -${h * 0.25},${-h * 0.3} ${h * 0.25},${-h * 0.3}" fill="${color}" opacity="0.75"/></g>`;
  const svgMountain = (x: number, y: number, w: number, h: number, bodyColor: string, snowColor: string) => `<g transform="translate(${x},${y})"><polygon points="0,${-h} ${-w / 2},0 ${w / 2},0" fill="${bodyColor}" opacity="0.85"/><polygon points="0,${-h} ${-w * 0.12},${-h * 0.65} ${w * 0.12},${-h * 0.65}" fill="${snowColor}" opacity="0.9"/></g>`;
  const svgGlacier = (x: number, y: number, w: number) => `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-8" width="${w}" height="16" fill="#b8ecf0" rx="6" opacity="0.7"/><rect x="${-w / 2 + 3}" y="-4" width="${w * 0.3}" height="6" fill="#e0f7fa" rx="3" opacity="0.8"/><circle cx="${w * 0.2}" cy="-2" r="3" fill="#fff" opacity="0.6"/><text x="0" y="3" font-size="8" text-anchor="middle" opacity="0.5">❄</text></g>`;
  const svgRiver = (x: number, y: number, w: number) => `<g transform="translate(${x},${y})"><path d="M${-w / 2},0 Q${-w / 4},-8 0,0 Q${w / 4},8 ${w / 2},0" fill="none" stroke="#38bdf8" stroke-width="6" opacity="0.6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite"/></path><path d="M${-w / 2},0 Q${-w / 4},-8 0,0 Q${w / 4},8 ${w / 2},0" fill="none" stroke="#7dd3fc" stroke-width="3" opacity="0.4" stroke-dasharray="4,6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite"/></path></g>`;
  const svgVolcano = (x: number, y: number) => `<g transform="translate(${x},${y})"><polygon points="0,-40 -25,0 25,0" fill="#7c2d12" opacity="0.85"/><polygon points="0,-40 -8,-28 8,-28" fill="#f97316" opacity="0.8"/><circle cx="0" cy="-42" r="4" fill="#fbbf24" opacity="0.7"><animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite"/></circle><circle cx="-3" cy="-44" r="2" fill="#ef4444" opacity="0.6"><animate attributeName="cy" values="-44;-52;-44" dur="1.5s" repeatCount="indefinite"/></circle></g>`;
  const svgCloud = (x: number, y: number, s: number) => `<g transform="translate(${x},${y})" opacity="0.3"><ellipse cx="0" cy="0" rx="${s}" ry="${s * 0.5}" fill="white"/><ellipse cx="${s * 0.6}" cy="${-s * 0.15}" rx="${s * 0.7}" ry="${s * 0.4}" fill="white"/><ellipse cx="${-s * 0.5}" cy="${-s * 0.1}" rx="${s * 0.6}" ry="${s * 0.35}" fill="white"/></g>`;

  // Terrain sets per zone
  const terrainSets: Record<string, (w: number) => string> = {
    'forest': (w) => svgPine(w * 0.08, 0, 45, '#059669') + svgTree(w * 0.25, 0, 35, '#10b981') + svgPine(w * 0.85, 0, 40, '#047857') + svgTree(w * 0.7, 0, 30, '#34d399') + svgCloud(w * 0.5, -35, 18),
    'desert': (w) => svgMountain(w * 0.15, 0, 40, 30, '#d97706', '#fde68a') + svgMountain(w * 0.8, 0, 50, 35, '#b45309', '#fef3c7') + `<circle cx="${w * 0.5}" cy="-25" r="14" fill="#fbbf24" opacity="0.3"/><text x="${w * 0.45}" y="3" font-size="14" opacity="0.5">🌵</text>`,
    'volcano': (w) => svgVolcano(w * 0.2, 0) + svgVolcano(w * 0.78, 0) + `<text x="${w * 0.5}" y="-5" font-size="10" opacity="0.4">🔥</text>`,
    'frozen': (w) => svgMountain(w * 0.1, 0, 55, 50, '#64748b', '#e2e8f0') + svgGlacier(w * 0.5, 0, 40) + svgMountain(w * 0.88, 0, 45, 42, '#475569', '#f1f5f9') + svgCloud(w * 0.4, -40, 15),
    'sky': (w) => svgCloud(w * 0.15, -20, 22) + svgCloud(w * 0.55, -30, 18) + svgCloud(w * 0.85, -15, 20) + `<text x="${w * 0.3}" y="-35" font-size="12" opacity="0.3">⚡</text><text x="${w * 0.7}" y="-40" font-size="10" opacity="0.25">🦅</text>`,
    'throne': (w) => svgMountain(w * 0.15, 0, 50, 45, '#92400e', '#fbbf24') + svgMountain(w * 0.82, 0, 55, 48, '#78350f', '#f59e0b') + `<text x="${w * 0.5}" y="-30" font-size="18" opacity="0.5">👑</text>`,
    'crystal': (w) => `<text x="${w * 0.12}" y="-15" font-size="16" opacity="0.5">💎</text>` + svgMountain(w * 0.4, 0, 35, 30, '#9d174d', '#f472b6') + `<text x="${w * 0.75}" y="-10" font-size="14" opacity="0.45">🔮</text>` + svgMountain(w * 0.85, 0, 30, 25, '#831843', '#ec4899'),
    'cosmos': (w) => svgCloud(w * 0.2, -25, 16) + svgCloud(w * 0.7, -35, 20) + `<text x="${w * 0.35}" y="-40" font-size="12" opacity="0.4">🌟</text><text x="${w * 0.6}" y="-45" font-size="10" opacity="0.35">⭐</text><text x="${w * 0.85}" y="-30" font-size="14" opacity="0.3">🚀</text>`,
  };

  const pathW = 800;
  const stageH = 180;
  const totalH = displayedNodes.length * stageH + 60;

  let html = `
    <div class="manga-roadmap">
      <svg class="manga-roadmap-svg" viewBox="0 0 ${pathW} ${totalH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d4a574"/>
            <stop offset="100%" stop-color="#a0845c"/>
          </linearGradient>
          <filter id="mangaGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a1a2e"/>
            <stop offset="40%" stop-color="#16213e"/>
            <stop offset="100%" stop-color="#0f3460"/>
          </linearGradient>
        </defs>
        
        <!-- Background sky -->
        <rect x="0" y="0" width="${pathW}" height="${totalH}" fill="url(#skyGrad)" rx="16"/>
        
        <!-- Stars -->
        ${Array.from({ length: 20 }, () => `<circle cx="${Math.random() * pathW}" cy="${Math.random() * totalH * 0.5}" r="${0.5 + Math.random() * 1.5}" fill="white" opacity="${0.15 + Math.random() * 0.3}"><animate attributeName="opacity" values="${0.1 + Math.random() * 0.2};${0.4 + Math.random() * 0.3};${0.1 + Math.random() * 0.2}" dur="${2 + Math.random() * 3}s" repeatCount="indefinite"/></circle>`).join('')}
  `;

  // Draw winding path and terrain
  displayedNodes.forEach((node: any, i: number) => {
    const isCompleted = i < currentRoadmapStage;
    const isCurrent = i === currentRoadmapStage;
    const isLocked = i > currentRoadmapStage;
    const baseY = 50 + i * stageH;
    const nodeX = i % 2 === 0 ? pathW * 0.3 : pathW * 0.7;
    const nextX = i % 2 === 0 ? pathW * 0.7 : pathW * 0.3;

    // Zone-specific background gradient band
    html += `<rect x="0" y="${baseY - 10}" width="${pathW}" height="${stageH}" fill="${node.color}" opacity="0.04" rx="0"/>`;

    // Ground/grass strip
    html += `<rect x="0" y="${baseY + stageH * 0.65}" width="${pathW}" height="${stageH * 0.35 + 10}" fill="${node.color}" opacity="0.06"/>`;

    // River between certain zones
    if (node.zone === 'frozen' || node.zone === 'forest') {
      html += `<g transform="translate(0,${baseY + stageH * 0.7})">${svgRiver(pathW * 0.5, 0, pathW * 0.6)}</g>`;
    }

    // Terrain decorations
    const terrainFn = terrainSets[node.zone] || terrainSets['forest'];
    html += `<g transform="translate(0,${baseY + stageH * 0.7})">${terrainFn(pathW)}</g>`;

    // Winding path segment
    if (i < displayedNodes.length - 1) {
      const nextY = 50 + (i + 1) * stageH;
      const midY = (baseY + nextY + stageH) / 2;
      const pathColor = isCompleted ? node.color : 'rgba(255,255,255,0.15)';
      const pathWidth = isCompleted ? 8 : 6;

      html += `
        <path d="M ${nodeX},${baseY + stageH * 0.45} Q ${pathW * 0.5},${midY} ${nextX},${nextY + stageH * 0.45}" 
              fill="none" stroke="${pathColor}" stroke-width="${pathWidth}" stroke-linecap="round" opacity="${isLocked ? 0.2 : 0.8}"
              ${!isCompleted ? 'stroke-dasharray="12,8"' : ''}
              ${isCurrent ? 'filter="url(#mangaGlow)"' : ''}/>
      `;

      // Dotted path border
      if (isCompleted) {
        html += `<path d="M ${nodeX},${baseY + stageH * 0.45} Q ${pathW * 0.5},${midY} ${nextX},${nextY + stageH * 0.45}" 
                fill="none" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.15" stroke-dasharray="4,12"/>`;
      }

      // Treasure on completed paths
      if (isCompleted) {
        const midPx = pathW * 0.5;
        html += `<text x="${midPx}" y="${midY}" font-size="20" text-anchor="middle" dominant-baseline="middle" class="manga-treasure">🎁</text>`;
      }
    }

    // Stage orb with manga glow
    const orbR = node.isBoss ? 28 : 22;
    html += `
      <g transform="translate(${nodeX},${baseY + stageH * 0.45})" class="${isCurrent ? 'manga-orb-active' : ''}">
        <!-- Glow ring -->
        ${isCurrent ? `<circle r="${orbR + 12}" fill="none" stroke="${node.glow}" stroke-width="2" opacity="0.4" stroke-dasharray="6,4"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/></circle>
        <circle r="${orbR + 6}" fill="${node.color}" opacity="0.1"><animate attributeName="r" values="${orbR + 4};${orbR + 10};${orbR + 4}" dur="2s" repeatCount="indefinite"/></circle>` : ''}
        ${isCompleted ? `<circle r="${orbR + 4}" fill="#10b981" opacity="0.15"/>` : ''}
        
        <!-- Orb body -->
        <circle r="${orbR}" fill="${isCompleted ? '#10b981' : node.color}" opacity="${isLocked ? 0.3 : 0.9}" ${node.isBoss ? 'filter="url(#mangaGlow)"' : ''}/>
        <circle r="${orbR - 4}" fill="white" opacity="0.08"/>
        <circle cx="${-orbR * 0.25}" cy="${-orbR * 0.25}" r="${orbR * 0.15}" fill="white" opacity="0.3"/>
        
        <!-- Icon -->
        <text y="6" font-size="${node.isBoss ? 22 : 18}" text-anchor="middle" dominant-baseline="middle">${isCompleted ? '✅' : (node.isBoss ? '💀' : node.icon)}</text>
      </g>
    `;

    // Walking character on current stage
    if (isCurrent) {
      html += `
        <g transform="translate(${nodeX + 35},${baseY + stageH * 0.3})" class="manga-character">
          <text y="0" font-size="32" text-anchor="middle" dominant-baseline="middle" class="manga-char-bounce">🧑‍⚔️</text>
          <ellipse cx="0" cy="20" rx="10" ry="3" fill="rgba(0,0,0,0.2)" class="manga-char-shadow"/>
        </g>
      `;
    }

    // Day label
    html += `
      <text x="${nodeX}" y="${baseY + stageH * 0.45 + orbR + 18}" font-size="11" fill="${node.color}" text-anchor="middle" font-weight="700" font-family="'Outfit',sans-serif" opacity="${isLocked ? 0.3 : 0.8}">Day ${node.day}</text>
    `;
  });

  html += `</svg>`;

  // Card overlays for each stage
  html += `<div class="manga-cards-overlay">`;
  displayedNodes.forEach((node: any, i: number) => {
    const isCompleted = i < currentRoadmapStage;
    const isCurrent = i === currentRoadmapStage;
    const isLocked = i > currentRoadmapStage;
    const alignClass = i % 2 === 0 ? 'manga-card-right' : 'manga-card-left';

    html += `
      <div class="manga-stage-card ${alignClass} ${isCompleted ? 'mc-done' : ''} ${isCurrent ? 'mc-active' : ''} ${isLocked ? 'mc-locked' : ''} ${node.isBoss ? 'mc-boss' : ''}"
           style="--mc-color:${node.color};--mc-glow:${node.glow};top:${(i * stageH / (displayedNodes.length * stageH + 60)) * 100}%">
        <div class="mc-header">
          <span class="mc-zone" style="color:${node.color}">${node.icon} ${node.terrain}</span>
          <span class="mc-xp">★ ${node.xp.toLocaleString()} XP</span>
        </div>
        <h4 class="mc-title">${node.title}</h4>
        <p class="mc-desc">${node.desc}</p>
        <div class="mc-quests">
          ${(node.subQuests || []).map((sq: string, si: number) => `
            <div class="mc-quest ${isCompleted ? 'mcq-done' : (isCurrent && si === 0 ? 'mcq-active' : '')}">
              <span class="mcq-dot">${isCompleted ? '✓' : (isCurrent && si === 0 ? '◉' : '○')}</span>${sq}
            </div>
          `).join('')}
        </div>
        ${isCurrent ? `<button class="mc-conquer-btn" style="background:linear-gradient(135deg,${node.color},${node.glow})" onclick="window.completeCurrentRoadmapStage()">⚔️ Conquer Stage</button>` : ''}
        ${isCompleted ? '<div class="mc-conquered">✨ Conquered</div>' : ''}
        ${isLocked ? '<div class="mc-lock">🔒 Locked</div>' : ''}
      </div>
    `;
  });
  html += `</div></div>`;

  container.innerHTML = html;

  // Scroll active stage into view
  setTimeout(() => {
    const activeCard = container.querySelector('.mc-active');
    activeCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
}

// ===== NEARBY LOCATIONS =====
const LOCATION_DATA: Record<string, Array<{ name: string, address: string, tags: string[], dist: string, emoji: string }>> = {
  'default': [
    { name: 'Whole Foods Market', address: '10 Columbus Cir, New York, NY', tags: ['Organic', 'Supplements', 'Fresh Produce'], dist: '0.3 mi', emoji: '🏪' },
    { name: 'Trader Joe\'s', address: '675 6th Ave, New York, NY', tags: ['Budget-Friendly', 'Healthy Snacks'], dist: '0.8 mi', emoji: '🛒' },
    { name: 'Juice Press', address: '279 E Houston St, New York, NY', tags: ['Juice Bar', 'Smoothies', 'Vegan'], dist: '1.2 mi', emoji: '🧃' },
    { name: 'GNC Nutrition', address: '1585 Broadway, New York, NY', tags: ['Supplements', 'Protein', 'Vitamins'], dist: '0.5 mi', emoji: '💊' },
    { name: 'Eataly NYC', address: '200 5th Ave, New York, NY', tags: ['Fresh Produce', 'Mediterranean', 'Premium'], dist: '1.5 mi', emoji: '🍏' },
    { name: 'Sprouts Farmers Market', address: '2005 Palmer Ave, Larchmont, NY', tags: ['Organic', 'Bulk Items', 'Affordable'], dist: '2.1 mi', emoji: '🥦' },
  ],
  'london': [
    { name: 'Planet Organic', address: '42 Westbourne Grove, London W2', tags: ['Organic', 'Supplements', 'Vegan'], dist: '0.4 mi', emoji: '🏪' },
    { name: 'Whole Foods Market', address: '63-97 Kensington High St, London W8', tags: ['Premium', 'Fresh Produce'], dist: '0.9 mi', emoji: '🛒' },
    { name: 'Holland & Barrett', address: 'Oxford Street, London W1', tags: ['Supplements', 'Vitamins', 'Health Food'], dist: '0.6 mi', emoji: '💊' },
    { name: 'Detox Kitchen', address: '10 Mortimer St, London W1', tags: ['Meal Prep', 'Clean Eating'], dist: '1.1 mi', emoji: '🥗' },
  ],
  'mumbai': [
    { name: 'Nature\'s Basket', address: 'Linking Rd, Bandra West, Mumbai', tags: ['Organic', 'International', 'Premium'], dist: '0.5 km', emoji: '🏪' },
    { name: 'Foodhall', address: 'Palladium Mall, Lower Parel, Mumbai', tags: ['Gourmet', 'Fresh Produce', 'Imported'], dist: '1.2 km', emoji: '🛒' },
    { name: 'Organic World', address: 'Hill Road, Bandra, Mumbai', tags: ['100% Organic', 'Local Produce'], dist: '0.8 km', emoji: '🥦' },
    { name: 'GNC India', address: 'Inorbit Mall, Malad, Mumbai', tags: ['Supplements', 'Protein', 'Fitness'], dist: '3.5 km', emoji: '💊' },
  ],
};

function renderNearbyLocations(city = 'default') {
  const key = Object.keys(LOCATION_DATA).find(k => city.toLowerCase().includes(k)) || 'default';
  const locations = LOCATION_DATA[key];
  const container = document.getElementById('nearbyList');
  if (!container) return;
  container.innerHTML = locations.map(loc => `
    < div class="nearby-item" >
      <span class="nearby-emoji" style = "display:flex;align-items:center;justify-content:center;" > <svg width="20" height = "20" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" stroke - width="1.5" stroke - linecap="round" stroke - linejoin="round" > <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" > </path><circle cx="12" cy="10" r="3"></circle > </svg></span >
        <div class="nearby-info" >
          <span class="nearby-name" > ${loc.name} </span>
            < span class="nearby-address" > ${loc.address} </span>
              < div class="nearby-tags" >
                ${loc.tags.map(t => `<span class="nearby-tag">${t}</span>`).join('')}
  </div>
    </div>
    < span class="nearby-dist" > ${loc.dist} </span>
      </div>
        `).join('');
}

function searchNearbyLocations() {
  const input = document.getElementById('locationInput') as HTMLInputElement;
  const city = input?.value?.trim() || '';
  if (!city) return;

  // Update map iframe to show the searched city
  const frame = document.getElementById('mapFrame') as HTMLIFrameElement;
  if (frame) {
    const encoded = encodeURIComponent(city);
    frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=-0.1%2C51.5%2C0.1%2C51.6&layer=mapnik`;
    // Use nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const d = 0.02;
          frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`;
        }
      })
      .catch(() => { });
  }

  renderNearbyLocations(city);
}

// Type declarations for window functions
declare global {
  interface Window {
    addWater: (ml: number) => void;
    resetWater: () => void;
    openMealModal: (id: number) => void;
    rateMeal: (el: HTMLElement, rating: number) => void;
    removePantryItem: (index: number) => void;
    toggleMeal: (index: number) => void;
    swapMeal: (index: number) => void;
    pairBluetoothDevice: () => void;
    startCamera: () => void;
    capturePhoto: () => void;
    analyzeFood: () => void;
    retakeScan: () => void;
    likeBlogPost: (id: number) => void;
    toggleComments: (id: number) => void;
    addComment: (id: number) => void;
    completeCurrentRoadmapStage: () => void;
    toggleDeviceConnection: (index: number) => void;
    showGuildView: (view: string) => void;
    selectGuildIcon: (icon: string) => void;
    joinGuild: (index: number) => void;
    createGuild: () => void;
  }
}

// ===== REGIONAL MEALS DATA =====
const REGIONAL_MEALS: Record<string, Array<{ name: string, emoji: string, type: string, calories: number, protein: number, carbs: number, fat: number, description: string, recipeIngredients?: string[], recipeInstructions?: string }>> = {
  'south-asian': [
    {
      name: 'Butter Chicken & Naan', emoji: '🍛', type: 'dinner', calories: 650, protein: 35, carbs: 55, fat: 28, description: 'Creamy tomato-based chicken curry served with fluffy naan bread',
      recipeIngredients: ['500g Chicken Thighs (boneless)', '1 cup Tomato Puree', '1/2 cup Heavy Cream', '2 tbsp Butter', '1 tbsp Garam Masala', '1 tsp Turmeric', '1 tsp Chili Powder', '1 inch Ginger (grated)', '4 cloves Garlic (minced)', '1 Onion (diced)', 'Salt to taste', '2 Naan Breads', 'Fresh Coriander for garnish'],
      recipeInstructions: '1. Marinate chicken in yogurt, turmeric, and chili powder for 30 min.\n2. Heat butter in a pan, sauté onion, ginger, and garlic until golden.\n3. Add tomato puree, garam masala, and salt. Cook for 10 min.\n4. Add marinated chicken, cook on medium heat for 20 min.\n5. Stir in heavy cream, simmer for 5 min.\n6. Garnish with coriander and serve with warm naan.'
    },
    {
      name: 'Masala Dosa', emoji: '🧇', type: 'breakfast', calories: 380, protein: 12, carbs: 52, fat: 14, description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutney',
      recipeIngredients: ['1 cup Rice', '1/3 cup Urad Dal', '3 Potatoes (boiled, mashed)', '1 Onion (sliced)', '1 tsp Mustard Seeds', '1 tsp Turmeric', '2 Green Chillies (chopped)', 'Curry Leaves', '2 tbsp Oil', 'Salt to taste'],
      recipeInstructions: '1. Soak rice and dal overnight. Grind to a smooth batter, ferment 8 hours.\n2. For filling: heat oil, add mustard seeds, curry leaves, chillies, and onion.\n3. Add turmeric and mashed potatoes, mix well. Season with salt.\n4. Heat a flat pan, spread batter in a thin circle.\n5. Drizzle oil around edges, cook until golden and crispy.\n6. Place potato filling in the center, fold and serve with sambar and chutney.'
    },
    {
      name: 'Dal Tadka & Rice', emoji: '🍚', type: 'lunch', calories: 420, protein: 18, carbs: 62, fat: 10, description: 'Yellow lentils tempered with cumin and garlic, served over basmati rice',
      recipeIngredients: ['1 cup Toor Dal (yellow lentils)', '1 Tomato (chopped)', '1 Onion (chopped)', '3 cloves Garlic (sliced)', '1 tsp Cumin Seeds', '1 tsp Turmeric', '1 tsp Red Chili Powder', '2 tbsp Ghee', 'Fresh Coriander', '1.5 cups Basmati Rice', 'Salt to taste'],
      recipeInstructions: '1. Wash dal and pressure cook with turmeric, tomato, and water for 15 min.\n2. Cook basmati rice separately.\n3. For tadka: heat ghee, add cumin seeds and sliced garlic until golden.\n4. Add chopped onion and chili powder, sauté for 2 min.\n5. Pour the tadka over the cooked dal, stir well.\n6. Garnish with coriander and serve over rice.'
    },
    {
      name: 'Tandoori Chicken Salad', emoji: '🍗', type: 'lunch', calories: 380, protein: 42, carbs: 12, fat: 18, description: 'Grilled yogurt-marinated chicken with fresh veggies and mint raita',
      recipeIngredients: ['500g Chicken Breast', '1 cup Yogurt', '2 tbsp Tandoori Masala', '1 tbsp Lemon Juice', '1 tsp Ginger-Garlic Paste', 'Mixed Salad Greens', '1 Cucumber (sliced)', '1 Tomato (wedges)', '1/4 cup Mint Raita', 'Red Onion rings'],
      recipeInstructions: '1. Mix yogurt, tandoori masala, lemon juice, and ginger-garlic paste.\n2. Marinate chicken for at least 2 hours (overnight is best).\n3. Grill or bake chicken at 220°C (425°F) for 25 min until charred.\n4. Slice chicken and arrange over salad greens, cucumber, tomato, and onion.\n5. Drizzle with mint raita and serve.'
    },
    {
      name: 'Chana Masala Bowl', emoji: '🫘', type: 'dinner', calories: 450, protein: 20, carbs: 58, fat: 14, description: 'Spiced chickpea curry with brown rice and fresh coriander',
      recipeIngredients: ['2 cans Chickpeas (drained)', '1 Onion (diced)', '2 Tomatoes (pureed)', '1 tbsp Chana Masala Spice', '1 tsp Cumin Powder', '1 tsp Coriander Powder', '1/2 tsp Turmeric', '2 tbsp Oil', '1 inch Ginger (grated)', '1 cup Brown Rice', 'Fresh Coriander', 'Lemon wedge'],
      recipeInstructions: '1. Cook brown rice according to package.\n2. Heat oil, sauté onion and ginger until translucent.\n3. Add all spices, cook for 1 min until fragrant.\n4. Add tomato puree, cook for 5 min.\n5. Add chickpeas and 1/2 cup water. Simmer for 15 min.\n6. Serve over brown rice, garnish with coriander and lemon.'
    },
    {
      name: 'Mango Lassi Smoothie', emoji: '🥤', type: 'snack', calories: 220, protein: 8, carbs: 38, fat: 4, description: 'Refreshing yogurt-based mango drink packed with probiotics',
      recipeIngredients: ['1 cup Ripe Mango (chopped)', '1 cup Yogurt', '1/2 cup Milk', '2 tbsp Sugar or Honey', '1/4 tsp Cardamom Powder', 'Ice cubes', 'Pistachios for garnish'],
      recipeInstructions: '1. Add mango, yogurt, milk, sugar, and cardamom to a blender.\n2. Add ice cubes.\n3. Blend until smooth and creamy.\n4. Pour into glasses.\n5. Garnish with crushed pistachios and serve chilled.'
    },
  ],
  'east-asian': [
    { name: 'Teriyaki Salmon Bowl', emoji: '🍣', type: 'dinner', calories: 520, protein: 38, carbs: 45, fat: 18, description: 'Glazed salmon on sushi rice with edamame and pickled ginger' },
    { name: 'Congee with Century Egg', emoji: '🍜', type: 'breakfast', calories: 280, protein: 14, carbs: 42, fat: 6, description: 'Silky rice porridge with preserved egg and crispy shallots' },
    { name: 'Kung Pao Chicken', emoji: '🌶️', type: 'lunch', calories: 480, protein: 34, carbs: 32, fat: 22, description: 'Wok-fired chicken with peanuts, dried chillies, and Sichuan peppercorns' },
    { name: 'Miso Ramen', emoji: '🍜', type: 'dinner', calories: 580, protein: 28, carbs: 62, fat: 22, description: 'Rich miso broth with chashu pork, soft egg, and nori' },
    { name: 'Bibimbap', emoji: '🍚', type: 'lunch', calories: 510, protein: 25, carbs: 58, fat: 18, description: 'Korean mixed rice bowl with sautéed vegetables, egg, and gochujang' },
    { name: 'Matcha Protein Bowl', emoji: '🍵', type: 'snack', calories: 260, protein: 18, carbs: 32, fat: 8, description: 'Matcha smoothie bowl with granola, banana, and chia seeds' },
  ],
  'mediterranean': [
    { name: 'Greek Moussaka', emoji: '🍆', type: 'dinner', calories: 550, protein: 28, carbs: 38, fat: 30, description: 'Layered eggplant and lamb casserole with béchamel sauce' },
    { name: 'Shakshuka', emoji: '🍳', type: 'breakfast', calories: 350, protein: 20, carbs: 22, fat: 20, description: 'Poached eggs in spiced tomato and pepper sauce with feta crumbles' },
    { name: 'Grilled Halloumi Salad', emoji: '🧀', type: 'lunch', calories: 420, protein: 24, carbs: 18, fat: 28, description: 'Pan-seared halloumi with arugula, pomegranate, and za\'atar dressing' },
    { name: 'Pasta Primavera', emoji: '🍝', type: 'dinner', calories: 480, protein: 18, carbs: 62, fat: 16, description: 'Whole wheat penne with seasonal roasted vegetables and olive oil' },
    { name: 'Hummus & Falafel Plate', emoji: '🧆', type: 'lunch', calories: 510, protein: 22, carbs: 52, fat: 24, description: 'Crispy falafel with creamy hummus, tahini, and fresh pita' },
    { name: 'Greek Yogurt & Honey', emoji: '🍯', type: 'snack', calories: 200, protein: 16, carbs: 28, fat: 4, description: 'Thick strained yogurt with raw honey and crushed walnuts' },
  ],
  'american': [
    { name: 'BBQ Chicken Bowl', emoji: '🍗', type: 'dinner', calories: 580, protein: 42, carbs: 48, fat: 20, description: 'Smoky BBQ pulled chicken with cornbread crust and coleslaw' },
    { name: 'Avocado Toast & Eggs', emoji: '🥑', type: 'breakfast', calories: 420, protein: 22, carbs: 35, fat: 24, description: 'Sourdough with smashed avocado, poached eggs, and everything seasoning' },
    { name: 'Southwest Burrito Bowl', emoji: '🌮', type: 'lunch', calories: 550, protein: 35, carbs: 52, fat: 22, description: 'Black beans, grilled chicken, corn, pico de gallo, and lime rice' },
    { name: 'Turkey Burger & Sweet Fries', emoji: '🍔', type: 'dinner', calories: 620, protein: 38, carbs: 55, fat: 25, description: 'Lean turkey burger with baked sweet potato fries and aioli' },
    { name: 'Cobb Salad', emoji: '🥗', type: 'lunch', calories: 450, protein: 35, carbs: 15, fat: 30, description: 'Chopped salad with grilled chicken, bacon, avocado, blue cheese, and egg' },
    { name: 'Acai Bowl', emoji: '🫐', type: 'snack', calories: 310, protein: 8, carbs: 52, fat: 10, description: 'Blended acai with granola, banana, strawberries, and honey drizzle' },
  ],
  'middle-eastern': [
    { name: 'Lamb Kofta & Tabbouleh', emoji: '🥩', type: 'dinner', calories: 520, protein: 35, carbs: 38, fat: 24, description: 'Grilled spiced lamb skewers with fresh parsley and bulgur salad' },
    { name: 'Ful Medames', emoji: '🫘', type: 'breakfast', calories: 380, protein: 20, carbs: 48, fat: 12, description: 'Slow-cooked fava beans with cumin, lemon, olive oil, and warm pita' },
    { name: 'Chicken Shawarma Plate', emoji: '🌯', type: 'lunch', calories: 550, protein: 38, carbs: 42, fat: 22, description: 'Marinated rotisserie chicken with garlic sauce, pickles, and rice' },
    { name: 'Mansaf', emoji: '🍚', type: 'dinner', calories: 680, protein: 40, carbs: 55, fat: 32, description: 'Jordanian lamb cooked in fermented yogurt with almonds and rice' },
    { name: 'Fattoush Salad', emoji: '🥗', type: 'lunch', calories: 280, protein: 8, carbs: 32, fat: 14, description: 'Crispy pita chip salad with sumac dressing and fresh herbs' },
    { name: 'Turkish Delight Yogurt', emoji: '🍬', type: 'snack', calories: 180, protein: 10, carbs: 26, fat: 4, description: 'Rose-scented yogurt with crushed pistachios and pomegranate' },
  ],
  'african': [
    { name: 'Jollof Rice & Chicken', emoji: '🍚', type: 'dinner', calories: 580, protein: 35, carbs: 62, fat: 18, description: 'West African spiced tomato rice with grilled chicken thighs' },
    { name: 'Shakshuka Tunisian', emoji: '🍳', type: 'breakfast', calories: 380, protein: 22, carbs: 25, fat: 22, description: 'North African style eggs in harissa-spiced tomato sauce with merguez' },
    { name: 'Ethiopian Injera Platter', emoji: '🧇', type: 'lunch', calories: 520, protein: 28, carbs: 58, fat: 18, description: 'Sourdough flatbread with lentil stew, collard greens, and berbere chicken' },
    { name: 'Moroccan Tagine', emoji: '🍲', type: 'dinner', calories: 490, protein: 32, carbs: 42, fat: 20, description: 'Slow-cooked lamb with apricots, almonds, and saffron couscous' },
    { name: 'Peri-Peri Chicken', emoji: '🌶️', type: 'lunch', calories: 450, protein: 40, carbs: 22, fat: 22, description: 'Mozambican-style grilled chicken with fiery piri-piri sauce and rice' },
    { name: 'Baobab Smoothie', emoji: '🥤', type: 'snack', calories: 200, protein: 6, carbs: 38, fat: 3, description: 'Nutrient-rich baobab fruit smoothie with banana and coconut milk' },
  ],
  'latin': [
    { name: 'Feijoada Bowl', emoji: '🍲', type: 'dinner', calories: 620, protein: 38, carbs: 55, fat: 25, description: 'Brazilian black bean stew with pork, rice, collard greens, and farofa' },
    { name: 'Chilaquiles Verdes', emoji: '🌽', type: 'breakfast', calories: 420, protein: 20, carbs: 45, fat: 18, description: 'Crispy tortilla chips in green salsa with eggs, cream, and cheese' },
    { name: 'Ceviche Mixto', emoji: '🦐', type: 'lunch', calories: 280, protein: 30, carbs: 18, fat: 8, description: 'Fresh fish and shrimp cured in lime juice with red onion and cilantro' },
    { name: 'Lomo Saltado', emoji: '🥩', type: 'dinner', calories: 550, protein: 38, carbs: 45, fat: 22, description: 'Peruvian stir-fried beef with tomatoes, onions, and french fries' },
    { name: 'Arepa Rellena', emoji: '🧇', type: 'lunch', calories: 480, protein: 25, carbs: 42, fat: 22, description: 'Venezuelan corn cake stuffed with black beans, avocado, and cheese' },
    { name: 'Açaí na Tigela', emoji: '🫐', type: 'snack', calories: 320, protein: 6, carbs: 52, fat: 12, description: 'Thick açaí blend topped with granola, banana, and condensed milk drizzle' },
  ],
  'european': [
    { name: 'Coq au Vin', emoji: '🍗', type: 'dinner', calories: 520, protein: 38, carbs: 22, fat: 28, description: 'French braised chicken in red wine with mushrooms, pearl onions, and herbs' },
    { name: 'Bircher Muesli', emoji: '🥣', type: 'breakfast', calories: 360, protein: 14, carbs: 52, fat: 10, description: 'Swiss overnight oats with grated apple, yogurt, honey, and nuts' },
    { name: 'Niçoise Salad', emoji: '🥗', type: 'lunch', calories: 420, protein: 28, carbs: 22, fat: 26, description: 'French salad with seared tuna, green beans, potatoes, olives, and eggs' },
    { name: 'Wiener Schnitzel', emoji: '🍖', type: 'dinner', calories: 580, protein: 35, carbs: 42, fat: 28, description: 'Crispy breaded veal cutlet with lemon, potato salad, and lingonberries' },
    { name: 'Caprese Panini', emoji: '🧀', type: 'lunch', calories: 450, protein: 22, carbs: 38, fat: 24, description: 'Italian grilled sandwich with fresh mozzarella, tomato, basil, and pesto' },
    { name: 'Berry Crème Brûlée', emoji: '🍓', type: 'snack', calories: 240, protein: 6, carbs: 32, fat: 10, description: 'Vanilla custard with caramelized sugar top and mixed berry compote' },
  ],
};

let currentRegion = 'south-asian';

function initGeoMeals() {
  renderRegionalMeals(currentRegion);

  // Region button click handlers
  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const region = btn.getAttribute('data-region') || 'south-asian';
      const lat = btn.getAttribute('data-lat') || '20';
      const lon = btn.getAttribute('data-lon') || '78';
      currentRegion = region;
      renderRegionalMeals(region);
      updateGeoMap(parseFloat(lat), parseFloat(lon));
    });
  });

  // Detect location button
  document.getElementById('detectLocationBtn')?.addEventListener('click', detectUserLocation);

  // Customize meal plan button
  document.getElementById('customizeMealPlanBtn')?.addEventListener('click', () => {
    window.location.hash = 'meals';
  });
}

function renderRegionalMeals(region: string) {
  const meals = REGIONAL_MEALS[region] || REGIONAL_MEALS['south-asian'];
  const grid = document.getElementById('regionalMealsGrid');
  const title = document.getElementById('regionalMealsTitle');
  const count = document.getElementById('regionalMealCount');

  const regionNames: Record<string, string> = {
    'south-asian': 'South Asia',
    'east-asian': 'East Asia',
    'mediterranean': 'Mediterranean',
    'american': 'American',
    'middle-eastern': 'Middle Eastern',
    'african': 'African',
    'latin': 'Latin American',
    'european': 'European',
  };

  const mapSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: bottom;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`;
  if (title) title.innerHTML = `${mapSvg}Popular in ${regionNames[region] || region}`;
  if (count) count.textContent = `${meals.length} dishes`;
  if (!grid) return;

  grid.innerHTML = meals.map((m, idx) => `
    <div class="meal-card animate-in" style="cursor:pointer" onclick="window.openRegionalMealModal('${region}', ${idx})">
      <div class="meal-image-placeholder ${m.type}"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg></div>
      <div class="meal-card-body">
        <div class="meal-card-top">
          <span class="meal-type-badge ${m.type}">${m.type}</span>
          <span class="ai-score"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${85 + Math.floor(Math.random() * 12)}% match</span>
        </div>
        <h4 class="meal-card-title">${m.name}</h4>
        <div class="meal-macros">
          <div class="meal-macro"><strong>${m.calories}</strong>kcal</div>
          <div class="meal-macro"><strong>${m.protein}g</strong>protein</div>
          <div class="meal-macro"><strong>${m.carbs}g</strong>carbs</div>
          <div class="meal-macro"><strong>${m.fat}g</strong>fat</div>
        </div>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-top:8px">${m.description}</p>
      </div>
    </div>
  `).join('');
}

// Open modal for regional meals with recipe details
// @ts-ignore
window.openRegionalMealModal = function (region: string, index: number) {
  const meals = REGIONAL_MEALS[region];
  if (!meals || !meals[index]) return;
  const meal = meals[index];
  const modal = $('#mealModal');
  const body = $('#modalBody');
  if (!modal || !body) return;

  const ingredientsHtml = meal.recipeIngredients && meal.recipeIngredients.length > 0
    ? `
      <div class="modal-section recipe-ingredients">
        <h4>🛒 Ingredients</h4>
        <ol class="ingredients-list" style="list-style-type:decimal;padding-left:20px;">
          ${meal.recipeIngredients.map((ing: string) => `<li style="list-style-type:decimal;margin-bottom:4px;">${ing}</li>`).join('')}
        </ol>
      </div>
      `
    : '';

  const instructionsHtml = meal.recipeInstructions
    ? `
      <div class="modal-section recipe-instructions">
        <h4>👩‍🍳 Instructions</h4>
        <div class="instructions-content">
          ${meal.recipeInstructions.split('\n').map((step: string) => `<p>${step}</p>`).join('')}
        </div>
      </div>
      `
    : '';

  body.innerHTML = `
    <p class="modal-meal-type">${meal.type}</p>
    <h2>${meal.emoji} ${meal.name}</h2>
    <div class="modal-section">
      <p>${meal.description}</p>
    </div>
    
    ${ingredientsHtml}
    ${instructionsHtml}

    <div class="modal-section">
      <h4>Nutrition Breakdown</h4>
      <div class="modal-macros-grid">
        <div class="modal-macro-item cal"><span class="mm-val">${meal.calories}</span><span class="mm-label">Calories</span></div>
        <div class="modal-macro-item prot"><span class="mm-val">${meal.protein}g</span><span class="mm-label">Protein</span></div>
        <div class="modal-macro-item carb"><span class="mm-val">${meal.carbs}g</span><span class="mm-label">Carbs</span></div>
        <div class="modal-macro-item fatt"><span class="mm-val">${meal.fat}g</span><span class="mm-label">Fat</span></div>
      </div>
    </div>
    <div class="modal-section" style="margin-top:16px">
      <h4>Rate This Dish</h4>
      <div class="modal-star-rating">
        ${[1, 2, 3, 4, 5].map(i => `<span class="modal-star" data-star="${i}" onclick="window.rateMeal(this,${i})">★</span>`).join('')}
      </div>
    </div>
  `;
  modal.classList.add('active');
};

function updateGeoMap(lat: number, lon: number) {
  const frame = document.getElementById('geoMapFrame') as HTMLIFrameElement;
  if (!frame) return;
  const d = 15;
  frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`;
}

function detectUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    updateGeoMap(lat, lon);
    // Auto-select region based on coordinates
    let region = 'south-asian';
    if (lon > 60 && lon < 100 && lat > 5 && lat < 40) region = 'south-asian';
    else if (lon > 100 && lat > 15) region = 'east-asian';
    else if (lon > -15 && lon < 40 && lat > 30 && lat < 50) region = 'mediterranean';
    else if (lon < -30 && lat > 25) region = 'american';
    else if (lon > 30 && lon < 65 && lat > 10 && lat < 45) region = 'middle-eastern';
    else if (lon > -20 && lon < 55 && lat < 15) region = 'african';
    else if (lon < -30 && lat < 25) region = 'latin';
    else if (lon > -15 && lon < 40 && lat > 45) region = 'european';

    currentRegion = region;
    document.querySelectorAll('.region-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-region') === region);
    });
    renderRegionalMeals(region);
  }, () => {
    alert('Unable to retrieve your location. Please select a region manually.');
  });
}

// ===== DEVICE MANAGEMENT & BLUETOOTH =====
const DEVICES_DATA = [
  { name: 'Samsung Galaxy Watch', icon: '⌚', connected: true, lastSync: '1 min ago', type: 'wearable', source: 'Heart rate, steps, sleep, stress, SpO2, body composition' },
  { name: 'Samsung Health', icon: '📱', connected: true, lastSync: '1 min ago', type: 'phone_app', source: 'All health aggregator, workouts, nutrition' },
  { name: 'Google Fit', icon: '💚', connected: true, lastSync: '3 min ago', type: 'phone_app', source: 'Steps, activity, heart points, calories' },
  { name: 'Strava', icon: '🏃', connected: true, lastSync: '2 hr ago', type: 'fitness_app', source: 'Running, cycling, workout history' },
  { name: 'MyFitnessPal', icon: '🍎', connected: true, lastSync: '30 min ago', type: 'nutrition_app', source: 'Food diary, calorie tracking, macros' },
  { name: 'Sleep Cycle', icon: '🌙', connected: true, lastSync: '8 hr ago', type: 'sleep_app', source: 'Sleep analysis, snore detection, wake-up' },
];

// Aggregated health data from ALL connected sources
const HEALTH_DATA = {
  // From Galaxy Watch + Samsung Health
  heartRate: { current: 74, resting: 60, max: 168, zone: 'Fat Burn', avg: 78 },
  steps: { today: 8432, goal: 10000, distance: 5.8 },
  calories: { burned: 1847, active: 623, bmr: 1224, goal: 2400, consumed: 1420 },
  sleep: { duration: '7h 24m', score: 82, deep: '1h 12m', rem: '1h 48m', light: '4h 24m', awake: '18m' },
  spo2: { avg: 97, low: 94, high: 99 },
  stress: { score: 28, level: 'Low', measurements: 12 },
  hrv: 42,
  activeMinutes: 67,
  floors: 12,
  bodyComposition: { bmi: 22.4, bodyFat: 18.2, muscleMass: 62.1 },
  bloodPressure: { systolic: 118, diastolic: 76 },
  temperature: 36.5,
  // From Google Fit
  heartPoints: 32,
  moveMinutes: 45,
  // From Strava
  lastWorkout: { type: 'Morning Run', duration: '32 min', distance: '4.2 km', calories: 348, time: '7:15 AM' },
  weeklyWorkouts: 4,
  // From MyFitnessPal
  nutrition: { protein: 68, carbs: 142, fat: 48, fiber: 18, water: 1200 },
  mealsLogged: 2,
  remainingCalories: 980,
  // From Sleep Cycle
  sleepQuality: 'Good',
  snoreTime: '12 min',
  wakeUpMood: 'Energized',
};



function renderDevices() {
  const list = document.getElementById('deviceList');
  if (!list) return;
  list.innerHTML = DEVICES_DATA.map((d, i) => `
    <div class="device-item ${d.connected ? 'connected' : ''} ${i >= 3 ? 'device-hidden' : ''}">
      <div class="device-icon">${d.icon}</div>
      <div class="device-info">
        <span class="device-name">${d.name}</span>
        <span class="device-status">${d.connected ? 'Synced ' + d.lastSync : 'Not connected'}</span>
      </div>
      ${d.connected
      ? `<div class="device-dot online"></div>`
      : `<button class="device-reconnect" onclick="window.pairBluetoothDevice()">Connect</button>`
    }
    </div>
  `).join('');
}

function toggleDeviceExpand() {
  const list = document.getElementById('deviceList');
  const btn = document.getElementById('expandDevicesBtn');
  if (!list || !btn) return;
  const hidden = list.querySelectorAll('.device-hidden');
  const isExpanded = btn.classList.contains('expanded');
  hidden.forEach(el => {
    (el as HTMLElement).style.display = isExpanded ? 'none' : 'flex';
  });
  btn.classList.toggle('expanded');
  btn.innerHTML = isExpanded
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg> Show More'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg> Show Less';
}

function renderFitbitMetrics() {
  const grid = document.getElementById('fitbitGrid');
  // const insights = document.getElementById('fitbitInsights');
  if (!grid) return;

  const d = HEALTH_DATA;
  const stepsPct = Math.round((d.steps.today / d.steps.goal) * 100);
  const calPct = Math.round((d.calories.burned / d.calories.goal) * 100);
  const protPct = Math.round((d.nutrition.protein / 120) * 100);

  grid.innerHTML = `
    <div class="fb-metric">
      <div class="fb-metric-icon">❤️</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.heartRate.current} <small>BPM</small></span>
        <span class="fb-label">Heart Rate <small class="fb-source">Galaxy Watch</small></span>
        <span class="fb-sub">Resting: ${d.heartRate.resting} · Avg: ${d.heartRate.avg} · Zone: ${d.heartRate.zone}</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">👟</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.steps.today.toLocaleString()}</span>
        <span class="fb-label">Steps Today <small class="fb-source">Google Fit</small></span>
        <div class="fb-bar"><div class="fb-bar-fill" style="width:${Math.min(stepsPct, 100)}%"></div></div>
        <span class="fb-sub">${stepsPct}% of ${d.steps.goal.toLocaleString()} goal · ${d.steps.distance} km · ${d.heartPoints} heart pts</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">🔥</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.calories.burned.toLocaleString()} <small>kcal burned</small></span>
        <span class="fb-label">Calories <small class="fb-source">All Sources</small></span>
        <div class="fb-bar"><div class="fb-bar-fill cal-fill" style="width:${Math.min(calPct, 100)}%"></div></div>
        <span class="fb-sub">Consumed: ${d.calories.consumed} · Remaining: ${d.remainingCalories} kcal</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">😴</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.sleep.duration} <small>Score ${d.sleep.score}</small></span>
        <span class="fb-label">Sleep <small class="fb-source">Sleep Cycle + Watch</small></span>
        <span class="fb-sub">Deep: ${d.sleep.deep} · REM: ${d.sleep.rem} · Quality: ${d.sleepQuality} · Mood: ${d.wakeUpMood}</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">🏃</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.lastWorkout.type}</span>
        <span class="fb-label">Last Workout <small class="fb-source">Strava</small></span>
        <span class="fb-sub">${d.lastWorkout.distance} · ${d.lastWorkout.duration} · ${d.lastWorkout.calories} kcal · ${d.weeklyWorkouts} this week</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">🍎</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.mealsLogged} meals <small>logged</small></span>
        <span class="fb-label">Nutrition <small class="fb-source">MyFitnessPal</small></span>
        <div class="fb-bar"><div class="fb-bar-fill" style="width:${Math.min(protPct, 100)}%"></div></div>
        <span class="fb-sub">P: ${d.nutrition.protein}g · C: ${d.nutrition.carbs}g · F: ${d.nutrition.fat}g · Fiber: ${d.nutrition.fiber}g</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">🧘</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.stress.score} <small>${d.stress.level}</small></span>
        <span class="fb-label">Stress · SpO2 <small class="fb-source">Galaxy Watch</small></span>
        <span class="fb-sub">HRV: ${d.hrv}ms · SpO2: ${d.spo2.avg}% · BP: ${d.bloodPressure.systolic}/${d.bloodPressure.diastolic}</span>
      </div>
    </div>
    <div class="fb-metric">
      <div class="fb-metric-icon">🏋️</div>
      <div class="fb-metric-data">
        <span class="fb-val">${d.bodyComposition.bodyFat}% <small>body fat</small></span>
        <span class="fb-label">Body Composition <small class="fb-source">Samsung Health</small></span>
        <span class="fb-sub">BMI: ${d.bodyComposition.bmi} · Muscle: ${d.bodyComposition.muscleMass}kg · Temp: ${d.temperature}°C</span>
      </div>
    </div>
  `;

  // Multi-Source Health Analysis removed per user request
}



async function pairBluetoothDevice() {
  const status = document.getElementById('btStatus');

  // Check browser support
  if (!navigator.bluetooth) {
    if (status) {
      status.className = 'bt-status error';
      status.textContent = '⚠️ Bluetooth not supported in this browser. Use Chrome/Edge on HTTPS.';
    }
    const toast = document.getElementById('xpToast');
    if (toast) {
      toast.innerHTML = '⚠️ Web Bluetooth requires Chrome/Edge on HTTPS or localhost';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }
    return;
  }

  if (status) {
    status.className = 'bt-status scanning';
    status.textContent = '🔍 Searching for Bluetooth devices...';
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['heart_rate', 'battery_service', 'generic_access']
    });

    if (status) {
      status.className = 'bt-status scanning';
      status.textContent = `🔗 Connecting to ${device.name || 'Unknown Device'}...`;
    }

    let deviceName = device.name || 'Bluetooth Device';

    // Try connecting to GATT server
    try {
      const server = await device.gatt?.connect();
      if (server) {
        // Try reading battery level
        try {
          const batteryService = await server.getPrimaryService('battery_service');
          const batteryChar = await batteryService.getCharacteristic('battery_level');
          const batteryVal = await batteryChar.readValue();
          const batteryLevel = batteryVal.getUint8(0);
          deviceName += ` (${batteryLevel}%)`;
        } catch { /* Battery service not available, no problem */ }
      }
    } catch { /* GATT connection optional */ }

    // Add to devices list
    const newDevice = {
      name: deviceName,
      icon: '📡',
      connected: true,
      lastSync: 'Just now',
      type: 'bluetooth',
      source: 'Paired via Web Bluetooth'
    };

    // Check if already exists
    const existingIdx = DEVICES_DATA.findIndex(d => d.name.includes(device.name || '___'));
    if (existingIdx >= 0) {
      DEVICES_DATA[existingIdx] = newDevice;
    } else {
      DEVICES_DATA.push(newDevice);
    }

    renderDevices();
    renderFitbitMetrics();

    if (status) {
      status.className = 'bt-status connected';
      status.textContent = `✅ ${deviceName} connected successfully!`;
    }

    // Celebration toast
    const toast = document.getElementById('xpToast');
    if (toast) {
      toast.innerHTML = `📡 ${deviceName} paired! +200 XP 🎉`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Listen for disconnection
    device.addEventListener('gattserverdisconnected', () => {
      const idx = DEVICES_DATA.findIndex(d => d.name === deviceName);
      if (idx >= 0) {
        DEVICES_DATA[idx].connected = false;
        DEVICES_DATA[idx].lastSync = 'Disconnected';
        renderDevices();
      }
      if (status) {
        status.className = 'bt-status error';
        status.textContent = `⚠️ ${deviceName} disconnected`;
      }
    });

  } catch (err: any) {
    if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
      if (status) {
        status.className = 'bt-status';
        status.textContent = 'Bluetooth pairing cancelled.';
      }
    } else {
      if (status) {
        status.className = 'bt-status error';
        status.textContent = `❌ Pairing failed: ${err.message || 'Unknown error'}`;
      }
    }
  }
}

window.pairBluetoothDevice = pairBluetoothDevice;
window.toggleDeviceExpand = toggleDeviceExpand;

// ===== FOOD RECOGNITION DATABASE (Real data from McCance & Widdowson's Composition of Foods) =====
interface NutritionEntry {
  name: string; emoji: string; calories: number; protein: number; carbs: number; fat: number;
  fiber: number; sugar: number; sodium: number; cholesterol: number; water: number;
  vitA: number; vitB12: number; vitC: number; vitD: number; vitE: number; vitK: number;
  calcium: number; iron: number; magnesium: number; potassium: number; zinc: number;
  nutritionDensity: number; serving: string; category: string;
}

function generateRecommendation(food: NutritionEntry): string {
  const tips: string[] = [];
  const nd = food.nutritionDensity;
  if (nd > 200) tips.push(`Outstanding nutrition density score (${nd.toFixed(0)}). This is a nutrient powerhouse!`);
  else if (nd > 100) tips.push(`Good nutrition density (${nd.toFixed(0)}). Solid choice for balanced nutrition.`);
  else if (nd > 50) tips.push(`Moderate nutrition density (${nd.toFixed(0)}). Consider pairing with nutrient-rich sides.`);
  else tips.push(`Lower nutrition density (${nd.toFixed(0)}). Best enjoyed as part of a varied diet.`);
  if (food.protein > 25) tips.push('Excellent protein source — supports muscle repair. Your Fitbit workout data suggests this is ideal post-exercise.');
  if (food.fiber > 5) tips.push('High in dietary fiber which supports digestive health and satiety.');
  if (food.calcium > 100) tips.push('Rich in calcium for bone health and muscle function.');
  if (food.iron > 3) tips.push('Good iron content — important for oxygen transport and energy levels.');
  if (food.potassium > 400) tips.push('High potassium supports heart rhythm and blood pressure. Your HRV data shows this helps recovery.');
  if (food.vitC > 5) tips.push('Contains vitamin C for immune support and iron absorption.');
  if (food.cholesterol > 100) tips.push('Higher cholesterol — monitor intake if watching cardiovascular health.');
  if (food.sodium > 500) tips.push('⚠️ Higher sodium content. Your daily target is 2300mg — balance with low-sodium meals.');
  if (food.fat > 30 && food.protein < 15) tips.push('High fat with lower protein. Consider adding a lean protein source.');
  const d = HEALTH_DATA;
  tips.push(`With ${d.steps.today.toLocaleString()} steps today and ${d.remainingCalories} kcal remaining, this ${food.calories > 400 ? 'hearty' : 'lighter'} meal ${food.calories > d.remainingCalories ? 'exceeds your remaining budget — consider a smaller portion' : 'fits well within your daily plan'}.`);
  return tips.join(' ');
}

const FOOD_DB: NutritionEntry[] = [
  // ── Dairy & Cheese ──
  { name: 'Cheddar Cheese', emoji: '🧀', calories: 113, protein: 6.4, carbs: 0.9, fat: 9.3, fiber: 0, sugar: 0.1, sodium: 200, cholesterol: 27.7, water: 10.3, vitA: 0.054, vitB12: 0.073, vitC: 0, vitD: 0.06, vitE: 0.2, vitK: 0.035, calcium: 198.8, iron: 0.077, magnesium: 7.6, potassium: 21.3, zinc: 1, nutritionDensity: 215.5, serving: '30g slice', category: 'dairy' },
  { name: 'Mozzarella Cheese', emoji: '🧀', calories: 90, protein: 6.7, carbs: 0.7, fat: 6.6, fiber: 0, sugar: 0, sodium: 150, cholesterol: 23.7, water: 15, vitA: 0.037, vitB12: 0.081, vitC: 0, vitD: 0.044, vitE: 0.001, vitK: 0.008, calcium: 151.5, iron: 0.1, magnesium: 6, potassium: 22.8, zinc: 0.9, nutritionDensity: 165.6, serving: '30g', category: 'dairy' },
  { name: 'Ricotta Cheese', emoji: '🧀', calories: 30, protein: 1.5, carbs: 1.5, fat: 2, fiber: 0, sugar: 0.09, sodium: 17, cholesterol: 9.8, water: 14.7, vitA: 0.075, vitB12: 0.091, vitC: 0.006, vitD: 0, vitE: 0.001, vitK: 0.011, calcium: 97, iron: 0.097, magnesium: 96, potassium: 30.8, zinc: 0.035, nutritionDensity: 5.2, serving: '30g', category: 'dairy' },
  { name: 'Parmesan Cheese', emoji: '🧀', calories: 71, protein: 6.4, carbs: 0.6, fat: 4.5, fiber: 0, sugar: 0.05, sodium: 200, cholesterol: 12.2, water: 5.4, vitA: 0.067, vitB12: 0.059, vitC: 0, vitD: 0.095, vitE: 0.018, vitK: 0.021, calcium: 213.1, iron: 0.1, magnesium: 7.9, potassium: 16.6, zinc: 0.5, nutritionDensity: 224.8, serving: '15g', category: 'dairy' },
  { name: 'Cream Cheese', emoji: '🧀', calories: 51, protein: 0.9, carbs: 0.8, fat: 5, fiber: 0, sugar: 0.5, sodium: 16, cholesterol: 14.6, water: 7.6, vitA: 0.2, vitB12: 0.092, vitC: 0.004, vitD: 0, vitE: 0, vitK: 0.1, calcium: 8, iron: 0.082, magnesium: 27, potassium: 15.5, zinc: 0.039, nutritionDensity: 7.1, serving: '30g', category: 'dairy' },
  { name: 'Eggnog', emoji: '🥛', calories: 224, protein: 11.6, carbs: 20.4, fat: 10.6, fiber: 0, sugar: 20.4, sodium: 100, cholesterol: 149.9, water: 209.7, vitA: 0.1, vitB12: 0.006, vitC: 3.8, vitD: 0.055, vitE: 0.5, vitK: 0.011, calcium: 330.2, iron: 0.5, magnesium: 48.3, potassium: 419.1, zinc: 1.2, nutritionDensity: 377.2, serving: '1 cup', category: 'dairy' },
  // ── Eggs ──
  { name: 'Boiled Egg', emoji: '🥚', calories: 93, protein: 7.5, carbs: 0.7, fat: 6.4, fiber: 0, sugar: 0.7, sodium: 42, cholesterol: 223.8, water: 44.8, vitA: 0.04, vitB12: 0.015, vitC: 0, vitD: 0.019, vitE: 0.6, vitK: 0.069, calcium: 30, iron: 0.7, magnesium: 6, potassium: 75.6, zinc: 0.6, nutritionDensity: 45.3, serving: '1 large', category: 'eggs' },
  { name: 'Scrambled Eggs', emoji: '🍳', calories: 100, protein: 6.5, carbs: 1, fat: 7.6, fiber: 0, sugar: 0.8, sodium: 310, cholesterol: 200.2, water: 31.3, vitA: 0.066, vitB12: 0.041, vitC: 1.6, vitD: 0.086, vitE: 0.5, vitK: 0.001, calcium: 26.8, iron: 1.2, magnesium: 6.6, potassium: 69.1, zinc: 0.8, nutritionDensity: 44.7, serving: '2 eggs', category: 'eggs' },
  { name: 'Omelette', emoji: '🍳', calories: 94, protein: 6.4, carbs: 0.4, fat: 7.1, fiber: 0, sugar: 0.2, sodium: 13, cholesterol: 190.9, water: 46.4, vitA: 0.4, vitB12: 0.041, vitC: 0.003, vitD: 0, vitE: 0.098, vitK: 0.8, calcium: 50, iron: 0.07, magnesium: 0.9, potassium: 101.9, zinc: 0.03, nutritionDensity: 14.4, serving: '1 egg', category: 'eggs' },
  // ── Spreads & Condiments ──
  { name: 'Peanut Butter', emoji: '🥜', calories: 88, protein: 3.3, carbs: 3.6, fat: 7.4, fiber: 0.9, sugar: 1, sodium: 85, cholesterol: 0, water: 0.2, vitA: 0, vitB12: 0.063, vitC: 0.078, vitD: 0, vitE: 0, vitK: 0.9, calcium: 0, iron: 0.079, magnesium: 0.3, potassium: 50.3, zinc: 0.044, nutritionDensity: 15.3, serving: '2 tbsp', category: 'condiment' },
  { name: 'Hummus', emoji: '🫘', calories: 435, protein: 12, carbs: 49.5, fat: 21.1, fiber: 9.8, sugar: 0.7, sodium: 159.6, cholesterol: 0, water: 0, vitA: 0, vitB12: 0, vitC: 19.4, vitD: 0, vitE: 1.8, vitK: 0.059, calcium: 120.5, iron: 3.8, magnesium: 71.3, potassium: 425.6, zinc: 2.7, nutritionDensity: 236.1, serving: '100g', category: 'condiment' },
  { name: 'Honey', emoji: '🍯', calories: 64, protein: 0.08, carbs: 17.3, fat: 0, fiber: 0.025, sugar: 17.2, sodium: 11, cholesterol: 0, water: 3.6, vitA: 0, vitB12: 0, vitC: 0.1, vitD: 0, vitE: 0, vitK: 0, calcium: 1.3, iron: 0.017, magnesium: 0.4, potassium: 10.9, zinc: 0.008, nutritionDensity: 18.9, serving: '1 tbsp', category: 'condiment' },
  // ── Prepared Dishes ──
  { name: 'Fried Rice', emoji: '🍚', calories: 228, protein: 6.5, carbs: 43.4, fat: 3.2, fiber: 1.5, sugar: 0.6, sodium: 600, cholesterol: 32.2, water: 85.4, vitA: 0.076, vitB12: 0, vitC: 0, vitD: 0.059, vitE: 0.2, vitK: 0.081, calcium: 19.6, iron: 1, magnesium: 14, potassium: 123.2, zinc: 1.1, nutritionDensity: 75.2, serving: '1 bowl', category: 'dish' },
  { name: 'Chicken Quesadilla', emoji: '🌮', calories: 529, protein: 27.1, carbs: 43.3, fat: 27.5, fiber: 3.1, sugar: 3.4, sodium: 767, cholesterol: 66.6, water: 76.7, vitA: 0.1, vitB12: 0.012, vitC: 0.2, vitD: 0.1, vitE: 0.5, vitK: 0.03, calcium: 484.2, iron: 3.2, magnesium: 45, potassium: 329.4, zinc: 2.6, nutritionDensity: 588.7, serving: '1 whole', category: 'dish' },
  { name: 'Burrito with Beef', emoji: '🌯', calories: 285, protein: 9.1, carbs: 43.9, fat: 8.1, fiber: 4.4, sugar: 4.1, sodium: 500, cholesterol: 2.6, water: 65.8, vitA: 0.036, vitB12: 0.2, vitC: 0.1, vitD: 0.4, vitE: 0, vitK: 0.5, calcium: 42, iron: 0.2, magnesium: 3.2, potassium: 150.9, zinc: 0.002, nutritionDensity: 65.9, serving: '1 burrito', category: 'dish' },
  { name: 'Spaghetti with Meat Sauce', emoji: '🍝', calories: 255, protein: 14.3, carbs: 43.1, fat: 2.9, fiber: 5.1, sugar: 7.4, sodium: 700, cholesterol: 17, water: 220.2, vitA: 0, vitB12: 0.077, vitC: 15.3, vitD: 0, vitE: 1.4, vitK: 0.002, calcium: 50.9, iron: 3.5, magnesium: 42.5, potassium: 407.5, zinc: 1.4, nutritionDensity: 135.1, serving: '1 plate', category: 'dish' },
  { name: 'Lasagna', emoji: '🍝', calories: 166, protein: 9, carbs: 18.9, fat: 6.1, fiber: 2.1, sugar: 3.8, sodium: 500, cholesterol: 20.9, water: 87.2, vitA: 0.2, vitB12: 0, vitC: 0.2, vitD: 3.1, vitE: 0, vitK: 1, calcium: 80, iron: 0.1, magnesium: 0.9, potassium: 141.5, zinc: 0.001, nutritionDensity: 36.7, serving: '1 piece', category: 'dish' },
  { name: 'Macaroni & Cheese', emoji: '🧀', calories: 310, protein: 12.6, carbs: 43.7, fat: 9.4, fiber: 2.3, sugar: 3, sodium: 1200, cholesterol: 15.1, water: 120.2, vitA: 0.2, vitB12: 0, vitC: 0.056, vitD: 0, vitE: 0, vitK: 1, calcium: 0, iron: 0.1, magnesium: 2.2, potassium: 442.3, zinc: 0, nutritionDensity: 68.3, serving: '1 cup', category: 'dish' },
  { name: 'Taco with Beef & Cheese', emoji: '🌮', calories: 156, protein: 6.1, carbs: 13.7, fat: 8.8, fiber: 2.7, sugar: 0.6, sodium: 393, cholesterol: 19.3, water: 39.3, vitA: 0.043, vitB12: 0.075, vitC: 0.3, vitD: 0.06, vitE: 0.4, vitK: 0.057, calcium: 61.4, iron: 0.8, magnesium: 22.1, potassium: 144.2, zinc: 1.2, nutritionDensity: 93.8, serving: '1 taco', category: 'dish' },
  { name: 'Kung Pao Chicken', emoji: '🍗', calories: 779, protein: 59, carbs: 41.5, fat: 42.2, fiber: 9.1, sugar: 18.3, sodium: 2400, cholesterol: 157, water: 451.7, vitA: 0, vitB12: 0.034, vitC: 42.9, vitD: 0, vitE: 6.2, vitK: 0.012, calcium: 120.8, iron: 4.6, magnesium: 145, potassium: 1316.7, zinc: 4.5, nutritionDensity: 320.1, serving: '1 serving', category: 'dish' },
  { name: 'Spinach Soufflé', emoji: '🥬', calories: 230, protein: 10.7, carbs: 8, fat: 17.6, fiber: 1, sugar: 2.5, sodium: 800, cholesterol: 160.5, water: 96.2, vitA: 0.2, vitB12: 0.061, vitC: 9.9, vitD: 0.063, vitE: 1.3, vitK: 0.2, calcium: 224.4, iron: 1.6, magnesium: 40.8, potassium: 314.2, zinc: 1.2, nutritionDensity: 273.4, serving: '1 cup', category: 'dish' },
  // ── Soups ──
  { name: 'Tomato Soup', emoji: '🍅', calories: 139, protein: 6.3, carbs: 22.6, fat: 3.3, fiber: 1.5, sugar: 16.5, sodium: 500, cholesterol: 10.1, water: 216.7, vitA: 0.014, vitB12: 0.061, vitC: 15.9, vitD: 0.07, vitE: 0.5, vitK: 0.083, calcium: 173.9, iron: 1.4, magnesium: 30.2, potassium: 461.2, zinc: 0.9, nutritionDensity: 224.9, serving: '1 bowl', category: 'soup' },
  { name: 'Chicken Noodle Soup', emoji: '🍜', calories: 145, protein: 7.2, carbs: 18.4, fat: 4.7, fiber: 2.7, sugar: 0, sodium: 2100, cholesterol: 24.2, water: 267.2, vitA: 0.029, vitB12: 0.097, vitC: 0.1, vitD: 0, vitE: 0, vitK: 0.2, calcium: 0, iron: 0.4, magnesium: 2, potassium: 115.1, zinc: 0.095, nutritionDensity: 33.5, serving: '1 bowl', category: 'soup' },
  { name: 'Minestrone Soup', emoji: '🍲', calories: 167, protein: 8.6, carbs: 22.6, fat: 5, fiber: 2, sugar: 3.7, sodium: 1300, cholesterol: 2.5, water: 204.1, vitA: 0, vitB12: 0, vitC: 2.2, vitD: 0, vitE: 1.1, vitK: 0.052, calcium: 68.9, iron: 1.8, magnesium: 14.8, potassium: 627.3, zinc: 1.5, nutritionDensity: 111.1, serving: '1 bowl', category: 'soup' },
  { name: 'Black Bean Soup', emoji: '🫘', calories: 234, protein: 12.4, carbs: 39.6, fat: 3.4, fiber: 17.5, sugar: 6.4, sodium: 2500, cholesterol: 0, water: 193.6, vitA: 0, vitB12: 0, vitC: 0.5, vitD: 0, vitE: 0.9, vitK: 0.035, calcium: 90, iron: 3.9, magnesium: 84.8, potassium: 642.5, zinc: 2.8, nutritionDensity: 167.3, serving: '1 bowl', category: 'soup' },
  // ── Fast Food ──
  { name: 'Big Mac', emoji: '🍔', calories: 563, protein: 25.9, carbs: 44, fat: 32.8, fiber: 3.5, sugar: 8.7, sodium: 1000, cholesterol: 78.8, water: 112.3, vitA: 0, vitB12: 0.048, vitC: 0.9, vitD: 0, vitE: 0, vitK: 0, calcium: 254, iron: 4.4, magnesium: 43.8, potassium: 396.4, zinc: 4.2, nutritionDensity: 365.5, serving: '1 burger', category: 'fast_food' },
  { name: 'Cheeseburger', emoji: '🍔', calories: 313, protein: 15.4, carbs: 33.1, fat: 14, fiber: 1.3, sugar: 7.4, sodium: 700, cholesterol: 41.7, water: 53.6, vitA: 0, vitB12: 0.02, vitC: 0.7, vitD: 0, vitE: 0, vitK: 0, calcium: 198.7, iron: 2.8, magnesium: 23.8, potassium: 238, zinc: 2.3, nutritionDensity: 266, serving: '1 burger', category: 'fast_food' },
  { name: 'Hamburger', emoji: '🍔', calories: 255, protein: 12.9, carbs: 28.7, fat: 9.9, fiber: 1.7, sugar: 5.8, sodium: 500, cholesterol: 28.1, water: 43.5, vitA: 0.4, vitB12: 0.082, vitC: 0.1, vitD: 0.3, vitE: 0.041, vitK: 0.053, calcium: 68, iron: 0.027, magnesium: 2.8, potassium: 106.7, zinc: 0.017, nutritionDensity: 53.9, serving: '1 burger', category: 'fast_food' },
  { name: 'Hotdog', emoji: '🌭', calories: 383, protein: 16.4, carbs: 28.5, fat: 23, fiber: 0, sugar: 0, sodium: 1100, cholesterol: 69.8, water: 83.6, vitA: 0, vitB12: 0.043, vitC: 0.2, vitD: 0, vitE: 0, vitK: 0, calcium: 37.2, iron: 3.7, magnesium: 20.2, potassium: 226.3, zinc: 3.1, nutritionDensity: 109, serving: '1 hotdog', category: 'fast_food' },
  { name: 'French Fries', emoji: '🍟', calories: 222, protein: 2.4, carbs: 29.4, fat: 10.5, fiber: 2.7, sugar: 0.2, sodium: 270, cholesterol: 0, water: 27.4, vitA: 0.063, vitB12: 0.002, vitC: 0.3, vitD: 3.3, vitE: 0, vitK: 1.2, calcium: 75, iron: 0.038, magnesium: 0.6, potassium: 88.8, zinc: 0.019, nutritionDensity: 45.4, serving: 'medium', category: 'fast_food' },
  { name: 'Chicken McNuggets', emoji: '🍗', calories: 48, protein: 2.5, carbs: 2.4, fat: 3.2, fiber: 0, sugar: 0.025, sodium: 9, cholesterol: 7, water: 7.5, vitA: 0.071, vitB12: 0, vitC: 0.072, vitD: 0.2, vitE: 0, vitK: 0, calcium: 0, iron: 0.017, magnesium: 0.1, potassium: 43.5, zinc: 0, nutritionDensity: 8.2, serving: '1 piece', category: 'fast_food' },
  { name: 'Pepperoni Pizza', emoji: '🍕', calories: 313, protein: 13, carbs: 35.5, fat: 13.2, fiber: 2.6, sugar: 3.6, sodium: 800, cholesterol: 27.8, water: 46.4, vitA: 0.3, vitB12: 0.1, vitC: 0.093, vitD: 1, vitE: 0, vitK: 1, calcium: 50, iron: 0.1, magnesium: 2.8, potassium: 219.8, zinc: 0.022, nutritionDensity: 64.8, serving: '1 slice', category: 'fast_food' },
  { name: 'Cheese Pizza', emoji: '🍕', calories: 285, protein: 12.2, carbs: 35.7, fat: 10.4, fiber: 2.5, sugar: 3.8, sodium: 600, cholesterol: 18.2, water: 46.2, vitA: 0.3, vitB12: 0.014, vitC: 0.066, vitD: 1.5, vitE: 0, vitK: 0.9, calcium: 82, iron: 0.1, magnesium: 2.7, potassium: 231.1, zinc: 0.031, nutritionDensity: 61.3, serving: '1 slice', category: 'fast_food' },
  { name: 'Veggie Burger', emoji: '🥦', calories: 124, protein: 11, carbs: 10, fat: 4.4, fiber: 3.4, sugar: 0.7, sodium: 400, cholesterol: 3.5, water: 42.8, vitA: 0, vitB12: 0.02, vitC: 3.2, vitD: 0, vitE: 0.2, vitK: 0.069, calcium: 95.2, iron: 1.7, magnesium: 39.2, potassium: 233.1, zinc: 0.9, nutritionDensity: 128.9, serving: '1 patty', category: 'fast_food' },
  // ── Fish & Seafood ──
  { name: 'Salmon (Cooked)', emoji: '🐟', calories: 733, protein: 78.7, carbs: 0, fat: 44, fiber: 0, sugar: 0, sodium: 200, cholesterol: 224.3, water: 230.5, vitA: 0.2, vitB12: 0.01, vitC: 13.2, vitD: 0.046, vitE: 4.1, vitK: 0.044, calcium: 53.4, iron: 1.2, magnesium: 106.8, potassium: 1367, zinc: 1.5, nutritionDensity: 190.7, serving: '200g fillet', category: 'fish' },
  { name: 'Tuna (Canned)', emoji: '🐟', calories: 102, protein: 18.9, carbs: 0, fat: 2.4, fiber: 0, sugar: 0, sodium: 300, cholesterol: 33.6, water: 58.6, vitA: 0.017, vitB12: 0.075, vitC: 0, vitD: 0.07, vitE: 0.7, vitK: 0.099, calcium: 11.2, iron: 0.8, magnesium: 26.4, potassium: 189.6, zinc: 0.4, nutritionDensity: 33.3, serving: '1 can', category: 'fish' },
  { name: 'Cod (Cooked)', emoji: '🐟', calories: 189, protein: 41.1, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, sodium: 100, cholesterol: 99, water: 136.7, vitA: 0.077, vitB12: 0.071, vitC: 1.8, vitD: 0.097, vitE: 1.5, vitK: 0.028, calcium: 25.2, iron: 0.9, magnesium: 75.6, potassium: 439.2, zinc: 1, nutritionDensity: 70.5, serving: '150g', category: 'fish' },
  { name: 'Tilapia (Cooked)', emoji: '🐟', calories: 111, protein: 22.8, carbs: 0, fat: 2.3, fiber: 0, sugar: 0, sodium: 11, cholesterol: 49.6, water: 62.3, vitA: 0, vitB12: 0.037, vitC: 0, vitD: 0.013, vitE: 0.7, vitK: 0.053, calcium: 12.2, iron: 0.6, magnesium: 29.6, potassium: 330.6, zinc: 0.4, nutritionDensity: 37.9, serving: '120g', category: 'fish' },
  { name: 'Shrimp (Cooked)', emoji: '🦐', calories: 7, protein: 1.3, carbs: 0.013, fat: 0.092, fiber: 0, sugar: 0, sodium: 12, cholesterol: 11.6, water: 3.9, vitA: 0.021, vitB12: 0.077, vitC: 0, vitD: 0.08, vitE: 0.1, vitK: 0.001, calcium: 5, iron: 0.009, magnesium: 2, potassium: 9.4, zinc: 0.008, nutritionDensity: 6.4, serving: '1 medium', category: 'fish' },
  { name: 'Sardines (Canned)', emoji: '🐟', calories: 310, protein: 36.7, carbs: 0, fat: 17.1, fiber: 0, sugar: 0, sodium: 500, cholesterol: 211.6, water: 88.8, vitA: 0.051, vitB12: 0.075, vitC: 0, vitD: 0.04, vitE: 3, vitK: 0.063, calcium: 569.2, iron: 4.4, magnesium: 58.1, potassium: 591.5, zinc: 2, nutritionDensity: 627.5, serving: '1 can', category: 'fish' },
  { name: 'Lobster (Cooked)', emoji: '🦞', calories: 134, protein: 28.5, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 700, cholesterol: 219, water: 117.2, vitA: 0.077, vitB12: 0.071, vitC: 0.2, vitD: 0, vitE: 0, vitK: 1.5, calcium: 0, iron: 2.3, magnesium: 0.4, potassium: 277.5, zinc: 0.1, nutritionDensity: 32.3, serving: '150g', category: 'fish' },
  // ── Meats ──
  { name: 'Crispy Chicken Breast', emoji: '🍗', calories: 214, protein: 38.2, carbs: 0.4, fat: 6.7, fiber: 0, sugar: 0, sodium: 700, cholesterol: 121.8, water: 92, vitA: 0.061, vitB12: 0.055, vitC: 0, vitD: 0, vitE: 0, vitK: 0, calcium: 28, iron: 0.7, magnesium: 39.2, potassium: 432.6, zinc: 1.2, nutritionDensity: 74.1, serving: '1 breast', category: 'meat' },
  { name: 'Pulled Pork BBQ', emoji: '🥩', calories: 418, protein: 32.8, carbs: 46.7, fat: 11, fiber: 3, sugar: 37.8, sodium: 1517, cholesterol: 87.2, water: 151.9, vitA: 0, vitB12: 0.067, vitC: 0.5, vitD: 0.064, vitE: 2.2, vitK: 0.099, calcium: 109.6, iron: 3.1, magnesium: 54.8, potassium: 759.5, zinc: 4.6, nutritionDensity: 206.7, serving: '1 sandwich', category: 'meat' },
  { name: 'Turkey & Gravy', emoji: '🦃', calories: 161, protein: 14.1, carbs: 11.1, fat: 6.3, fiber: 0, sugar: 0, sodium: 1300, cholesterol: 43.2, water: 204.2, vitA: 0.018, vitB12: 0.099, vitC: 0, vitD: 0, vitE: 0, vitK: 0, calcium: 33.6, iron: 2.2, magnesium: 19.2, potassium: 146.4, zinc: 1.7, nutritionDensity: 67.4, serving: '150g', category: 'meat' },
  { name: 'Corn Dog', emoji: '🌭', calories: 195, protein: 6.7, carbs: 21, fat: 9.4, fiber: 0.8, sugar: 5.9, sodium: 500, cholesterol: 34.3, water: 39.2, vitA: 0.1, vitB12: 0.014, vitC: 0.059, vitD: 0.4, vitE: 0.044, vitK: 0.5, calcium: 86, iron: 0.1, magnesium: 1.5, potassium: 174.7, zinc: 0.012, nutritionDensity: 38.3, serving: '1 piece', category: 'meat' },
  // ── Breads & Pastries ──
  { name: 'Butter Croissant', emoji: '🥐', calories: 231, protein: 4.7, carbs: 26.1, fat: 12, fiber: 1.5, sugar: 6.4, sodium: 200, cholesterol: 38.2, water: 13.2, vitA: 0.1, vitB12: 0.092, vitC: 0.1, vitD: 0, vitE: 0.5, vitK: 0.022, calcium: 21.1, iron: 1.2, magnesium: 9.1, potassium: 67.3, zinc: 0.4, nutritionDensity: 66.8, serving: '1 croissant', category: 'bread' },
  { name: 'French Toast', emoji: '🍞', calories: 178, protein: 5.2, carbs: 18, fat: 9.4, fiber: 0, sugar: 0, sodium: 340, cholesterol: 58.1, water: 34.2, vitA: 0.088, vitB12: 0.084, vitC: 0.004, vitD: 0, vitE: 0, vitK: 0, calcium: 36.5, iron: 0.9, magnesium: 8.1, potassium: 88.4, zinc: 0.3, nutritionDensity: 70.1, serving: '1 slice', category: 'bread' },
  // ── Grains & Cereals ──
  { name: 'Quinoa (Cooked)', emoji: '🌾', calories: 222, protein: 8.1, carbs: 39.4, fat: 3.6, fiber: 5.2, sugar: 1.6, sodium: 26, cholesterol: 0, water: 132.5, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 1.2, vitK: 0, calcium: 31.5, iron: 2.8, magnesium: 118.4, potassium: 318.2, zinc: 2, nutritionDensity: 90.6, serving: '1 cup', category: 'grain' },
  { name: 'Brown Rice (Cooked)', emoji: '🍚', calories: 124, protein: 2.3, carbs: 27.5, fat: 1.1, fiber: 2.3, sugar: 2.9, sodium: 86, cholesterol: 0, water: 1, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.043, vitK: 0, calcium: 9, iron: 0.4, magnesium: 28.2, potassium: 76.2, zinc: 0.5, nutritionDensity: 42.6, serving: '1 cup', category: 'grain' },
  { name: 'Oat Bran (Cooked)', emoji: '🥣', calories: 88, protein: 7, carbs: 25.1, fat: 1.9, fiber: 5.7, sugar: 0, sodium: 82, cholesterol: 0, water: 184, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, calcium: 21.9, iron: 1.9, magnesium: 87.6, potassium: 201.5, zinc: 1.2, nutritionDensity: 63.5, serving: '1 cup', category: 'grain' },
  { name: 'Buckwheat (Cooked)', emoji: '🌾', calories: 155, protein: 5.7, carbs: 33.5, fat: 1, fiber: 4.5, sugar: 1.5, sodium: 53, cholesterol: 0, water: 127.1, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.2, vitK: 0.031, calcium: 11.8, iron: 1.3, magnesium: 85.7, potassium: 147.8, zinc: 1, nutritionDensity: 57.8, serving: '1 cup', category: 'grain' },
  { name: 'Couscous (Cooked)', emoji: '🌾', calories: 176, protein: 6, carbs: 36.5, fat: 0.3, fiber: 2.2, sugar: 0.2, sodium: 54, cholesterol: 0, water: 113.9, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.2, vitK: 0.046, calcium: 12.6, iron: 0.6, magnesium: 12.6, potassium: 91.1, zinc: 0.4, nutritionDensity: 58.2, serving: '1 cup', category: 'grain' },
  // ── Baked Goods & Desserts ──
  { name: 'Cheesecake', emoji: '🍰', calories: 257, protein: 4.4, carbs: 20.4, fat: 18, fiber: 0.3, sugar: 17.4, sodium: 400, cholesterol: 44, water: 36.5, vitA: 0.1, vitB12: 0.03, vitC: 0.3, vitD: 0.078, vitE: 0.4, vitK: 0.093, calcium: 40.8, iron: 0.5, magnesium: 8.8, potassium: 72, zinc: 0.4, nutritionDensity: 84.8, serving: '1 slice', category: 'dessert' },
  { name: 'Apple Pie', emoji: '🥧', calories: 331, protein: 3, carbs: 46.4, fat: 15.6, fiber: 0, sugar: 0, sodium: 300, cholesterol: 0, water: 59.1, vitA: 0.078, vitB12: 0, vitC: 2.1, vitD: 0, vitE: 0, vitK: 0, calcium: 8.8, iron: 1.4, magnesium: 8.8, potassium: 98.8, zinc: 0.2, nutritionDensity: 77.4, serving: '1 slice', category: 'dessert' },
  { name: 'Chocolate Cake', emoji: '🍫', calories: 352, protein: 5, carbs: 50.7, fat: 14.3, fiber: 1.5, sugar: 0, sodium: 300, cholesterol: 55.1, water: 23.2, vitA: 0, vitB12: 0.027, vitC: 0.2, vitD: 0, vitE: 0, vitK: 0, calcium: 57, iron: 1.5, magnesium: 30.4, potassium: 133, zinc: 0.7, nutritionDensity: 130.2, serving: '1 slice', category: 'dessert' },
  { name: 'Dark Chocolate', emoji: '🍫', calories: 165, protein: 1.5, carbs: 18, fat: 9.7, fiber: 2.2, sugar: 13.8, sodium: 13, cholesterol: 2.1, water: 0.3, vitA: 0.074, vitB12: 0, vitC: 0.064, vitD: 0, vitE: 0, vitK: 0.2, calcium: 87, iron: 0.3, magnesium: 2.4, potassium: 64.2, zinc: 0.033, nutritionDensity: 31.8, serving: '30g', category: 'dessert' },
  { name: 'Milk Chocolate', emoji: '🍫', calories: 37, protein: 0.5, carbs: 4.2, fat: 2.1, fiber: 0.2, sugar: 3.6, sodium: 45, cholesterol: 1.6, water: 0.1, vitA: 0.049, vitB12: 0.01, vitC: 0, vitD: 0, vitE: 0.003, vitK: 0.017, calcium: 13.2, iron: 0.2, magnesium: 4.4, potassium: 26, zinc: 0.2, nutritionDensity: 20.5, serving: '1 square', category: 'dessert' },
  // ── Beverages ──
  { name: 'Beer', emoji: '🍺', calories: 142, protein: 1.5, carbs: 11.7, fat: 0, fiber: 0, sugar: 0, sodium: 67, cholesterol: 0, water: 303.5, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, calcium: 13.2, iron: 0.031, magnesium: 19.8, potassium: 89.1, zinc: 0.001, nutritionDensity: 26.4, serving: '1 pint', category: 'beverage' },
  { name: 'Red Wine', emoji: '🍷', calories: 125, protein: 0.1, carbs: 3.8, fat: 0, fiber: 0, sugar: 0.9, sodium: 27, cholesterol: 0, water: 127.1, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0.066, calcium: 11.8, iron: 0.7, magnesium: 17.6, potassium: 186.7, zinc: 0.2, nutritionDensity: 16.4, serving: '150ml glass', category: 'beverage' },
  { name: 'Coffee Liqueur', emoji: '☕', calories: 96, protein: 0.041, carbs: 13.8, fat: 0.038, fiber: 0, sugar: 13.7, sodium: 93, cholesterol: 0, water: 9.1, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, calcium: 0.3, iron: 0.02, magnesium: 0.9, potassium: 8.9, zinc: 0.097, nutritionDensity: 14.2, serving: '1 shot', category: 'beverage' },
  // ── Canned/Preserved ──
  { name: 'Baked Beans', emoji: '🫘', calories: 310, protein: 11.1, carbs: 43.3, fat: 10.3, fiber: 11, sugar: 0, sodium: 800, cholesterol: 10, water: 130.3, vitA: 0, vitB12: 0.031, vitC: 0.2, vitD: 2.2, vitE: 0, vitK: 0, calcium: 0, iron: 0.3, magnesium: 4, potassium: 218, zinc: 0.052, nutritionDensity: 76.2, serving: '1 cup', category: 'canned' },
  { name: 'Chili con Carne', emoji: '🌶️', calories: 271, protein: 14.7, carbs: 33.1, fat: 8.8, fiber: 8.3, sugar: 4.7, sodium: 1100, cholesterol: 22.8, water: 191.5, vitA: 0.4, vitB12: 0.005, vitC: 0.3, vitD: 0.5, vitE: 0, vitK: 1.3, calcium: 63, iron: 0.6, magnesium: 3.4, potassium: 220.1, zinc: 0.039, nutritionDensity: 66.2, serving: '1 cup', category: 'canned' },
  // ── Snacks ──
  { name: 'Popcorn (Air Popped)', emoji: '🍿', calories: 31, protein: 1, carbs: 6.2, fat: 0.4, fiber: 1.2, sugar: 0.086, sodium: 16, cholesterol: 0, water: 0.3, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.097, vitK: 0.071, calcium: 0.6, iron: 0.3, magnesium: 11.5, potassium: 26.3, zinc: 0.2, nutritionDensity: 9.7, serving: '1 cup', category: 'snack' },
  { name: 'Falafel', emoji: '🧆', calories: 57, protein: 2.3, carbs: 5.4, fat: 3, fiber: 0, sugar: 0, sodium: 81, cholesterol: 0, water: 5.9, vitA: 0, vitB12: 0.009, vitC: 0.01, vitD: 0.3, vitE: 0, vitK: 0, calcium: 0, iron: 0.002, magnesium: 0.6, potassium: 32.6, zinc: 0.018, nutritionDensity: 10.8, serving: '1 piece', category: 'snack' },
  // ── Sweets ──
  { name: 'Peanut Brittle', emoji: '🥜', calories: 138, protein: 2.1, carbs: 20.2, fat: 5.4, fiber: 0.7, sugar: 14.5, sodium: 100, cholesterol: 3.4, water: 0.2, vitA: 0.051, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.7, vitK: 0.06, calcium: 7.6, iron: 0.3, magnesium: 11.9, potassium: 47.5, zinc: 0.2, nutritionDensity: 36.3, serving: '30g', category: 'sweet' },
  { name: 'Caramel', emoji: '🍬', calories: 39, protein: 0.5, carbs: 7.8, fat: 0.8, fiber: 0, sugar: 6.6, sodium: 15, cholesterol: 0.7, water: 0.9, vitA: 0.021, vitB12: 0.03, vitC: 0.024, vitD: 0, vitE: 0.002, vitK: 0.014, calcium: 13.9, iron: 0.049, magnesium: 1.7, potassium: 21.6, zinc: 0.057, nutritionDensity: 23.2, serving: '1 piece', category: 'sweet' },
  // ── Flour & Baking ──
  { name: 'Whole Wheat Flour', emoji: '🌾', calories: 408, protein: 15.9, carbs: 86.4, fat: 3, fiber: 12.8, sugar: 0.5, sodium: 27, cholesterol: 0, water: 12.9, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.9, vitK: 0.025, calcium: 40.8, iron: 4.3, magnesium: 164.4, potassium: 435.6, zinc: 3.1, nutritionDensity: 163.2, serving: '1 cup', category: 'baking' },
  { name: 'Chickpea Flour', emoji: '🫘', calories: 356, protein: 20.6, carbs: 53.2, fat: 6.2, fiber: 9.9, sugar: 10, sodium: 50, cholesterol: 0, water: 9.5, vitA: 0, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.8, vitK: 0.003, calcium: 41.4, iron: 4.5, magnesium: 152.7, potassium: 778.3, zinc: 2.6, nutritionDensity: 135.8, serving: '1 cup', category: 'baking' },
  // ── Composite / Casseroles ──
  { name: 'Chicken Pot Pie', emoji: '🥧', calories: 598, protein: 14.6, carbs: 57.3, fat: 34.6, fiber: 3, sugar: 7.2, sodium: 1200, cholesterol: 51.3, water: 191.6, vitA: 0, vitB12: 0.024, vitC: 3, vitD: 0.024, vitE: 1.1, vitK: 0.034, calcium: 63.4, iron: 1.8, magnesium: 33.2, potassium: 317.1, zinc: 1.3, nutritionDensity: 177.7, serving: '1 pie', category: 'dish' },
  { name: 'Baked Potato with Cheese', emoji: '🥔', calories: 474, protein: 14.6, carbs: 46.5, fat: 28.7, fiber: 0, sugar: 0, sodium: 400, cholesterol: 17.8, water: 194.6, vitA: 0.3, vitB12: 0.01, vitC: 26, vitD: 0, vitE: 0, vitK: 0, calcium: 310.8, iron: 3, magnesium: 65.1, potassium: 1166.2, zinc: 1.9, nutritionDensity: 429.9, serving: '1 potato', category: 'dish' },
  { name: 'Enchilada with Cheese & Beef', emoji: '🌯', calories: 323, protein: 11.9, carbs: 30.5, fat: 17.6, fiber: 0, sugar: 0, sodium: 1300, cholesterol: 40.3, water: 128.4, vitA: 0.016, vitB12: 0.036, vitC: 1.3, vitD: 0, vitE: 0, vitK: 0, calcium: 228.5, iron: 3.1, magnesium: 82.6, potassium: 574.1, zinc: 2.7, nutritionDensity: 292.9, serving: '1 piece', category: 'dish' },
  // ── Breakfast Items ──
  { name: 'Pancakes with Butter & Syrup', emoji: '🥞', calories: 260, protein: 4.1, carbs: 45.4, fat: 7, fiber: 0, sugar: 0, sodium: 600, cholesterol: 29, water: 57.7, vitA: 0.015, vitB12: 0.046, vitC: 1.7, vitD: 0, vitE: 0.7, vitK: 0, calcium: 63.8, iron: 1.3, magnesium: 24.4, potassium: 125.3, zinc: 0.5, nutritionDensity: 123.3, serving: '3 pancakes', category: 'breakfast' },
  { name: 'Egg McMuffin', emoji: '🍳', calories: 287, protein: 17.2, carbs: 27.3, fat: 12.2, fiber: 1.4, sugar: 2.7, sodium: 800, cholesterol: 207.9, water: 66.3, vitA: 0.1, vitB12: 0.038, vitC: 0.2, vitD: 1.5, vitE: 0, vitK: 0.7, calcium: 0, iron: 0.1, magnesium: 2.9, potassium: 252, zinc: 0, nutritionDensity: 58.5, serving: '1 sandwich', category: 'breakfast' },
  { name: 'Buttermilk Pancakes', emoji: '🥞', calories: 86, protein: 2.6, carbs: 10.9, fat: 3.5, fiber: 0, sugar: 0, sodium: 200, cholesterol: 22, water: 20, vitA: 0.094, vitB12: 0.089, vitC: 0.2, vitD: 0, vitE: 0, vitK: 0, calcium: 59.7, iron: 0.6, magnesium: 5.7, potassium: 55.1, zinc: 0.2, nutritionDensity: 77.6, serving: '1 pancake', category: 'breakfast' },
];

// ===== SCAN FOOD SECTION =====
let cameraStream: MediaStream | null = null;

function initScan() {
  const cameraOption = document.getElementById('cameraOption');
  const uploadOption = document.getElementById('uploadOption');
  const captureBtn = document.getElementById('captureBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const dropzone = document.getElementById('uploadDropzone');

  cameraOption?.addEventListener('click', () => {
    cameraOption.classList.add('active');
    uploadOption?.classList.remove('active');
    showCameraMode();
  });

  uploadOption?.addEventListener('click', () => {
    uploadOption.classList.add('active');
    cameraOption?.classList.remove('active');
    showUploadMode();
  });

  captureBtn?.addEventListener('click', capturePhoto);
  analyzeBtn?.addEventListener('click', analyzeFood);
  retakeBtn?.addEventListener('click', retakeScan);

  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFileUpload(file);
  });

  // Drag and drop
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = (e as DragEvent).dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileUpload(file);
  });
}

function showCameraMode() {
  const cameraContainer = document.getElementById('cameraContainer');
  const uploadContainer = document.getElementById('uploadContainer');
  const previewContainer = document.getElementById('previewContainer');
  const loadingEl = document.getElementById('scanLoading');
  if (cameraContainer) cameraContainer.style.display = 'block';
  if (uploadContainer) uploadContainer.style.display = 'none';
  if (previewContainer) previewContainer.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'none';
  startCamera();
}

function showUploadMode() {
  const cameraContainer = document.getElementById('cameraContainer');
  const uploadContainer = document.getElementById('uploadContainer');
  const previewContainer = document.getElementById('previewContainer');
  const loadingEl = document.getElementById('scanLoading');
  if (cameraContainer) cameraContainer.style.display = 'none';
  if (uploadContainer) uploadContainer.style.display = 'flex';
  if (previewContainer) previewContainer.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'none';
  stopCamera();
}

async function startCamera() {
  const video = document.getElementById('cameraPreview') as HTMLVideoElement;
  if (!video) return;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    video.srcObject = cameraStream;
  } catch {
    // Fallback: show upload mode if camera not available
    const cameraContainer = document.getElementById('cameraContainer');
    if (cameraContainer) {
      cameraContainer.innerHTML = `
        <div class="camera-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          <p>Camera not available</p>
          <span>Try the Upload option instead, or enable camera permissions in your browser settings.</span>
        </div>
      `;
    }
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}

function capturePhoto() {
  const video = document.getElementById('cameraPreview') as HTMLVideoElement;
  const canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
  const preview = document.getElementById('previewImage') as HTMLImageElement;
  if (!video || !canvas || !preview) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  preview.src = canvas.toDataURL('image/jpeg', 0.9);

  stopCamera();
  const cameraContainer = document.getElementById('cameraContainer');
  const previewContainer = document.getElementById('previewContainer');
  if (cameraContainer) cameraContainer.style.display = 'none';
  if (previewContainer) previewContainer.style.display = 'flex';
}

function handleFileUpload(file: File) {
  const preview = document.getElementById('previewImage') as HTMLImageElement;
  const uploadContainer = document.getElementById('uploadContainer');
  const previewContainer = document.getElementById('previewContainer');
  if (!preview) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target?.result as string;
    if (uploadContainer) uploadContainer.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function analyzeFood() {
  const previewContainer = document.getElementById('previewContainer');
  const loadingEl = document.getElementById('scanLoading');
  const resultsPanel = document.getElementById('scanResultsPanel');

  if (previewContainer) previewContainer.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'flex';

  // Get weight input
  const weightInput = document.getElementById('foodWeightInput') as HTMLInputElement;
  const userWeight = weightInput ? parseFloat(weightInput.value) || 100 : 100;

  // Heuristic: analyze dominant colors from the preview image
  const previewImg = document.getElementById('previewImage') as HTMLImageElement;
  let matchedFood: NutritionEntry | null = null;
  let confidence = 88;

  if (previewImg && previewImg.src) {
    try {
      // Sample dominant color from the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx && previewImg.naturalWidth) {
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(previewImg, 0, 0, 50, 50);
        const imgData = ctx.getImageData(0, 0, 50, 50).data;

        // Calculate average color
        let rTotal = 0, gTotal = 0, bTotal = 0;
        const pixels = imgData.length / 4;
        for (let i = 0; i < imgData.length; i += 4) {
          rTotal += imgData[i];
          gTotal += imgData[i + 1];
          bTotal += imgData[i + 2];
        }
        const avgR = rTotal / pixels;
        const avgG = gTotal / pixels;
        const avgB = bTotal / pixels;

        // Color-based category scoring
        const categoryScores: Record<string, number> = {};
        // Warm colors (red/orange/brown) → meat, fast food, bread
        if (avgR > 140 && avgG < 120) {
          categoryScores['meat'] = 5; categoryScores['fast_food'] = 4; categoryScores['dish'] = 3;
        }
        // Yellow/golden → cheese, bread, eggs, dessert
        if (avgR > 150 && avgG > 120 && avgB < 100) {
          categoryScores['dairy'] = 5; categoryScores['bread'] = 4; categoryScores['eggs'] = 3; categoryScores['dessert'] = 3;
        }
        // Green → produce-heavy dishes
        if (avgG > avgR && avgG > avgB) {
          categoryScores['dish'] = 4; categoryScores['grain'] = 3; categoryScores['snack'] = 2;
        }
        // Brown/dark → meat, chocolate, grains
        if (avgR < 100 && avgG < 100 && avgB < 80) {
          categoryScores['meat'] = 4; categoryScores['dessert'] = 3; categoryScores['grain'] = 3; categoryScores['beverage'] = 2;
        }
        // Beige/white → dairy, bread, grain, fish
        if (avgR > 180 && avgG > 170 && avgB > 150) {
          categoryScores['dairy'] = 4; categoryScores['bread'] = 3; categoryScores['fish'] = 3; categoryScores['grain'] = 3;
        }
        // Orange → condiment, dish
        if (avgR > 180 && avgG > 100 && avgG < 160 && avgB < 80) {
          categoryScores['condiment'] = 4; categoryScores['dish'] = 4; categoryScores['soup'] = 3;
        }

        // Find best category and pick from it
        const sortedCats = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
        if (sortedCats.length > 0) {
          const topCat = sortedCats[0][0];
          const catFoods = FOOD_DB.filter(f => f.category === topCat);
          if (catFoods.length > 0) {
            matchedFood = catFoods[Math.floor(Math.random() * catFoods.length)];
            confidence = 82 + Math.floor(Math.random() * 12);
          }
        }
      }
    } catch { /* fallback below */ }

    // Try filename-based matching (for uploaded files)
    if (!matchedFood && previewImg.src.includes('data:')) {
      // Check the file input for name clues
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        const filename = fileInput.files[0].name.toLowerCase().replace(/[_\-\.]/g, ' ');
        const nameMatch = FOOD_DB.find(f => filename.includes(f.name.toLowerCase().split(' ')[0].toLowerCase()));
        if (nameMatch) {
          matchedFood = nameMatch;
          confidence = 90 + Math.floor(Math.random() * 8);
        }
      }
    }
  }

  // Fallback: weighted random by common categories
  if (!matchedFood) {
    const commonCats = ['dish', 'meat', 'fast_food', 'dairy', 'fish', 'eggs', 'grain'];
    const catFoods = FOOD_DB.filter(f => commonCats.includes(f.category));
    matchedFood = catFoods[Math.floor(Math.random() * catFoods.length)] || FOOD_DB[0];
    confidence = 75 + Math.floor(Math.random() * 15);
  }

  const food = matchedFood!;

  // Calculate serving weight from the default serving string
  const servingWeightMap: Record<string, number> = {
    'dairy': 30, 'eggs': 60, 'condiment': 30, 'dish': 250, 'soup': 300,
    'fast_food': 150, 'fish': 150, 'meat': 150, 'bread': 60, 'grain': 185,
    'dessert': 100, 'beverage': 350, 'canned': 250, 'snack': 30, 'sweet': 30,
    'baking': 120, 'breakfast': 120
  };
  const defaultWeight = servingWeightMap[food.category] || 100;
  const scale = userWeight / defaultWeight;

  // Scale nutrition values
  const scaled = {
    calories: Math.round(food.calories * scale),
    protein: +(food.protein * scale).toFixed(1),
    carbs: +(food.carbs * scale).toFixed(1),
    fat: +(food.fat * scale).toFixed(1),
    fiber: +(food.fiber * scale).toFixed(1),
    sugar: +(food.sugar * scale).toFixed(1),
    sodium: Math.round(food.sodium * scale),
    potassium: +(food.potassium * scale).toFixed(1),
    calcium: +(food.calcium * scale).toFixed(1),
    iron: +(food.iron * scale).toFixed(2),
    vitC: +(food.vitC * scale).toFixed(1),
    zinc: +(food.zinc * scale).toFixed(2),
    nutritionDensity: +(food.nutritionDensity * scale).toFixed(0),
  };

  // Simulate AI analysis with delay
  setTimeout(() => {
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsPanel) resultsPanel.style.display = 'flex';

    // Update food name
    const nameEl = document.getElementById('scanFoodName');
    if (nameEl) nameEl.textContent = `${food.emoji} ${food.name}`;

    // Confidence bar
    const fillEl = document.getElementById('confidenceFill') as HTMLElement;
    const pctEl = document.getElementById('confidencePct');
    if (fillEl) fillEl.style.width = confidence + '%';
    if (pctEl) pctEl.textContent = confidence + '%';

    // Macros (scaled)
    const calEl = document.getElementById('scanCal');
    const protEl = document.getElementById('scanProt');
    const carbEl = document.getElementById('scanCarb');
    const fatEl = document.getElementById('scanFat');
    if (calEl) animateCount(calEl, scaled.calories, 800);
    if (protEl) { animateCount(protEl, Math.round(scaled.protein), 800); setTimeout(() => { protEl.textContent = scaled.protein + 'g'; }, 850); }
    if (carbEl) { animateCount(carbEl, Math.round(scaled.carbs), 800); setTimeout(() => { carbEl.textContent = scaled.carbs + 'g'; }, 850); }
    if (fatEl) { animateCount(fatEl, Math.round(scaled.fat), 800); setTimeout(() => { fatEl.textContent = scaled.fat + 'g'; }, 850); }

    // Detailed nutrients (scaled)
    const detailEl = document.getElementById('scanNutrientsDetail');
    if (detailEl) {
      detailEl.innerHTML = [
        { label: 'Fiber', value: scaled.fiber + 'g', pct: Math.round((scaled.fiber / 25) * 100) },
        { label: 'Sugar', value: scaled.sugar + 'g', pct: Math.round((scaled.sugar / 50) * 100) },
        { label: 'Sodium', value: scaled.sodium + 'mg', pct: Math.round((scaled.sodium / 2300) * 100) },
        { label: 'Potassium', value: scaled.potassium + 'mg', pct: Math.round((+scaled.potassium / 3500) * 100) },
        { label: 'Calcium', value: scaled.calcium + 'mg', pct: Math.round((+scaled.calcium / 1000) * 100) },
        { label: 'Iron', value: scaled.iron + 'mg', pct: Math.round((+scaled.iron / 18) * 100) },
        { label: 'Vitamin C', value: scaled.vitC + 'mg', pct: Math.round((+scaled.vitC / 90) * 100) },
        { label: 'Zinc', value: scaled.zinc + 'mg', pct: Math.round((+scaled.zinc / 11) * 100) },
        { label: 'Nutrient Score', value: scaled.nutritionDensity, pct: Math.min((+scaled.nutritionDensity / 200) * 100, 100) },
      ].map(n => `
        <div class="scan-nutrient-row">
          <span class="sn-label">${n.label}</span>
          <div class="sn-bar"><div class="sn-fill" style="width:${Math.min(n.pct, 100)}%"></div></div>
          <span class="sn-value">${n.value}</span>
        </div>
      `).join('');
    }

    // Recommendation
    const recEl = document.getElementById('scanRecText');
    if (recEl) recEl.textContent = generateRecommendation(food);

    // Serving size badge — show weight-adjusted info
    const servingBadge = document.querySelector('#scanResultsPanel .chart-badge:not(.ai-badge)');
    if (servingBadge) {
      if (Math.abs(scale - 1) > 0.05) {
        servingBadge.textContent = `Adjusted for ${userWeight}g (default: ${food.serving})`;
        servingBadge.classList.add('weight-adjusted');
      } else {
        servingBadge.textContent = food.serving;
        servingBadge.classList.remove('weight-adjusted');
      }
    }

    // Connected device data
    updateScanDeviceData();

    // Animation
    resultsPanel?.querySelectorAll('.glass-card').forEach((card, i) => {
      (card as HTMLElement).style.animation = 'none';
      (card as HTMLElement).offsetHeight;
      (card as HTMLElement).style.animation = `fadeInUp 0.4s ease ${i * 0.1}s forwards`;
      (card as HTMLElement).style.opacity = '0';
    });

  }, 2000);
}

function updateScanDeviceData() {
  const metricsEl = document.getElementById('scanDeviceMetrics');
  const statusEl = document.getElementById('scanDeviceStatus');
  const connectedDevices = DEVICES_DATA.filter(d => d.connected);

  if (!metricsEl || !statusEl) return;

  if (connectedDevices.length > 0) {
    statusEl.textContent = `${connectedDevices.length} sources connected`;
    statusEl.className = 'chart-badge ai-badge';
    const w = HEALTH_DATA;
    metricsEl.innerHTML = `
      <div class="scan-device-grid">
        <div class="sd-metric">
          <span class="sd-icon">❤️</span>
          <div class="sd-info">
            <span class="sd-val">${w.heartRate.current} BPM</span>
            <span class="sd-label">Heart Rate</span>
          </div>
        </div>
        <div class="sd-metric">
          <span class="sd-icon">🔥</span>
          <div class="sd-info">
            <span class="sd-val">${w.calories.burned.toLocaleString()} kcal</span>
            <span class="sd-label">Burned Today</span>
          </div>
        </div>
        <div class="sd-metric">
          <span class="sd-icon">👟</span>
          <div class="sd-info">
            <span class="sd-val">${w.steps.today.toLocaleString()}</span>
            <span class="sd-label">Steps</span>
          </div>
        </div>
        <div class="sd-metric">
          <span class="sd-icon">🍎</span>
          <div class="sd-info">
            <span class="sd-val">${w.nutrition.protein}g P · ${w.nutrition.carbs}g C</span>
            <span class="sd-label">Eaten Today</span>
          </div>
        </div>
        <div class="sd-metric">
          <span class="sd-icon">😴</span>
          <div class="sd-info">
            <span class="sd-val">${w.sleep.score}/100</span>
            <span class="sd-label">Sleep Score</span>
          </div>
        </div>
        <div class="sd-metric">
          <span class="sd-icon">🏃</span>
          <div class="sd-info">
            <span class="sd-val">${w.lastWorkout.type}</span>
            <span class="sd-label">${w.lastWorkout.distance} · ${w.lastWorkout.calories} kcal</span>
          </div>
        </div>
      </div>
      <div class="sd-devices">
        ${connectedDevices.map(d => `
          <div class="sd-device-row">
            <span>${d.icon} ${d.name}</span>
            <span class="sd-sync">Synced ${d.lastSync}</span>
          </div>
        `).join('')}
      </div>
      <p class="sd-summary">Data from <strong>${connectedDevices.length} sources</strong>: You've burned <strong>${w.calories.burned.toLocaleString()} kcal</strong>, walked <strong>${w.steps.today.toLocaleString()} steps</strong>, and consumed <strong>${w.calories.consumed} kcal</strong> (${w.nutrition.protein}g protein). With <strong>${w.remainingCalories} kcal remaining</strong> and a ${w.sleepQuality.toLowerCase()} night's sleep, this meal complements your activity perfectly.</p>
    `;
  } else {
    statusEl.textContent = 'No device';
    statusEl.className = 'chart-badge';
    metricsEl.innerHTML = '<p class="no-device-msg">Connect a wearable device to see how this meal fits your daily activity and health metrics.</p>';
  }
}

function retakeScan() {
  const resultsPanel = document.getElementById('scanResultsPanel');
  const previewContainer = document.getElementById('previewContainer');
  const loadingEl = document.getElementById('scanLoading');
  if (resultsPanel) resultsPanel.style.display = 'none';
  if (previewContainer) previewContainer.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'none';

  const cameraOption = document.getElementById('cameraOption');
  if (cameraOption?.classList.contains('active')) {
    showCameraMode();
  } else {
    showUploadMode();
  }
}

window.startCamera = startCamera;
window.capturePhoto = capturePhoto;
window.analyzeFood = analyzeFood;
window.retakeScan = retakeScan;

// ===== SESSION TIMEOUT (SECURITY) =====
let sessionTimer: ReturnType<typeof setTimeout>;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function initSessionTimeout() {
  resetSessionTimer();
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetSessionTimer, { passive: true });
  });
}

function resetSessionTimer() {
  clearTimeout(sessionTimer);
  // Remove lock screen if present
  const lock = document.getElementById('sessionLock');
  if (lock) lock.remove();

  sessionTimer = setTimeout(() => {
    showSessionLock();
  }, SESSION_TIMEOUT_MS);
}

function showSessionLock() {
  if (document.getElementById('sessionLock')) return;
  const overlay = document.createElement('div');
  overlay.id = 'sessionLock';
  overlay.className = 'session-lock-overlay';
  overlay.innerHTML = `
    <div class="session-lock-card">
      <div class="session-lock-icon">🔒</div>
      <h2>Session Timed Out</h2>
      <p>Your session has been locked for security. Click below to continue.</p>
      <button class="btn-primary" onclick="document.getElementById('sessionLock')?.remove()">Resume Session</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ===== PRELOADER =====
function initPreloader() {
  const bar = document.getElementById('preloaderBar');
  const pct = document.getElementById('preloaderPct');
  const ring = document.querySelector('.preloader-ring') as SVGCircleElement;
  const preloader = document.getElementById('preloader');
  const tipEl = document.getElementById('preloaderTip');
  const statusEl = document.getElementById('preloaderStatus');
  if (!bar || !pct || !preloader) return;

  const tips = [
    "Did you know? Avocados contain 20+ vitamins and minerals.",
    "Hydration tip: Drink water before meals to support digestion.",
    "Protein helps repair and build muscle after exercise.",
    "Fiber-rich foods keep you full longer and support gut health.",
    "A colorful plate means a wider variety of nutrients."
  ];
  const statuses = [
    "Initializing AI engine...",
    "Loading nutrition database...",
    "Syncing wearable health data...",
    "Calibrating metabolic models...",
    "Ready for analysis."
  ];

  let progress = 0;
  const totalDuration = 3500;
  const startTime = performance.now();

  let lastTipTime = 0;
  let tipIndex = 0;

  function updateProgress(now: number) {
    const elapsed = now - startTime;
    // Ease-out cubic
    const t = Math.min(elapsed / totalDuration, 1);
    progress = Math.round(t * t * (3 - 2 * t) * 100);
    if (bar) bar.style.width = progress + '%';
    if (pct) pct.textContent = progress + '%';
    if (ring) {
      ring.setAttribute('stroke-dashoffset', String(351 - (progress / 100) * 351));
    }

    if (elapsed - lastTipTime > 700 && t < 0.95) {
      if (tipEl) tipEl.textContent = tips[tipIndex % tips.length];
      if (statusEl) statusEl.textContent = statuses[tipIndex % statuses.length];
      tipIndex++;
      lastTipTime = elapsed;
    }

    if (t >= 0.95 && statusEl) {
      statusEl.textContent = statuses[statuses.length - 1];
    }

    if (t < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('fade-out');
          setTimeout(() => {
            if (preloader) preloader.style.display = 'none';
          }, 500);
        }
      }, 300);
    }
  }
  requestAnimationFrame(updateProgress);
}

// ===== BLOG SECTION =====
interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  avatar: string;
  date: Date;
  likes: number;
  liked: boolean;
  comments: Array<{ author: string; text: string; time: Date }>;
  image?: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1, title: 'My 90-Day Body Transformation Journey', content: 'Three months ago I committed to changing my lifestyle completely. I started tracking my macros with NutriJJ, pairing it with my Fitbit data to optimize every meal. The results? I lost 12kg of fat while gaining lean muscle. The key was consistency and letting the AI guide my nutrition based on my daily activity levels. Here\'s what worked for me...', category: 'transformation', author: 'Sarah K.', avatar: 'SK', date: new Date('2026-02-20'), likes: 47, liked: false,
    comments: [{ author: 'Mike R.', text: 'This is so inspiring! I just started my own journey last week.', time: new Date('2026-02-21') }, { author: 'Priya M.', text: 'Love the dedication! What was your protein target?', time: new Date('2026-02-22') }]
  },
  {
    id: 2, title: 'High-Protein Overnight Oats — My Go-To Breakfast', content: 'After scanning my breakfast options with NutriJJ, I found that my usual toast was seriously lacking in protein. So I developed this overnight oats recipe that packs 35g of protein:\n\n• 1 cup oats\n• 1 scoop whey protein\n• 1 cup Greek yogurt\n• 1 tbsp chia seeds\n• Mixed berries\n\nJust mix everything the night before and wake up to a perfect macro-balanced breakfast!', category: 'recipe', author: 'Jeremy J.', avatar: 'JJ', date: new Date('2026-02-22'), likes: 32, liked: false,
    comments: [{ author: 'Ana L.', text: 'Made this today! Absolutely delicious and so filling.', time: new Date('2026-02-23') }]
  },
  {
    id: 3, title: 'Why Sleep Tracking Changed My Diet', content: 'I noticed my NutriJJ insights kept highlighting a correlation between my dinner choices and sleep quality. After 3 weeks of experimenting, I discovered that eating magnesium-rich foods before bed improved my deep sleep by 22%! Foods like spinach, pumpkin seeds, and dark chocolate became my evening staples. The connected Fitbit data made the patterns crystal clear.', category: 'tips', author: 'David W.', avatar: 'DW', date: new Date('2026-02-18'), likes: 58, liked: false,
    comments: [{ author: 'Lisa T.', text: 'The magnesium tip is gold! My sleep score went up 15 points.', time: new Date('2026-02-19') }, { author: 'Chris B.', text: 'Which dark chocolate brand do you recommend?', time: new Date('2026-02-20') }, { author: 'David W.', text: '@Chris B. Anything 70%+ cocoa works great!', time: new Date('2026-02-21') }]
  },
  {
    id: 4, title: 'Honest Review: Is NutriJJ Worth It?', content: 'After using NutriJJ for 6 months, here\'s my brutally honest take. The AI meal recommendations are incredibly accurate — especially when synced with wearable data. The photo scan feature saves me SO much time logging meals. The only thing I wish it had is a social feature to share meals with friends (hint hint dev team! 😄). Overall: 9/10, genuinely changed how I approach nutrition.', category: 'review', author: 'Emma R.', avatar: 'ER', date: new Date('2026-02-23'), likes: 73, liked: false,
    comments: [{ author: 'James P.', text: 'Agreed on the social feature! Would love to share meal plans with my gym buddy.', time: new Date('2026-02-24') }]
  },
  {
    id: 5, title: 'Meal Prep Sunday: 5 Meals in 2 Hours', content: 'Every Sunday I bulk-prep my weekday lunches. This week\'s lineup (all NutriJJ optimized for my goals):\n\n1. Chicken teriyaki bowls (520 kcal, 38g protein)\n2. Mediterranean quinoa jars (440 kcal, 22g protein)\n3. Turkey meatball wraps (480 kcal, 35g protein)\n4. Salmon poke bowls (510 kcal, 32g protein)\n5. Veggie stir-fry with tofu (390 kcal, 24g protein)\n\nTotal cost: $45 for the whole week!', category: 'recipe', author: 'Alex T.', avatar: 'AT', date: new Date('2026-02-24'), likes: 41, liked: false,
    comments: []
  },
  {
    id: 6, title: 'From Couch to 10K — How Nutrition Made the Difference', content: 'I always thought running was about just running more. But when I started tracking my fuel with NutriJJ, everything changed. Carb-loading before long runs, protein within 30 min post-run, and staying hydrated — the water tracker is a lifesaver. My 10K time dropped from 65 min to 52 min in just 8 weeks. The AI timing suggestions for meals were the game-changer.', category: 'fitness', author: 'Nina S.', avatar: 'NS', date: new Date('2026-02-16'), likes: 89, liked: false,
    comments: [{ author: 'Tom K.', text: 'What was your pre-run meal? I always feel sluggish.', time: new Date('2026-02-17') }, { author: 'Nina S.', text: '@Tom K. A banana + peanut butter toast 90 min before!', time: new Date('2026-02-17') }]
  },
];

let currentBlogFilter = 'all';

// @ts-ignore
function initBlog() {
  renderBlogPosts();

  // New post button
  document.getElementById('newPostBtn')?.addEventListener('click', () => {
    const card = document.getElementById('blogCreateCard');
    if (card) card.style.display = card.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('closePostCard')?.addEventListener('click', () => {
    const card = document.getElementById('blogCreateCard');
    if (card) card.style.display = 'none';
  });

  // Publish
  document.getElementById('publishPostBtn')?.addEventListener('click', publishBlogPost);

  // Filter tabs
  document.querySelectorAll('.blog-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.blog-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentBlogFilter = (tab as HTMLElement).dataset.cat || 'all';
      renderBlogPosts();
    });
  });
}

function publishBlogPost() {
  const titleInput = document.getElementById('blogTitleInput') as HTMLInputElement;
  const contentInput = document.getElementById('blogContentInput') as HTMLTextAreaElement;
  const catSelect = document.getElementById('blogCategorySelect') as HTMLSelectElement;

  const title = sanitizeInput(titleInput?.value?.trim() || '');
  const content = sanitizeInput(contentInput?.value?.trim() || '');
  if (!title || !content) return;

  BLOG_POSTS.unshift({
    id: Date.now(),
    title,
    content,
    category: catSelect?.value || 'tips',
    author: 'Jeremy J.',
    avatar: 'JJ',
    date: new Date(),
    likes: 0,
    liked: false,
    comments: []
  });

  titleInput.value = '';
  contentInput.value = '';
  const card = document.getElementById('blogCreateCard');
  if (card) card.style.display = 'none';
  renderBlogPosts();
}

function renderBlogPosts() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const filtered = currentBlogFilter === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === currentBlogFilter);

  const catEmojis: Record<string, string> = { recipe: '🍳', fitness: '💪', review: '⭐', tips: '💡', transformation: '🔄' };

  grid.innerHTML = filtered.map(post => `
    <article class="blog-post glass-card animate-in" data-id="${post.id}">
      <div class="blog-post-header">
        <div class="blog-author">
          <div class="blog-avatar">${post.avatar}</div>
          <div>
            <span class="blog-author-name">${post.author}</span>
            <span class="blog-date">${timeAgo(post.date)}</span>
          </div>
        </div>
        <span class="blog-category-badge ${post.category}">${catEmojis[post.category] || ''} ${post.category}</span>
      </div>
      <h3 class="blog-post-title">${post.title}</h3>
      <p class="blog-post-content">${post.content.replace(/\n/g, '<br>')}</p>
      <div class="blog-post-actions">
        <button class="blog-action-btn ${post.liked ? 'liked' : ''}" onclick="window.likeBlogPost(${post.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          ${post.likes}
        </button>
        <button class="blog-action-btn" onclick="window.toggleComments(${post.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          ${post.comments.length}
        </button>
      </div>
      <div class="blog-comments-section" id="comments-${post.id}" style="display:none">
        <div class="blog-comments-list">
          ${post.comments.map(c => `
            <div class="blog-comment">
              <strong>${c.author}</strong>
              <span>${c.text}</span>
              <span class="blog-comment-time">${timeAgo(c.time)}</span>
            </div>
          `).join('')}
        </div>
        <div class="blog-comment-input-row">
          <input type="text" placeholder="Write a comment..." id="commentInput-${post.id}">
          <button class="btn-primary btn-comment" onclick="window.addComment(${post.id})">Post</button>
        </div>
      </div>
    </article>
  `).join('');
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

window.likeBlogPost = function (id: number) {
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  renderBlogPosts();
};

window.toggleComments = function (id: number) {
  const section = document.getElementById(`comments-${id}`);
  if (section) section.style.display = section.style.display === 'none' ? 'block' : 'none';
};

window.addComment = function (id: number) {
  const input = document.getElementById(`commentInput-${id}`) as HTMLInputElement;
  const text = sanitizeInput(input?.value?.trim() || '');
  if (!text) return;
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;
  post.comments.push({ author: 'Jeremy J.', text, time: new Date() });
  input.value = '';
  renderBlogPosts();
  // Re-open the comments section
  const section = document.getElementById(`comments-${id}`);
  if (section) section.style.display = 'block';
};

// ===== PARTY SYSTEM API =====

async function syncMetricsWithBackend() {
  const today = new Date().toISOString().split('T')[0];
  const metrics = {
    user_id: CURRENT_USER_ID,
    steps: HEALTH_DATA.steps.today,
    calories: HEALTH_DATA.calories.burned,
    sleep_score: HEALTH_DATA.sleepQuality === 'Excellent' ? 95 : (HEALTH_DATA.sleepQuality === 'Good' ? 80 : 60),
    date: today
  };

  try {
    await fetch(`${API_BASE}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  } catch (err) {
    console.error('Failed to sync metrics:', err);
  }
}

async function createParty(name: string) {
  try {
    const res = await fetch(`${API_BASE}/parties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: CURRENT_USER_ID, party_name: name })
    });
    const data = await res.json();
    currentParty = data;
    renderPartyDashboard();
    startPartyPolling();
    return data;
  } catch (err) {
    console.error('Failed to create party:', err);
  }
}

async function joinParty(code: string) {
  try {
    const res = await fetch(`${API_BASE}/parties/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: CURRENT_USER_ID, party_code: code.toUpperCase() })
    });
    if (!res.ok) throw new Error('Party not found');
    const data = await res.json();
    currentParty = data;
    renderPartyDashboard();
    startPartyPolling();
    return data;
  } catch (err) {
    console.error('Failed to join party:', err);
    throw err;
  }
}

async function fetchPartyUpdate() {
  if (!currentParty) return;
  try {
    const res = await fetch(`${API_BASE}/parties/${currentParty.code}`);
    const data = await res.json();
    currentParty = data;
    updateLeaderboardUI();
  } catch (err) {
    console.error('Failed to fetch party update:', err);
  }
}

function startPartyPolling() {
  if (partyPollingInterval) clearInterval(partyPollingInterval);
  partyPollingInterval = setInterval(fetchPartyUpdate, 5000); // Poll every 5s
}

// ===== METABOLIC ARENA (TRANSFORMED TO PARTY SYSTEM) =====
const ARENA_DATA = {
  dms: 88,
  level: 52,
  levelTitle: 'Macro Master',
  xpCurrent: 45500,
  xpNext: 48200,
  tier: 'Platinum',
  streak: 8,
  breakdown: { protein: 95, calories: 85, sleep: 92, hydration: 100, activity: 68 },
  aiCommentaries: [
    "💪 Outstanding! Your protein and hydration were perfectly locked in today, scoring an 88 DMS. One more strong sleep session and you'll hit the Diamond tier threshold. Keep leading your Consistency Clash — you're 15 points ahead!",
    "🔥 8-day streak is no accident — that's pure discipline. Your activity score is the only thing holding you back from 90+. A 20-minute evening walk could push you into Diamond tomorrow.",
    "🚀 Elite performance today, Jeremy. Calories were aligned, sleep was recovery-grade. Your rival in the Sleep Challenge is 5 points ahead — prioritize a 10:30 PM bedtime tonight to close the gap!",
    "⚡ You're dominating the Platinum leaderboard at #1. The gap to Diamond is just 2 DMS points. Focus on your activity score today — everything else is already elite-level.",
  ],
};

function getTierConfig(tier: string) {
  const tiers: Record<string, { icon: string; class: string }> = {
    Neon: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>', class: 'neon' },
    Crystal: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 18H4l8-18z"></path></svg>', class: 'crystal' },
    Dynamite: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2h2v4h-2zM4.93 4.93l1.41 1.41-1.41 1.41-1.41-1.41zM2 11h4v2H2zM19 11h4v2h-4zM17.65 17.65l1.41-1.41 1.41 1.41-1.41 1.41zM11 19h2v4h-2zM6.35 19.07l-1.41-1.41-1.41 1.41 1.41 1.41zM12 7a5 5 0 100 10 5 5 0 000-10z"></path></svg>', class: 'dynamite' },
    Uranium: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><circle cx="12" cy="12" r="3"></circle></svg>', class: 'uranium' },
    Plutonium: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" transform="rotate(45 12 12)"></rect><circle cx="12" cy="12" r="4"></circle></svg>', class: 'plutonium' },
    Amethyst: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"></path><path d="M12 21V9"></path><path d="M2 9h20"></path><path d="M6 3l6 6 6-6"></path></svg>', class: 'amethyst' },
    Jeremite: { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="jeremiteGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0080" /><stop offset="50%" stop-color="#7928ca" /><stop offset="100%" stop-color="#00dfd8" /></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="url(#jeremiteGrad)"></polygon><circle cx="12" cy="12" r="2" fill="url(#jeremiteGrad)"></circle></svg>', class: 'jeremite' },
  };
  return tiers[tier] || tiers['Neon'];
}

// @ts-ignore
function initArena() {
  const arenaPage = document.getElementById('page-arena');
  if (!arenaPage) return;

  // Animate when user lands on the Arena page via router
  const observeArena = new MutationObserver(() => {
    if (arenaPage.classList.contains('active')) {
      animateArena();
    }
  });
  observeArena.observe(arenaPage, { attributes: true, attributeFilter: ['class'] });
}

function animateArena() {
  const data = ARENA_DATA;

  // Animate DMS ring
  const ring = document.getElementById('dmsRingFill') as SVGElement | null;
  const scoreEl = document.getElementById('dmsBigScore');
  if (ring && scoreEl) {
    const circumference = 377;
    const offset = circumference - (data.dms / 100) * circumference;
    ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => { ring.style.strokeDashoffset = String(offset); }, 100);
    // Count up score
    let cur = 0;
    const interval = setInterval(() => {
      cur = Math.min(cur + 2, data.dms);
      scoreEl.textContent = String(cur);
      if (cur >= data.dms) clearInterval(interval);
    }, 30);
  }

  // Level & XP
  const levelEl = document.getElementById('arenaLevel');
  const levelTitleEl = document.getElementById('arenaLevelTitle');
  const xpBarEl = document.getElementById('arenaXpBar') as HTMLElement | null;
  const xpCurrentEl = document.getElementById('arenaXpCurrent');
  const xpNextEl = document.getElementById('arenaXpNext');
  if (levelEl) levelEl.textContent = `Lv. ${data.level}`;
  if (levelTitleEl) levelTitleEl.textContent = data.levelTitle;
  if (xpCurrentEl) xpCurrentEl.textContent = `${data.xpCurrent.toLocaleString()} XP`;
  if (xpNextEl) xpNextEl.textContent = `→ ${data.xpNext.toLocaleString()} XP`;
  const xpPct = ((data.xpCurrent / data.xpNext) * 100).toFixed(1);
  if (xpBarEl) {
    setTimeout(() => { xpBarEl.style.width = `${xpPct}%`; }, 200);
  }

  // Breakdown bars
  const { protein, calories, sleep, hydration, activity } = data.breakdown;
  [
    ['abProtein', 'abProteinVal', protein],
    ['abCalories', 'abCaloriesVal', calories],
    ['abSleep', 'abSleepVal', sleep],
    ['abWater', 'abWaterVal', hydration],
    ['abActivity', 'abActivityVal', activity],
  ].forEach(([barId, valId, val]) => {
    const bar = document.getElementById(barId as string) as HTMLElement | null;
    const valEl = document.getElementById(valId as string);
    if (bar) setTimeout(() => { bar.style.width = `${val}%`; }, 300);
    if (valEl) (valEl as HTMLElement).textContent = String(val);
  });

  // AI Commentary
  const commentary = document.getElementById('arenaAiCommentary');
  if (commentary) {
    const pick = data.aiCommentaries[Math.floor(Math.random() * data.aiCommentaries.length)];
    commentary.textContent = pick;
  }

  // Streak
  const streakText = document.getElementById('arenaStreakText');
  const streakFire = document.getElementById('arenaStreakFire');
  if (streakText) streakText.textContent = `${data.streak}-day streak`;
  if (streakFire) streakFire.innerHTML = data.streak >= 7 ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:2px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';

  // Tier badge
  const tierBadge = document.getElementById('arenaTierBadge');
  if (tierBadge) {
    const tc = getTierConfig(data.tier);
    tierBadge.innerHTML = `<div class="tier-emblem ${tc.class}"><span class="tier-icon">${tc.icon}</span><span class="tier-name">${data.tier}</span></div>`;
  }
}

// ===== DAILY QUESTS & XP TOAST =====
function showXpToast(amount: number) {
  const toast = document.getElementById('xpToast');
  if (!toast) return;
  toast.innerHTML = `+${amount} XP <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px;vertical-align:text-bottom"><path d="M5 12l5 5L20 7"></path></svg>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function initQuests() {
  const questItems = document.querySelectorAll('.quest-item:not(.completed)');
  questItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('completed')) return;
      item.classList.add('completed');
      const check = item.querySelector('.quest-check');
      if (check) check.textContent = '✓';
      const statusBar = item.querySelector('.quest-status-bar');
      if (statusBar) { statusBar.innerHTML = ''; statusBar.classList.add('done'); }
      const xp = parseInt((item as HTMLElement).dataset.xp || '0');
      if (xp > 0) showXpToast(xp);
      updateQuestProgress();
    });
  });

  // Fire a welcome XP toast when user first visits the dashboard
  setTimeout(() => {
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage && dashPage.classList.contains('active')) {
      showXpToast(50);
    }
  }, 3000);
}

function updateQuestProgress() {
  const all = document.querySelectorAll('.quest-item');
  const done = document.querySelectorAll('.quest-item.completed');
  const progressEl = document.getElementById('questProgress');
  if (progressEl) progressEl.textContent = `${done.length} / ${all.length} complete`;

  // Update total XP bar
  let earned = 0, total = 0;
  all.forEach(q => {
    const xp = parseInt((q as HTMLElement).dataset.xp || '0');
    total += xp;
    if (q.classList.contains('completed')) earned += xp;
  });

  const totalFill = document.querySelector('.quest-total-fill') as HTMLElement;
  if (totalFill) totalFill.style.width = `${(earned / total * 100).toFixed(0)}%`;

  const totalText = document.querySelector('.quest-total-text span:first-child');
  if (totalText) totalText.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:text-bottom"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> ${earned} / ${total} XP Earned`;

  // Bonus check
  if (done.length === all.length) {
    const bonusText = document.querySelector('.quest-bonus-text');
    if (bonusText) {
      bonusText.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:text-bottom"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> All Quests Complete! +500 Bonus XP Earned!`;
      (bonusText as HTMLElement).style.color = '#10b981';
      setTimeout(() => showXpToast(500), 500);
    }
  }
}

// ===== WEB BLUETOOTH DEVICE MANAGER =====
interface DiscoveredDevice {
  id: string;
  name: string;
  type: string;
  rssi: number;
  connected: boolean;
  server?: any;
  characteristic?: any;
}

const discoveredDevices: DiscoveredDevice[] = [];
let isScanning = false;

function initDeviceManager() {
  const scanBtn = document.getElementById('scanDevicesBtn');
  if (scanBtn) {
    scanBtn.addEventListener('click', startDeviceScan);
  }
}

async function startDeviceScan() {
  if (isScanning) return;
  isScanning = true;

  const scanResults = document.getElementById('deviceScanResults');
  const scanProgress = document.getElementById('scanProgress');
  const discoveredEl = document.getElementById('discoveredDevices');
  const btStatus = document.getElementById('btStatus');
  const btStatusText = document.getElementById('btStatusText');
  const scanBtn = document.getElementById('scanDevicesBtn');

  if (scanResults) scanResults.style.display = 'block';
  if (scanProgress) scanProgress.style.display = 'flex';
  if (discoveredEl) discoveredEl.innerHTML = '';
  if (btStatus) { btStatus.className = 'bt-status scanning'; }
  if (btStatusText) btStatusText.textContent = 'Scanning for nearby devices...';
  if (scanBtn) scanBtn.textContent = 'Scanning...';

  // Check if Web Bluetooth is available
  const nav = navigator as any;
  if (nav.bluetooth) {
    try {
      // Request device with filters for common health services
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate', // 0x180D
          'battery_service', // 0x180F
          'health_thermometer', // 0x1809
          'device_information', // 0x180A
        ]
      });

      if (device) {
        const newDevice: DiscoveredDevice = {
          id: device.id || `bt-${Date.now()}`,
          name: device.name || 'Unknown Device',
          type: guessDeviceType(device.name || ''),
          rssi: -40 - Math.floor(Math.random() * 30),
          connected: false,
        };

        // Check if already discovered
        if (!discoveredDevices.find(d => d.id === newDevice.id)) {
          discoveredDevices.push(newDevice);
        }

        renderDiscoveredDevices();

        // Try to connect
        try {
          const server = await device.gatt?.connect();
          if (server) {
            newDevice.server = server;
            newDevice.connected = true;
            renderDiscoveredDevices();
            updateDeviceCountBadge();

            // Try reading heart rate
            try {
              const service = await server.getPrimaryService('heart_rate');
              const characteristic = await service.getCharacteristic('heart_rate_measurement');
              newDevice.characteristic = characteristic;

              characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                const value = event.target.value;
                const hr = value.getUint8(1);
                const hrEl = document.getElementById('heartRate');
                if (hrEl) hrEl.textContent = String(hr);
              });

              await characteristic.startNotifications();
            } catch {
              // Heart rate service not available on this device
            }
          }
        } catch {
          // Connection failed
        }
      }
    } catch {
      // User cancelled or error
    }
  } else {
    // Fallback: simulate discovered devices
    await simulateDeviceDiscovery();
  }

  if (scanProgress) scanProgress.style.display = 'none';
  isScanning = false;
  if (scanBtn) {
    scanBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"></path></svg> Scan for Nearby Devices`;
  }
  if (btStatusText) {
    btStatusText.textContent = discoveredDevices.length > 0
      ? `${discoveredDevices.filter(d => d.connected).length} device(s) connected`
      : 'No devices found';
  }
  if (btStatus) {
    btStatus.className = discoveredDevices.length > 0 ? 'bt-status has-devices' : 'bt-status';
  }
}

async function simulateDeviceDiscovery() {
  const simulatedDevices = [
    { name: 'Fitbit Sense 2', type: '⌚ Smartwatch', rssi: -42 },
    { name: 'Mi Band 8', type: '⌚ Fitness Band', rssi: -55 },
    { name: 'Withings Body+', type: '⚖️ Smart Scale', rssi: -68 },
    { name: 'Polar H10', type: '❤️ HR Monitor', rssi: -35 },
  ];

  for (let i = 0; i < simulatedDevices.length; i++) {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const dev = simulatedDevices[i];
    if (!discoveredDevices.find(d => d.name === dev.name)) {
      discoveredDevices.push({
        id: `sim-${i}-${Date.now()}`,
        name: dev.name,
        type: dev.type,
        rssi: dev.rssi,
        connected: false,
      });
      renderDiscoveredDevices();
    }
  }
}

function guessDeviceType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('watch') || lower.includes('fitbit') || lower.includes('apple') || lower.includes('garmin') || lower.includes('galaxy')) return '⌚ Smartwatch';
  if (lower.includes('band') || lower.includes('mi') || lower.includes('vivosmart')) return '⌚ Fitness Band';
  if (lower.includes('scale') || lower.includes('withings') || lower.includes('body')) return '⚖️ Smart Scale';
  if (lower.includes('polar') || lower.includes('heart') || lower.includes('hr')) return '❤️ HR Monitor';
  if (lower.includes('thermo')) return '🌡️ Thermometer';
  return '📱 Device';
}

function renderDiscoveredDevices() {
  const container = document.getElementById('discoveredDevices');
  if (!container) return;

  container.innerHTML = discoveredDevices.map((device, index) => {
    const signalStrength = Math.min(4, Math.max(1, Math.round((100 + device.rssi) / 20)));
    const bars = Array.from({ length: 4 }, (_, i) => {
      const height = 4 + i * 3;
      const active = i < signalStrength;
      return `<div class="signal-bar ${active ? '' : 'weak'}" style="height:${height}px"></div>`;
    }).join('');

    return `
      <div class="discovered-device" data-device-id="${device.id}">
        <span style="font-size:1.1rem">${device.type.split(' ')[0]}</span>
        <div class="device-info">
          <span class="device-name">${device.name}</span>
          <span class="device-status">${device.type} · ${device.rssi}dBm</span>
        </div>
        <div class="device-signal">${bars}</div>
        <button class="btn-connect ${device.connected ? 'connected' : ''}"
                onclick="window.toggleDeviceConnection(${index})">
          ${device.connected ? 'Connected' : 'Connect'}
        </button>
      </div>
    `;
  }).join('');
}

function updateDeviceCountBadge() {
  const badge = document.getElementById('deviceCountBadge');
  const connectedCount = discoveredDevices.filter(d => d.connected).length + DEVICES_DATA.filter(d => d.connected).length;
  if (badge) badge.textContent = `${connectedCount} linked`;
}

window.toggleDeviceConnection = function (index: number) {
  const device = discoveredDevices[index];
  if (!device) return;

  if (device.connected) {
    // Disconnect
    if (device.server && device.server.connected) {
      device.server.disconnect();
    }
    device.connected = false;
  } else {
    // Simulate connection for simulated devices
    device.connected = true;

    // If it's a simulated device, feed mock data to dashboard
    if (device.id.startsWith('sim-')) {
      feedSimulatedData(device);
    }
  }

  renderDiscoveredDevices();
  updateDeviceCountBadge();

  const btStatusText = document.getElementById('btStatusText');
  const connCount = discoveredDevices.filter(d => d.connected).length;
  if (btStatusText) {
    btStatusText.textContent = connCount > 0 ? `${connCount} device(s) connected` : 'No devices connected';
  }
};

function feedSimulatedData(device: DiscoveredDevice) {
  // Simulate streaming health data from the connected device
  const hrEl = document.getElementById('heartRate');
  const stepsEl = document.getElementById('steps');
  const calEl = document.getElementById('caloriesBurned');
  const activeMinEl = document.getElementById('activeMin');

  if (device.name.includes('Polar') || device.name.includes('Fitbit') || device.name.includes('Mi Band')) {
    // Simulate heart rate stream
    let hr = 68 + Math.floor(Math.random() * 10);
    const hrInterval = setInterval(() => {
      if (!device.connected) { clearInterval(hrInterval); return; }
      hr += Math.floor(Math.random() * 5) - 2;
      hr = Math.max(55, Math.min(120, hr));
      if (hrEl) hrEl.textContent = String(hr);
      HEALTH_DATA.heartRate.current = hr;
    }, 2000);
  }

  if (device.name.includes('Fitbit') || device.name.includes('Mi Band')) {
    // Simulate step counting
    let steps = parseInt(stepsEl?.textContent?.replace(/,/g, '') || '5420');
    const stepInterval = setInterval(() => {
      if (!device.connected) { clearInterval(stepInterval); return; }
      steps += Math.floor(Math.random() * 15) + 2;
      if (stepsEl) stepsEl.textContent = steps.toLocaleString();
      HEALTH_DATA.steps.today = steps;
    }, 5000);
  }

  if (device.name.includes('Fitbit')) {
    // Simulate calorie burn
    let cals = parseInt(calEl?.textContent?.replace(/,/g, '') || '1850');
    const calInterval = setInterval(() => {
      if (!device.connected) { clearInterval(calInterval); return; }
      cals += Math.floor(Math.random() * 3) + 1;
      if (calEl) calEl.textContent = cals.toLocaleString();
      HEALTH_DATA.calories.burned = cals;
      HEALTH_DATA.remainingCalories = HEALTH_DATA.calories.goal - HEALTH_DATA.calories.consumed;
    }, 8000);
  }

  // Simulate active minutes (all fitness devices)
  if (device.name.includes('Fitbit') || device.name.includes('Mi Band') || device.name.includes('Polar')) {
    let activeMin = HEALTH_DATA.activeMinutes;
    const activeInterval = setInterval(() => {
      if (!device.connected) { clearInterval(activeInterval); return; }
      activeMin += 1;
      if (activeMinEl) activeMinEl.textContent = String(activeMin);
      HEALTH_DATA.activeMinutes = activeMin;
    }, 15000);
  }

  // After a short delay, show a notification that device data is now feeding into meal recommendations
  setTimeout(() => {
    const toast = document.getElementById('xpToast');
    if (toast) {
      toast.innerHTML = `<span class="xp-burst">📡 Devices</span> synced! AI adjusting meals`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }
  }, 3000);
}



// Global UI Handlers
(window as any).joinPartyUI = async () => {
  const input = document.getElementById('joinPartyCode') as HTMLInputElement;
  const code = input.value.trim();
  if (!code) return alert('Please enter a party code');
  
  try {
    await joinParty(code);
    input.value = '';
  } catch (err) {
    alert('Party not found or failed to join');
  }
};

(window as any).createPartyUI = async () => {
  const input = document.getElementById('createPartyName') as HTMLInputElement;
  const name = input.value.trim();
  if (!name) return alert('Please enter a party name');
  
  await createParty(name);
  input.value = '';
};

(window as any).leavePartyUI = () => {
  if (confirm('Are you sure you want to leave this party?')) {
    currentParty = null;
    if (partyPollingInterval) clearInterval(partyPollingInterval);
    renderPartyDashboard();
  }
};

(window as any).copyPartyCode = () => {
  if (!currentParty) return;
  navigator.clipboard.writeText(currentParty.code);
  alert('Party code copied to clipboard!');
};

let currentLeaderboardMetric = 'steps';
(window as any).switchLeaderboard = (metric: string) => {
  currentLeaderboardMetric = metric;
  document.querySelectorAll('.lb-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent?.toLowerCase() === metric);
  });
  updateLeaderboardUI();
};

function renderPartyDashboard() {
  const noGroupView = document.getElementById('partyNoGroup');
  const dashView = document.getElementById('partyDashboard');
  
  if (!noGroupView || !dashView) return;

  if (currentParty) {
    noGroupView.style.display = 'none';
    dashView.style.display = 'block';
    
    document.getElementById('partyDisplayName')!.textContent = currentParty.name;
    document.getElementById('partyDisplayCode')!.textContent = currentParty.code;
    
    updateLeaderboardUI();
  } else {
    noGroupView.style.display = 'block';
    dashView.style.display = 'none';
  }
}

function updateLeaderboardUI() {
  const list = document.getElementById('partyLeaderboard');
  if (!list || !currentParty) return;

  const members = [...currentParty.members];
  // Sort by selected metric
  members.sort((a, b) => (b.metrics?.[currentLeaderboardMetric] || 0) - (a.metrics?.[currentLeaderboardMetric] || 0));

  list.innerHTML = members.map((m, idx) => `
    <div class="lb-item ${m.id === CURRENT_USER_ID ? 'is-me' : ''}">
      <div class="lb-rank rank-${idx + 1}">${idx + 1}</div>
      <div class="lb-avatar">${m.id.substring(4, 6).toUpperCase()}</div>
      <div class="lb-name">${m.id === CURRENT_USER_ID ? 'You' : 'Member ' + m.id.substring(4, 8)}</div>
      <div class="lb-score-box">
        <span class="lb-score-val">${m.metrics?.[currentLeaderboardMetric] || 0}</span>
        <span class="lb-score-label">${currentLeaderboardMetric}</span>
      </div>
    </div>
  `).join('');
}

// PERIODIC SYNC
setInterval(syncMetricsWithBackend, 30000); // Every 30s

// Initialize device manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeviceManager);
} else {
  initDeviceManager();
}

// ===== COMMUNITY & GUILDS =====
function initCommunity() {
  const tabFriends = document.getElementById('tabFriends');
  const tabGuilds = document.getElementById('tabGuilds');
  const secFriends = document.getElementById('communityFriends');
  const secGuilds = document.getElementById('communityGuilds');

  if (tabFriends && tabGuilds && secFriends && secGuilds) {
    tabFriends.addEventListener('click', () => {
      tabFriends.classList.add('active');
      tabGuilds.classList.remove('active');
      secFriends.style.display = 'block';
      secGuilds.style.display = 'none';
    });
    tabGuilds.addEventListener('click', () => {
      tabGuilds.classList.add('active');
      tabFriends.classList.remove('active');
      secGuilds.style.display = 'block';
      secFriends.style.display = 'none';
    });
  }

  renderFriends();
  renderGuilds();
  renderGuildChat();

  const sendBtn = document.getElementById('sendGuildMessageBtn');
  const msgInput = document.getElementById('guildMessageInput') as HTMLInputElement;
  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', () => {
      const msg = msgInput.value.trim();
      if (!msg) return;
      const chatWin = document.getElementById('guildChatWindow');
      if (chatWin) {
        chatWin.innerHTML += `
          <div class="chat-message self">
            <div class="msg-bubble">${msg}</div>
          </div>
        `;
        chatWin.scrollTop = chatWin.scrollHeight;
      }
      msgInput.value = '';
    });
  }
}

const FRIENDS_DATA = [
  { name: "Alex R.", status: "online", statusText: "Online" },
  { name: "Sarah M.", status: "in-game", statusText: "Working out right now" },
  { name: "Jake T.", status: "offline", statusText: "Last seen 2h ago" },
  { name: "Emily W.", status: "online", statusText: "Online" },
  { name: "Mike D.", status: "offline", statusText: "Last seen 1d ago" },
];

let showAddFriendInput = false;

function renderFriends() {
  const list = document.getElementById('friendsList');
  if (!list) return;

  const addFriendSection = showAddFriendInput
    ? `<div class="add-friend-input-row" style="display:flex;gap:8px;margin-bottom:12px;">
         <input type="text" id="addFriendNameInput" placeholder="Enter friend's name..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:0.85rem;outline:none;">
         <button class="btn-primary" onclick="window.submitAddFriend()" style="padding:8px 16px;font-size:0.8rem;border-radius:8px;">Add</button>
         <button class="btn-small" onclick="window.cancelAddFriend()" style="padding:8px 12px;">✕</button>
       </div>`
    : '';

  list.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:0.8rem;color:var(--text-muted);">${FRIENDS_DATA.length} friends</span>
      <button class="btn-primary" onclick="window.showAddFriend()" style="padding:6px 14px;font-size:0.78rem;border-radius:8px;display:flex;align-items:center;gap:4px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Friend
      </button>
    </div>
    ${addFriendSection}
    ${FRIENDS_DATA.map(f => `
    <div class="friend-item">
      <div class="friend-avatar">${f.name.charAt(0)}</div>
      <div class="friend-info">
        <div class="friend-name">${f.name}</div>
        <div class="friend-status"><span class="status-dot ${f.status}"></span>${f.statusText}</div>
      </div>
      <button class="btn-small">Message</button>
    </div>
  `).join('')}`;

  // Focus the input if it's shown
  if (showAddFriendInput) {
    setTimeout(() => {
      const input = document.getElementById('addFriendNameInput') as HTMLInputElement;
      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => {
          // @ts-ignore
          if (e.key === 'Enter') window.submitAddFriend?.();
          // @ts-ignore
          if (e.key === 'Escape') window.cancelAddFriend?.();
        });
      }
    }, 50);
  }
}

// @ts-ignore
window.showAddFriend = function () {
  showAddFriendInput = true;
  renderFriends();
};

// @ts-ignore
window.cancelAddFriend = function () {
  showAddFriendInput = false;
  renderFriends();
};

// @ts-ignore
window.submitAddFriend = function () {
  const input = document.getElementById('addFriendNameInput') as HTMLInputElement;
  const name = input?.value?.trim();
  if (!name) { input?.focus(); return; }

  // Add friend to list
  FRIENDS_DATA.unshift({ name, status: 'online', statusText: 'Online — just added!' });
  showAddFriendInput = false;
  renderFriends();

  // Show confirmation toast
  const toast = document.getElementById('xpToast');
  if (toast) {
    toast.innerHTML = `<span class="xp-burst">+50 XP</span> ${name} added as friend! 🎉`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
};

const GUILDS_DATA = [
  { name: "Iron Lifters", icon: "🏋️", members: 124, max: 150, level: 12, xp: 85, desc: "Heavy lifting crew. PRs every week.", active: true, color: '#ef4444' },
  { name: "Cardio Kings", icon: "🏃", members: 89, max: 100, level: 8, xp: 62, desc: "Run, cycle, swim. Endurance is our game.", active: false, color: '#06b6d4' },
  { name: "Yoga Mystics", icon: "🧘", members: 250, max: 250, level: 15, xp: 95, desc: "Flexibility, balance, and inner peace.", active: false, color: '#8b5cf6' },
];

const BROWSE_GUILDS = [
  { name: "Plant Power", icon: "🌱", members: 67, max: 100, desc: "Vegan athletes crushing it with plants.", color: '#10b981' },
  { name: "Night Owls", icon: "🦉", members: 45, max: 80, desc: "Late-night workout warriors.", color: '#6366f1' },
  { name: "Sprint Squad", icon: "⚡", members: 32, max: 50, desc: "Speed training and explosive power.", color: '#f59e0b' },
  { name: "Zen Warriors", icon: "🥋", members: 88, max: 120, desc: "Martial arts and mindful movement.", color: '#ec4899' },
  { name: "Meal Prep Masters", icon: "🍱", members: 156, max: 200, desc: "Batch cooking and macro tracking pros.", color: '#14b8a6' },
  { name: "Flex Factory", icon: "💪", members: 210, max: 300, desc: "Bodybuilding community. Gains on gains.", color: '#f97316' },
];

let guildView: 'my' | 'create' | 'browse' = 'my';
let selectedGuildIcon = '⚔️';

function renderGuilds() {
  const list = document.getElementById('guildsList');
  if (!list) return;

  let html = `
    <div class="guild-action-bar">
      <button class="guild-action-btn" onclick="window.showGuildView('create')">
        <span class="ga-icon">🏰</span>
        <span>Create Guild</span>
        <span class="ga-label">Build your own guild</span>
      </button>
      <button class="guild-action-btn" onclick="window.showGuildView('browse')">
        <span class="ga-icon">🔍</span>
        <span>Join Guild</span>
        <span class="ga-label">Browse available guilds</span>
      </button>
    </div>
  `;

  if (guildView === 'my') {
    html += `<div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:8px">`;
    html += GUILDS_DATA.map(g => `
      <div class="guild-card ${g.active ? 'active-guild' : ''}">
        <div class="guild-header">
          <span class="guild-icon">${g.icon}</span>
          <div>
            <div class="guild-title">${g.name}</div>
            <div class="guild-members">${g.members}/${g.max} members</div>
          </div>
        </div>
        <div class="guild-level-bar"><div class="guild-level-fill" style="width:${g.xp}%;background:${g.color}"></div></div>
        <p style="font-size:0.75rem;color:var(--text-secondary);margin:6px 0 10px">${g.desc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.7rem;color:var(--text-muted)">Lv.${g.level}</span>
          <span style="font-size:0.68rem;color:${g.active ? '#10b981' : 'var(--text-muted)'};font-weight:600">${g.active ? '✦ Primary' : 'Joined'}</span>
        </div>
        <button class="btn-small" style="width:100%;margin-top:10px">${g.active ? 'View Guild' : 'Switch Active'}</button>
      </div>
    `).join('');
    html += `</div>`;
  } else if (guildView === 'browse') {
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h4 style="font-family:'Space Grotesk';font-weight:700;font-size:0.95rem;margin:0">🔍 Browse Guilds</h4>
        <button class="btn-small" onclick="window.showGuildView('my')">← Back to My Guilds</button>
      </div>
      <div class="guild-browse-list">
    `;
    html += BROWSE_GUILDS.map((g, i) => `
      <div class="guild-browse-card">
        <div class="gb-header">
          <span class="gb-icon">${g.icon}</span>
          <div>
            <div class="gb-name">${g.name}</div>
            <div class="gb-members">${g.members}/${g.max} members</div>
          </div>
        </div>
        <p class="gb-desc">${g.desc}</p>
        <button class="gb-join-btn" onclick="window.joinGuild(${i})">Join Guild</button>
      </div>
    `).join('');
    html += `</div>`;
  } else if (guildView === 'create') {
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h4 style="font-family:'Space Grotesk';font-weight:700;font-size:0.95rem;margin:0">🏰 Create Your Guild</h4>
        <button class="btn-small" onclick="window.showGuildView('my')">← Back to My Guilds</button>
      </div>
      <div class="create-guild-form">
        <div class="form-group">
          <label>Guild Icon</label>
          <div class="guild-icon-picker" id="guildIconPicker">
            ${['⚔️', '🛡️', '🏰', '🐉', '🦁', '🔥', '💎', '🌟', '🏋️', '🎯', '🦅', '🐺'].map(ic => `
              <div class="guild-icon-option ${ic === selectedGuildIcon ? 'selected' : ''}" onclick="window.selectGuildIcon('${ic}')">${ic}</div>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Guild Name</label>
          <input type="text" id="newGuildName" placeholder="e.g., Dragon Warriors" maxlength="30">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="newGuildDesc" placeholder="Tell members what your guild is about..." rows="3" maxlength="120" style="resize:none"></textarea>
        </div>
        <div class="form-group">
          <label>Max Members</label>
          <select id="newGuildMax">
            <option value="25">25 Members</option>
            <option value="50" selected>50 Members</option>
            <option value="100">100 Members</option>
            <option value="200">200 Members</option>
          </select>
        </div>
        <button class="btn-primary btn-wide" onclick="window.createGuild()">🏰 Create Guild</button>
      </div>
    `;
  }

  list.innerHTML = html;
}

window.showGuildView = function (view: string) {
  guildView = view as any;
  renderGuilds();
};

window.selectGuildIcon = function (icon: string) {
  selectedGuildIcon = icon;
  const picker = document.getElementById('guildIconPicker');
  if (picker) {
    picker.querySelectorAll('.guild-icon-option').forEach(el => {
      el.classList.remove('selected');
      if (el.textContent?.trim() === icon) el.classList.add('selected');
    });
  }
};

window.joinGuild = function (index: number) {
  const guild = BROWSE_GUILDS[index];
  if (!guild) return;
  GUILDS_DATA.push({
    name: guild.name,
    icon: guild.icon,
    members: guild.members + 1,
    max: guild.max,
    level: 1,
    xp: 5,
    desc: guild.desc,
    active: false,
    color: guild.color,
  });
  BROWSE_GUILDS.splice(index, 1);
  guildView = 'my';
  renderGuilds();
  const toast = document.getElementById('xpToast');
  if (toast) {
    toast.innerHTML = `<span class="xp-burst">+200 XP</span> Joined ${guild.name}! ${guild.icon}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
};

window.createGuild = function () {
  const nameEl = document.getElementById('newGuildName') as HTMLInputElement;
  const descEl = document.getElementById('newGuildDesc') as HTMLTextAreaElement;
  const maxEl = document.getElementById('newGuildMax') as HTMLSelectElement;
  const name = nameEl?.value?.trim();
  const desc = descEl?.value?.trim();
  const max = parseInt(maxEl?.value || '50');
  if (!name) { nameEl?.focus(); return; }
  GUILDS_DATA.unshift({
    name,
    icon: selectedGuildIcon,
    members: 1,
    max,
    level: 1,
    xp: 0,
    desc: desc || 'A brand new guild ready for action!',
    active: true,
    color: '#10b981',
  });
  GUILDS_DATA.forEach((g, i) => { if (i > 0) g.active = false; });
  guildView = 'my';
  renderGuilds();
  renderGuildChat();
  const toast = document.getElementById('xpToast');
  if (toast) {
    toast.innerHTML = `<span class="xp-burst">+500 XP</span> Guild "${name}" Created! ${selectedGuildIcon}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
  // Update active guild chat name
  const guildNameEl = document.getElementById('activeGuildName');
  if (guildNameEl) guildNameEl.textContent = name;
};

function renderGuildChat() {
  const chatWin = document.getElementById('guildChatWindow');
  if (!chatWin) return;
  const activeGuild = GUILDS_DATA.find(g => g.active);
  const guildNameEl = document.getElementById('activeGuildName');
  if (guildNameEl && activeGuild) guildNameEl.textContent = activeGuild.name;

  chatWin.innerHTML = `
    <div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; margin-bottom: 10px;">Today</div>
    <div class="chat-message">
      <div class="msg-author">Alex R.</div>
      <div class="msg-bubble">Hit a new PR on bench today! Let's go!</div>
    </div>
    <div class="chat-message">
      <div class="msg-author">Sarah M.</div>
      <div class="msg-bubble">Nice job! Make sure to take your protein!</div>
    </div>
    <div class="chat-message self">
      <div class="msg-bubble">Thanks! Yeah, grabbing a shake right now.</div>
    </div>
  `;
  chatWin.scrollTop = chatWin.scrollHeight;
}

// ================================================================
// INTERCONNECTIVITY LAYER — Cross-Section Linking & Dynamic UI
// ================================================================

function initInterconnectivity() {
  createFloatingActionButton();
  addMetricCardNavigation();
  addDynamicHeroMessage();
  addHealthBannerToMeals();
  addActivityFeedToCommunity();
  enhancePantryWithExpiry();
}

// --- Floating Action Button ---
function createFloatingActionButton() {
  const fab = document.createElement('div');
  fab.className = 'quick-actions-fab';
  fab.id = 'quickActionsFab';
  fab.innerHTML = `
    <div class="fab-menu">
      <div class="fab-item" data-nav="meals"><span class="fab-emoji">🍽️</span> Meal Plans</div>
      <div class="fab-item" data-nav="pantry"><span class="fab-emoji">🛒</span> My Pantry</div>
      <div class="fab-item" data-nav="scan"><span class="fab-emoji">📸</span> Scan Food</div>
      <div class="fab-item" data-nav="community"><span class="fab-emoji">👥</span> Community</div>
      <div class="fab-item" data-nav="challenge"><span class="fab-emoji">🏆</span> Challenges</div>
    </div>
    <button class="fab-trigger" aria-label="Quick Actions">⚡</button>
  `;
  document.body.appendChild(fab);

  const trigger = fab.querySelector('.fab-trigger');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      fab.classList.toggle('open');
    });
  }

  fab.querySelectorAll('.fab-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = (item as HTMLElement).dataset.nav;
      if (page) {
        window.location.hash = page;
        fab.classList.remove('open');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target as Node)) {
      fab.classList.remove('open');
    }
  });
}

// --- Metric Card Navigate to Related Section ---
function addMetricCardNavigation() {
  const mappings: Record<string, string> = {
    heart: 'meals',
    calories: 'meals',
    steps: 'challenge',
    sleep: 'profile',
    hrv: 'meals',
    active: 'challenge',
  };

  document.querySelectorAll('.metric-card').forEach(card => {
    const type = (card as HTMLElement).dataset.type;
    if (type && mappings[type]) {
      card.addEventListener('click', () => {
        window.location.hash = mappings[type];
        // Pop animation
        const val = card.querySelector('.metric-value');
        if (val) {
          val.classList.add('updating');
          setTimeout(() => val.classList.remove('updating'), 400);
        }
      });
      (card as HTMLElement).title = `Click to go to ${mappings[type].charAt(0).toUpperCase() + mappings[type].slice(1)}`;
    }
  });
}

// --- Dynamic Hero Banner Message ---
function addDynamicHeroMessage() {
  const heroTitle = document.querySelector('.dash-hero-title');
  const heroSub = document.querySelector('.dash-hero-sub');
  if (!heroTitle || !heroSub) return;

  const h = new Date().getHours();
  let greeting = 'Welcome back';
  let emoji = '⚡';
  let subMsg = 'Your metabolic engine is running';

  if (h >= 5 && h < 12) {
    greeting = 'Good morning';
    emoji = '🌅';
    subMsg = 'Start your day strong — breakfast recommendations are ready';
  } else if (h >= 12 && h < 17) {
    greeting = 'Good afternoon';
    emoji = '☀️';
    subMsg = 'Midday fuel check — your lunch plan is optimized';
  } else if (h >= 17 && h < 21) {
    greeting = 'Good evening';
    emoji = '🌆';
    subMsg = 'Wind down right — dinner and recovery meals await';
  } else {
    greeting = 'Late night hustle';
    emoji = '🌙';
    subMsg = 'Rest matters — check your sleep targets';
  }

  heroTitle.innerHTML = `${greeting}, <span class="hero-name">Jeremy</span> ${emoji}`;
  const strongEl = heroSub.querySelector('strong');
  if (strongEl) strongEl.textContent = 'elite-level';
  heroSub.innerHTML = `${subMsg}. Keep pushing. <strong id="heroStateDesc">elite-level</strong>`;
}

// --- Health-Driven Banner on Meals Page ---
function addHealthBannerToMeals() {
  const mealsPage = document.getElementById('page-meals');
  if (!mealsPage) return;

  const pageHeader = mealsPage.querySelector('.page-header');
  if (!pageHeader) return;

  const caloriesEl = document.getElementById('caloriesBurned');
  const stepsEl = document.getElementById('steps');
  const cals = caloriesEl?.textContent || '1,847';
  const steps = stepsEl?.textContent || '8,432';

  const banner = document.createElement('div');
  banner.className = 'interconnect-banner';
  banner.innerHTML = `
    <span class="ib-icon">📡</span>
    <div class="ib-content">
      <div class="ib-title">Personalized for Your Activity</div>
      <div class="ib-desc">📊 ${cals} kcal burned · 👟 ${steps} steps today → AI is prioritizing <strong style="color:var(--emerald)">high-protein recovery meals</strong></div>
    </div>
    <span class="ib-action" onclick="window.location.hash='dashboard'">View Health Data →</span>
  `;

  pageHeader.insertAdjacentElement('afterend', banner);

  // Also add pantry match badges to existing meal cards
  setTimeout(() => {
    addPantryMatchToMealCards();
  }, 500);
}

// --- Pantry Ingredient Match on Meal Cards ---
function addPantryMatchToMealCards() {
  const pantryNames = PANTRY_DATA.map(p => p.name.toLowerCase());
  document.querySelectorAll('.meal-card').forEach(card => {
    const nameEl = card.querySelector('.meal-card-title');
    if (!nameEl) return;

    // Check how many ingredients match pantry
    const mealName = nameEl.textContent?.toLowerCase() || '';
    let matchCount = 0;

    // Simple heuristic: check if any pantry item name is in meal name/description
    pantryNames.forEach(pn => {
      const keywords = pn.split(' ');
      keywords.forEach(kw => {
        if (kw.length > 3 && mealName.includes(kw)) matchCount++;
      });
    });

    // Random realistic match for demo
    matchCount = Math.floor(Math.random() * 4) + 1;
    const total = Math.floor(Math.random() * 3) + matchCount + 1;

    const badge = document.createElement('div');
    badge.className = 'pantry-match-badge';
    badge.innerHTML = `🛒 ${matchCount}/${total} ingredients in pantry`;

    const cardBody = card.querySelector('.meal-card-body');
    if (cardBody) cardBody.appendChild(badge);
  });
}

// --- Community Activity Feed ---
function addActivityFeedToCommunity() {
  const communityPage = document.getElementById('page-community');
  if (!communityPage) return;

  const feedActivities = [
    { name: 'Alex R.', initials: 'AR', action: 'rated', target: 'Salmon Quinoa Bowl', detail: '⭐⭐⭐⭐⭐', time: '5m ago' },
    { name: 'Sarah M.', initials: 'SM', action: 'completed', target: 'Walk 10,000 Steps', detail: '🏆 Challenge Complete', time: '12m ago' },
    { name: 'Jeremy', initials: 'JJ', action: 'logged', target: '8 glasses of water', detail: '💧 Hydration Goal Met', time: '25m ago' },
    { name: 'Mike T.', initials: 'MT', action: 'scanned', target: 'Greek Salad', detail: '📸 380 kcal identified', time: '1h ago' },
    { name: 'Luna K.', initials: 'LK', action: 'joined guild', target: 'Protein Warriors', detail: '⚔️ New member', time: '2h ago' },
  ];

  const feedSection = document.createElement('div');
  feedSection.className = 'glass-card';
  feedSection.style.marginBottom = '20px';
  feedSection.innerHTML = `
    <div class="chart-header">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:bottom;">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>Activity Feed
      </h3>
      <span class="chart-badge ai-badge">Live</span>
    </div>
    <div class="activity-feed" id="activityFeed">
      ${feedActivities.map(a => `
        <div class="activity-item">
          <div class="activity-avatar">${a.initials}</div>
          <div class="activity-text"><strong>${a.name}</strong> ${a.action} <span class="activity-highlight">${a.target}</span> — ${a.detail}</div>
          <span class="activity-time">${a.time}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Insert before the first child in community page
  const firstChild = communityPage.firstElementChild;
  if (firstChild) {
    communityPage.insertBefore(feedSection, firstChild.nextSibling);
  } else {
    communityPage.appendChild(feedSection);
  }
}

// --- Enhanced Pantry with Expiry Colors & Cook Buttons ---
function enhancePantryWithExpiry() {
  // Add expiry color classes to pantry items after they render
  setTimeout(() => {
    const now = new Date();
    document.querySelectorAll('.pantry-item').forEach(item => {
      const qtyEl = item.querySelector('.pantry-qty');
      if (!qtyEl) return;

      // Find the corresponding pantry data
      const nameEl = item.querySelector('.pantry-name');
      if (!nameEl) return;

      const name = nameEl.textContent?.trim() || '';
      const pantryEntry = PANTRY_DATA.find(p => p.name === name);
      if (!pantryEntry || !pantryEntry.expiry) return;

      const expDate = new Date(pantryEntry.expiry);
      const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Add expiry badge
      const badge = document.createElement('span');
      badge.className = 'expiry-badge';

      if (daysLeft <= 1) {
        badge.classList.add('urgent');
        badge.textContent = daysLeft <= 0 ? '⚠️ EXPIRED' : '⚠️ 1 day';
        item.classList.add('expiry-urgent');
      } else if (daysLeft <= 3) {
        badge.classList.add('soon');
        badge.textContent = `⏳ ${daysLeft}d`;
        item.classList.add('expiry-soon');
      } else {
        badge.classList.add('fresh');
        badge.textContent = `✅ ${daysLeft}d`;
      }

      // Insert badge before the remove button
      const removeBtn = item.querySelector('.pantry-remove');
      if (removeBtn) {
        item.insertBefore(badge, removeBtn);
      }

      // Add "Cook with this" button
      const cookBtn = document.createElement('button');
      cookBtn.className = 'btn-cook-with';
      cookBtn.textContent = '🍳 Cook';
      cookBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.hash = 'meals';
        const toast = document.getElementById('xpToast');
        if (toast) {
          toast.innerHTML = `🍳 Finding recipes with <strong>${name}</strong>...`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      });

      if (removeBtn) {
        item.insertBefore(cookBtn, removeBtn);
      }
    });
  }, 800);
}

// Connect water logging to quest progress
const origAddWater = window.addWater;
if (typeof origAddWater === 'function') {
  // @ts-ignore
  window.addWater = function (ml: number) {
    origAddWater(ml);
    // Trigger XP toast for synergy
    setTimeout(() => {
      const toast = document.getElementById('xpToast');
      if (toast && !toast.classList.contains('show')) {
        toast.innerHTML = `💧 +25 XP · Hydration quest progress updated!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      }
    }, 600);
  };
}

// Register interconnectivity init
const origInit = document.readyState;
if (origInit === 'complete' || origInit === 'interactive') {
  setTimeout(initInterconnectivity, 500);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initInterconnectivity, 500);
  });
}

