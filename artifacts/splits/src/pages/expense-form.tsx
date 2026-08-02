import { useRoute, useLocation } from "wouter";
import { TopNav } from "@/components/ui/top-nav";
import {
  useGetGroup,
  useListMembers,
  useCreateExpense,
  useUpdateExpense,
  useGetExpense,
  getGetGroupQueryKey,
  getListMembersQueryKey,
  getListExpensesQueryKey,
  getGetGroupSummaryQueryKey,
  getGetBalancesQueryKey,
  getGetSettlementsQueryKey,
  getGetExpenseQueryKey,
  ExpenseSplitMode,
} from "@workspace/api-client-react";
import { Button, Card, CardContent, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@/components/ui";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getInitials } from "@/lib/utils";
import { format } from "date-fns";

export default function ExpenseForm() {
  const [, params] = useRoute("/groups/:groupId/expenses/:action");
  const groupId = Number(params?.groupId);
  const isNew = params?.action === "new";
  const expenseId = !isNew ? Number(params?.action) : undefined;
  const [, setLocation] = useLocation();

  const { data: group } = useGetGroup(groupId, { query: { enabled: !!groupId, queryKey: getGetGroupQueryKey(groupId) } });
  const { data: members } = useListMembers(groupId, { query: { enabled: !!groupId, queryKey: getListMembersQueryKey(groupId) } });
  const { data: expenseDetail } = useGetExpense(groupId, expenseId!, { query: { enabled: !!expenseId, queryKey: getGetExpenseQueryKey(groupId, expenseId!) } });

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [payerId, setPayerId] = useState<string>("");
  const [productSize, setProductSize] = useState("");
  const [notes, setNotes] = useState("");
  const [splitMode, setSplitMode] = useState<ExpenseSplitMode>("equal");

  // Splits: map of memberId to their data
  // for "equal": we just track boolean "included"
  // for "amount": exact amount
  // for "shares": number of shares
  const [includedMembers, setIncludedMembers] = useState<Record<number, boolean>>({});
  const [memberAmounts, setMemberAmounts] = useState<Record<number, string>>({});
  const [memberShares, setMemberShares] = useState<Record<number, string>>({});

  useEffect(() => {
    if (members && isNew && Object.keys(includedMembers).length === 0) {
      const inc: Record<number, boolean> = {};
      const sh: Record<number, string> = {};
      members.forEach(m => {
        inc[m.id] = true;
        sh[m.id] = "1";
      });
      setIncludedMembers(inc);
      setMemberShares(sh);
      if (members.length > 0 && !payerId) {
        setPayerId(String(members[0].id));
      }
    }
  }, [members, isNew]);

  useEffect(() => {
    if (expenseDetail && !isNew) {
      setTitle(expenseDetail.title);
      setAmount(String(expenseDetail.amount));
      setDate(expenseDetail.date);
      setPayerId(String(expenseDetail.payerId));
      setProductSize(expenseDetail.productSize || "");
      setNotes(expenseDetail.notes || "");
      setSplitMode(expenseDetail.splitMode as ExpenseSplitMode);

      const inc: Record<number, boolean> = {};
      const amts: Record<number, string> = {};
      const sh: Record<number, string> = {};

      expenseDetail.splits.forEach(s => {
        inc[s.memberId] = true;
        amts[s.memberId] = String(s.owedAmount);
        sh[s.memberId] = String(s.shares || 1);
      });

      // mark non-included members
      members?.forEach(m => {
        if (inc[m.id] === undefined) {
          inc[m.id] = false;
          amts[m.id] = "";
          sh[m.id] = "1";
        }
      });

      setIncludedMembers(inc);
      setMemberAmounts(amts);
      setMemberShares(sh);
    }
  }, [expenseDetail, isNew, members]);

  const totalAmountNum = Number(amount) || 0;
  const includedCount = Object.values(includedMembers).filter(Boolean).length;
  
  // Equal split computed
  const equalAmount = includedCount > 0 ? totalAmountNum / includedCount : 0;

  // Shares computed
  const totalShares = Object.keys(includedMembers).reduce((sum, id) => {
    return sum + (includedMembers[Number(id)] ? (Number(memberShares[Number(id)]) || 0) : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !payerId) return;

    let splitsPayload: any[] = [];

    if (splitMode === "equal") {
      if (includedCount === 0) {
        toast({ variant: "destructive", title: "Select at least one member to split" });
        return;
      }
      splitsPayload = Object.keys(includedMembers)
        .filter(id => includedMembers[Number(id)])
        .map(id => ({ memberId: Number(id) })); // backend auto-computes equal
    } else if (splitMode === "amount") {
      const sum = Object.keys(includedMembers)
        .filter(id => includedMembers[Number(id)])
        .reduce((s, id) => s + (Number(memberAmounts[Number(id)]) || 0), 0);
      
      if (Math.abs(sum - totalAmountNum) > 0.01) {
        toast({ variant: "destructive", title: `Amounts must sum to ${totalAmountNum} (currently ${sum})` });
        return;
      }
      splitsPayload = Object.keys(includedMembers)
        .filter(id => includedMembers[Number(id)])
        .map(id => ({ memberId: Number(id), owedAmount: Number(memberAmounts[Number(id)]) || 0 }));
    } else if (splitMode === "shares") {
      if (totalShares === 0) {
        toast({ variant: "destructive", title: "Total shares must be > 0" });
        return;
      }
      splitsPayload = Object.keys(includedMembers)
        .filter(id => includedMembers[Number(id)])
        .map(id => ({ memberId: Number(id), shares: Number(memberShares[Number(id)]) || 0 }));
    }

    const payload = {
      title,
      amount: totalAmountNum,
      currency: group?.currency || "USD",
      date,
      payerId: Number(payerId),
      productSize: productSize || undefined,
      notes: notes || undefined,
      splitMode,
      splits: splitsPayload
    };

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getGetGroupSummaryQueryKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getGetBalancesQueryKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getGetSettlementsQueryKey(groupId) });
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: getGetExpenseQueryKey(groupId, expenseId!) });
      }
    };

    if (isNew) {
      createExpense.mutate({ groupId, data: payload as any }, {
        onSuccess: () => {
          invalidate();
          toast({ title: "Expense added" });
          setLocation(`/groups/${groupId}`);
        }
      });
    } else {
      updateExpense.mutate({ groupId, expenseId: expenseId!, data: payload as any }, {
        onSuccess: () => {
          invalidate();
          toast({ title: "Expense updated" });
          setLocation(`/groups/${groupId}`);
        }
      });
    }
  };

  if (!members || !group) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav title={isNew ? "Add Expense" : "Edit Expense"} backTo={isNew ? `/groups/${groupId}` : `/groups/${groupId}/expenses/${expenseId}`} />
      
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="overflow-hidden border-transparent shadow-sm">
            <div className="bg-card p-6 border-b border-border">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="What was this for?" 
                className="text-2xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/60"
                autoFocus
              />
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Amount ({group.currency})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input 
                      type="number" step="0.01" min="0" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      className="pl-8 text-lg font-medium h-12"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12" />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Paid by</Label>
                  <Select value={payerId} onValueChange={setPayerId}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size/Quantity (optional)</Label>
                  <Input value={productSize} onChange={e => setProductSize(e.target.value)} placeholder="e.g. 2L, Family Pack" className="h-12" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." className="h-12" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold px-1">Split options</h3>
            <Card>
              <CardContent className="p-0">
                <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as ExpenseSplitMode)} className="w-full">
                  <div className="p-4 border-b border-border">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="equal">Equally</TabsTrigger>
                      <TabsTrigger value="amount">Exact Amounts</TabsTrigger>
                      <TabsTrigger value="shares">By Shares</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {members.map(member => {
                      const isInc = includedMembers[member.id];
                      return (
                        <div key={member.id} className="flex items-center gap-4 py-2">
                          <div 
                            className="cursor-pointer"
                            onClick={() => setIncludedMembers(p => ({...p, [member.id]: !p[member.id]}))}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isInc ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                              {isInc && <span className="text-xs">✓</span>}
                            </div>
                          </div>
                          
                          <div className="flex-1 font-medium">{member.name}</div>
                          
                          <div className="w-32 text-right">
                            {splitMode === "equal" && (
                              <div className="text-muted-foreground font-medium">
                                {isInc ? formatCurrency(equalAmount, group.currency) : "—"}
                              </div>
                            )}
                            {splitMode === "amount" && isInc && (
                              <Input 
                                type="number" step="0.01" 
                                value={memberAmounts[member.id] || ""} 
                                onChange={e => setMemberAmounts(p => ({...p, [member.id]: e.target.value}))}
                                placeholder="0.00"
                                className="text-right h-9"
                              />
                            )}
                            {splitMode === "shares" && isInc && (
                              <div className="flex items-center gap-2 justify-end">
                                <Input 
                                  type="number" step="0.1" 
                                  value={memberShares[member.id] || ""} 
                                  onChange={e => setMemberShares(p => ({...p, [member.id]: e.target.value}))}
                                  className="w-16 text-right h-9"
                                />
                                <span className="text-sm text-muted-foreground">shares</span>
                              </div>
                            )}
                            {!isInc && splitMode !== "equal" && (
                              <span className="text-muted-foreground px-4">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {splitMode === "amount" && (
                    <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-sm font-medium">
                      <span>Total Allocated:</span>
                      <span className={Math.abs(Object.keys(includedMembers).filter(id => includedMembers[Number(id)]).reduce((s, id) => s + (Number(memberAmounts[Number(id)]) || 0), 0) - totalAmountNum) > 0.01 ? "text-destructive" : "text-success"}>
                        {formatCurrency(Object.keys(includedMembers).filter(id => includedMembers[Number(id)]).reduce((s, id) => s + (Number(memberAmounts[Number(id)]) || 0), 0), group.currency)} 
                        <span className="text-muted-foreground font-normal ml-1">of {formatCurrency(totalAmountNum, group.currency)}</span>
                      </span>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl shadow-md" disabled={createExpense.isPending || updateExpense.isPending}>
            {createExpense.isPending || updateExpense.isPending ? "Saving..." : isNew ? "Save Expense" : "Update Expense"}
          </Button>
        </form>
      </div>
    </div>
  );
}
