import React, { createContext, useContext } from 'react'
import { useRaises, useVCFirms } from '../hooks/useData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { data: raises, loading: raisesLoading, error: raisesError } = useRaises()
  const { data: vcFirms, loading: vcLoading } = useVCFirms()

  return (
    <DataContext.Provider value={{
      raises:       raises  || [],
      vcFirms:      vcFirms || [],
      loading:      raisesLoading || vcLoading,
      usingLiveData: !raisesError,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
