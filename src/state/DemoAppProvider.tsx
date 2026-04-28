import { createContext, useContext, useState } from 'react'

interface DemoAppContextValue {
  checkoutWalletApplied: number
  setCheckoutWalletApplied: (value: number) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
}

const DemoAppContext = createContext<DemoAppContextValue | null>(null)

export function DemoAppProvider({ children }: { children: React.ReactNode }) {
  const [checkoutWalletApplied, setCheckoutWalletApplied] = useState(120)
  const [selectedCategory, setSelectedCategory] = useState('All')

  return (
    <DemoAppContext.Provider
      value={{
        checkoutWalletApplied,
        setCheckoutWalletApplied,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </DemoAppContext.Provider>
  )
}

export function useDemoApp() {
  const context = useContext(DemoAppContext)
  if (!context) {
    throw new Error('useDemoApp must be used within DemoAppProvider')
  }

  return context
}
