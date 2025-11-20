"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MinusCircle, PlusCircle, TrendingDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface DisciplineDebtProps {
  isOpen: boolean
  onClose: () => void
}

const REPAYMENT_ACTIONS = [
  { id: 'walk', label: 'Walk 500 steps', repays: 6, icon: '🚶' },
  { id: 'water', label: 'Drink 2 glasses water', repays: 4, icon: '💧' },
  { id: 'meditation', label: '5 min meditation', repays: 8, icon: '🧘' },
  { id: 'vegetables', label: 'Eat vegetables', repays: 7, icon: '🥗' },
  { id: 'sleep', label: 'Sleep 8 hours', repays: 10, icon: '😴' },
  { id: 'journal', label: 'Write journal', repays: 5, icon: '📝' },
]

export function DisciplineDebt({ isOpen, onClose }: DisciplineDebtProps) {
  const [debt, setDebt] = useState<any>({ current_debt: 0, total_accumulated: 0, total_repaid: 0 })
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !isOpen) return
    loadDebtData()
  }, [userId, isOpen])

  const loadDebtData = async () => {
    setLoading(true)
    try {
      // Get or create debt record
      let { data: debtData } = await supabase
        .from('discipline_debt')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!debtData) {
        const { data: newDebt } = await supabase
          .from('discipline_debt')
          .insert({ user_id: userId, current_debt: 0 })
          .select()
          .single()
        debtData = newDebt
      }

      setDebt(debtData || { current_debt: 0, total_accumulated: 0, total_repaid: 0 })

      // Load recent transactions
      const { data: transData } = await supabase
        .from('debt_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      setTransactions(transData || [])
    } catch (error) {
      console.error('Error loading debt:', error)
    } finally {
      setLoading(false)
    }
  }

  const repayDebt = async (action: typeof REPAYMENT_ACTIONS[0]) => {
    if (!userId || debt.current_debt === 0) return
    try {
      const repayAmount = Math.min(action.repays, debt.current_debt)
      const newDebt = debt.current_debt - repayAmount
      const newRepaid = debt.total_repaid + repayAmount

      await supabase
        .from('discipline_debt')
        .update({
          current_debt: newDebt,
          total_repaid: newRepaid,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId)

      await supabase.from('debt_transactions').insert({
        user_id: userId,
        transaction_type: 'debt_repaid',
        amount: repayAmount,
        reason: action.label,
      })

      setDebt({ ...debt, current_debt: newDebt, total_repaid: newRepaid })
      await loadDebtData()
    } catch (error) {
      console.error('Error repaying debt:', error)
    }
  }

  if (!isOpen) return null

  const debtPercentage = debt.total_accumulated > 0
    ? (debt.current_debt / debt.total_accumulated) * 100
    : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-card border border-border/50 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9fa5f] flex items-center justify-center">
              <MinusCircle className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-md mt-3 font-semibold text-foreground">Discipline Debt</h3>
              <p className="text-xs text-muted-foreground">Repay through positive actions</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-[#c9fa5f]/20 border-t-[#c9fa5f] rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Debt Meter */}
            <div className="mb-6 p-4 bg-muted/30 rounded-[5px] border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Current Debt</h4>
                  <p className="text-xs text-muted-foreground">Clear through healthy actions</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#c9fa5f]">{debt.current_debt}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>

              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${Math.min(debtPercentage, 100)}%` }}
                />
              </div>

              {debt.current_debt === 0 && (
                <p className="text-xs text-[#c9fa5f] mt-2 text-center">
                  Debt cleared! Keep making healthy choices!
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Total Accumulated</div>
                <div className="text-lg font-bold text-foreground">{debt.total_accumulated}</div>
              </Card>
              <Card className="p-3 bg-muted/30 border-border/50 rounded-[5px]">
                <div className="text-xs text-muted-foreground mb-1">Total Repaid</div>
                <div className="text-lg font-bold text-[#c9fa5f]">{debt.total_repaid}</div>
              </Card>
            </div>

            {/* Repayment Actions */}
            {debt.current_debt > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Repay Debt With:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {REPAYMENT_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      onClick={() => repayDebt(action)}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-[#c9fa5f]/10 hover:border-[#c9fa5f]/30"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-xs text-center">{action.label}</span>
                      <span className="text-xs font-bold text-[#c9fa5f]">-{action.repays}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                ) : (
                  transactions.map((trans) => (
                    <div
                      key={trans.id}
                      className={`p-3 rounded-lg border ${
                        trans.transaction_type === 'debt_repaid'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-orange-500/10 border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {trans.transaction_type === 'debt_repaid' ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <PlusCircle className="h-4 w-4 text-orange-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{trans.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(trans.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${
                          trans.transaction_type === 'debt_repaid' ? 'text-green-500' : 'text-orange-500'
                        }`}>
                          {trans.transaction_type === 'debt_repaid' ? '-' : '+'}{trans.amount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#c9fa5f]/10 border border-[#c9fa5f]/20 rounded-[5px]">
              <p className="text-xs text-foreground leading-relaxed">
                <strong className="text-[#c9fa5f]">Note:</strong> Debt accumulates from overeating or missed habits. Repay it through positive actions to stay accountable.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}