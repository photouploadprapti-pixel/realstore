import type { DepartmentId, Product } from '@/types/product'

/** Department display labels for aisle banners. */
export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  everyday: 'EVERYDAY ESSENTIALS',
  snacks: 'SNACKS & TREATS',
  dairy: 'DAIRY & EGGS',
  home: 'HOME & BEAUTY',
}

const catalogSeed: Omit<Product, 'id'>[] = [
  {
    name: 'Arabica Coffee',
    price: 8.99,
    description: 'Medium roast whole beans with chocolate notes.',
    department: 'everyday',
    color: '#6b3a2a',
    accent: '#f5e6d3',
  },
  {
    name: 'Olive Oil Extra Virgin',
    price: 12.49,
    description: 'Cold-pressed olive oil in a 750ml bottle.',
    department: 'everyday',
    color: '#3d5c2e',
    accent: '#e8f0d8',
  },
  {
    name: 'Pasta Penne',
    price: 2.29,
    description: 'Durum wheat penne — perfect for weeknight dinners.',
    department: 'everyday',
    color: '#d4a017',
    accent: '#fff8e7',
  },
  {
    name: 'Tomato Sauce',
    price: 3.49,
    description: 'Classic Italian-style crushed tomato sauce.',
    department: 'everyday',
    color: '#b22222',
    accent: '#ffe8e0',
  },
  {
    name: 'Rice Basmati',
    price: 5.99,
    description: 'Fragrant long-grain basmati rice, 1kg bag.',
    department: 'everyday',
    color: '#c4a35a',
    accent: '#fffaf0',
  },
  {
    name: 'Honey Crunch Cereal',
    price: 4.79,
    description: 'Whole-grain flakes with a touch of honey.',
    department: 'everyday',
    color: '#e09b2d',
    accent: '#fff3d6',
  },
  {
    name: "Sea Salt Chips",
    price: 3.29,
    description: 'Crispy potato chips with sea salt.',
    department: 'snacks',
    color: '#f0c040',
    accent: '#fff8dc',
  },
  {
    name: 'Chocolate Cookies',
    price: 4.19,
    description: 'Butter cookies with dark chocolate chunks.',
    department: 'snacks',
    color: '#5c3317',
    accent: '#f5e6d3',
  },
  {
    name: 'Petit Beurre',
    price: 2.89,
    description: 'Classic butter biscuits — light and crisp.',
    department: 'snacks',
    color: '#e8c87a',
    accent: '#fffaf0',
  },
  {
    name: 'Trail Mix',
    price: 6.49,
    description: 'Nuts, dried fruit, and dark chocolate pieces.',
    department: 'snacks',
    color: '#8b4513',
    accent: '#f5deb3',
  },
  {
    name: 'Gummy Bears',
    price: 2.59,
    description: 'Assorted fruit-flavored gummy candies.',
    department: 'snacks',
    color: '#e6399b',
    accent: '#ffe4f0',
  },
  {
    name: 'Popcorn Butter',
    price: 3.99,
    description: 'Microwave popcorn with real butter flavor.',
    department: 'snacks',
    color: '#ffcc33',
    accent: '#fff8e0',
  },
  {
    name: 'Whole Milk 1L',
    price: 2.19,
    description: 'Fresh pasteurized whole milk.',
    department: 'dairy',
    color: '#f5f5f5',
    accent: '#2563eb',
  },
  {
    name: 'Farm Eggs (12)',
    price: 4.59,
    description: 'Free-range large eggs, dozen pack.',
    department: 'dairy',
    color: '#faf0e6',
    accent: '#d2691e',
  },
  {
    name: 'Greek Yogurt',
    price: 3.79,
    description: 'Creamy plain Greek yogurt, 500g.',
    department: 'dairy',
    color: '#f0f8ff',
    accent: '#1e90ff',
  },
  {
    name: 'Cheddar Block',
    price: 5.29,
    description: 'Aged cheddar cheese, 250g block.',
    department: 'dairy',
    color: '#ffb347',
    accent: '#fff5e6',
  },
  {
    name: 'Butter Unsalted',
    price: 4.09,
    description: 'Creamy unsalted butter sticks.',
    department: 'dairy',
    color: '#fff8dc',
    accent: '#f0e68c',
  },
  {
    name: 'Cream Cheese',
    price: 3.39,
    description: 'Smooth spreadable cream cheese.',
    department: 'dairy',
    color: '#fffaf0',
    accent: '#87ceeb',
  },
  {
    name: 'Shampoo Soft Care',
    price: 7.99,
    description: 'Gentle daily shampoo for all hair types.',
    department: 'home',
    color: '#4169e1',
    accent: '#e6f0ff',
  },
  {
    name: 'Body Lotion',
    price: 6.49,
    description: 'Moisturizing lotion with shea butter.',
    department: 'home',
    color: '#dda0dd',
    accent: '#fff0ff',
  },
  {
    name: 'Dish Soap Lemon',
    price: 2.99,
    description: 'Grease-cutting lemon dish soap.',
    department: 'home',
    color: '#32cd32',
    accent: '#f0fff0',
  },
  {
    name: 'Paper Towels',
    price: 5.49,
    description: '2-ply absorbent paper towels, 6-pack.',
    department: 'home',
    color: '#f8f8ff',
    accent: '#4682b4',
  },
  {
    name: 'Toothpaste Mint',
    price: 3.89,
    description: 'Fluoride toothpaste with fresh mint.',
    department: 'home',
    color: '#00ced1',
    accent: '#e0ffff',
  },
  {
    name: 'Hand Soap',
    price: 3.29,
    description: 'Antibacterial liquid hand soap.',
    department: 'home',
    color: '#20b2aa',
    accent: '#e0fff8',
  },
]

/** Full product catalog with stable ids. */
export const PRODUCTS: Product[] = catalogSeed.map((item, index) => ({
  ...item,
  id: `prod-${String(index + 1).padStart(3, '0')}`,
}))

/**
 * Returns products for a department.
 * @param department - Department id to filter by
 */
export const getProductsByDepartment = (department: DepartmentId) => {
  return PRODUCTS.filter((product) => product.department === department)
}

/**
 * Looks up a product by id.
 * @param id - Product id
 */
export const getProductById = (id: string) => {
  return PRODUCTS.find((product) => product.id === id)
}
