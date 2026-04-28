import { createContext, useContext } from 'react'

export interface DemoAppContextValue {
  checkoutWalletApplied: number
  setCheckoutWalletApplied: (value: number) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
}

export const DemoAppContext = createContext<DemoAppContextValue | null>(null)

export function useDemoApp() {
  const context = useContext(DemoAppContext)
  if (!context) {
    throw new Error('useDemoApp must be used within DemoAppProvider')
  }

  return context
}
