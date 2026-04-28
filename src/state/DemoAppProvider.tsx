import { useState } from 'react'
import { DemoAppContext } from './useDemoApp'

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
