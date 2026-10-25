/** Catalog item placed on supermarket shelves. */
export interface Product {
  id: string
  name: string
  price: number
  description: string
  department: DepartmentId
  color: string
  accent: string
}

/** Store department identifiers used for aisle grouping. */
export type DepartmentId =
  | 'everyday'
  | 'snacks'
  | 'dairy'
  | 'home'

/** Cart line with quantity. */
export interface CartItem {
  product: Product
  quantity: number
}

/** Runtime selection from the 3D scene. */
export interface SelectedProduct {
  product: Product
  worldPosition: [number, number, number]
}
