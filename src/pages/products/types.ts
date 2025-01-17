export type TermType = 'DAY' | 'MONTH'

export type Product = {
  id: number
  name: string
  isActive: boolean
  minSum: number
  maxSum: number
  minInterestRate: number
  maxInterestRate: number
  minTerm: number
  maxTerm: number
  termType: TermType
}
