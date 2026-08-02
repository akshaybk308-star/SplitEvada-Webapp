import { useRoute, Link, useLocation } from "wouter";
import { TopNav } from "@/components/ui/top-nav";
import {
  useGetGroup,
  useGetGroupSummary,
  useListExpenses,
  useListMembers,
  useGetBalances,
  useGetSettlements,
  useListPayments,
  useAddMember,
  useRemoveMember,
  useRecordPayment,
  useDeleteExpense,
  useDeletePayment,
  useUpdateGroup,
  useDeleteGroup,
  getGetGroupQueryKey,
  getGetGroupSummaryQueryKey,
  getListExpensesQueryKey,
  getListMembersQueryKey,
  getGetBalancesQueryKey,
  getGetSettlementsQueryKey,
  getListPaymentsQueryKey,
  getListGroupsQueryKey,
} from "@workspace/api-client-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Tabs, TabsList, TabsTrigger, TabsContent, Avatar, AvatarFallback, Badge, Skeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Plus, Receipt, Users, CreditCard, ArrowRight, ArrowRightLeft, UserPlus, Trash2, Settings, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

function GroupSettingsDialog({ group, trigger }: { group: any, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [currency, setCurrency] = useState(group.currency || "USD");
  
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (open) {
      setName(group.name);
      setDescription(group.description || "");
      setCurrency(group.currency || "USD");
    }
  }, [open, group]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateGroup.mutate({ groupId: group.id, data: { name, description, currency } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGroupQueryKey(group.id) });
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setOpen(false);
        toast({ title: "Group updated" });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this group? All expenses and payments will be permanently lost.")) {
      deleteGroup.mutate({ groupId: group.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
          toast({ title: "Group deleted" });
          setLocation("/");
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteGroup.isPending}>
              Delete Group
            </Button>
            <div className="space-x-2 flex">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name.trim() || updateGroup.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({ groupId }: { groupId: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const addMember = useAddMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember.mutate(
      { groupId, data: { name, email } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMembersQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetGroupSummaryQueryKey(groupId) });
          setOpen(false);
          setName("");
          setEmail("");
          toast({ title: "Member added" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || addMember.isPending}>
              {addMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ groupId, defaultFrom, defaultTo, defaultAmount, trigger }: { groupId: number, defaultFrom?: number, defaultTo?: number, defaultAmount?: number, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState<string>(defaultFrom ? String(defaultFrom) : "");
  const [toId, setToId] = useState<string>(defaultTo ? String(defaultTo) : "");
  const [amount, setAmount] = useState<string>(defaultAmount ? String(defaultAmount) : "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: members } = useListMembers(groupId, { query: { queryKey: getListMembersQueryKey(groupId) } });
  const recordPayment = useRecordPayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !amount) return;

    recordPayment.mutate(
      { groupId, data: { fromMemberId: Number(fromId), toMemberId: Number(toId), amount: Number(amount), date } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetBalancesQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetSettlementsQueryKey(groupId) });
          setOpen(false);
          toast({ title: "Payment recorded" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Who paid?</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members?.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Who received?</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members?.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!fromId || !toId || !amount || fromId === toId || recordPayment.isPending}>
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GroupDashboard() {
  const [, params] = useRoute("/groups/:groupId");
  const groupId = Number(params?.groupId);

  const { data: group, isLoading: groupLoading } = useGetGroup(groupId, { query: { enabled: !!groupId, queryKey: getGetGroupQueryKey(groupId) } });
  const { data: summary } = useGetGroupSummary(groupId, { query: { enabled: !!groupId, queryKey: getGetGroupSummaryQueryKey(groupId) } });
  const { data: expenses } = useListExpenses(groupId, { query: { enabled: !!groupId, queryKey: getListExpensesQueryKey(groupId) } });
  const { data: members } = useListMembers(groupId, { query: { enabled: !!groupId, queryKey: getListMembersQueryKey(groupId) } });
  const { data: balances } = useGetBalances(groupId, { query: { enabled: !!groupId, queryKey: getGetBalancesQueryKey(groupId) } });
  const { data: settlements } = useGetSettlements(groupId, { query: { enabled: !!groupId, queryKey: getGetSettlementsQueryKey(groupId) } });
  const { data: payments } = useListPayments(groupId, { query: { enabled: !!groupId, queryKey: getListPaymentsQueryKey(groupId) } });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteExpense = useDeleteExpense();
  const deletePayment = useDeletePayment();
  const removeMember = useRemoveMember();

  if (groupLoading) {
    return <div className="p-8 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  }
  if (!group) return <div className="p-8 text-center">Group not found</div>;

  return (
    <div className="min-h-screen bg-background pb-12">
      <TopNav title={group.name} backTo="/" action={<GroupSettingsDialog group={group} />} />

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary text-primary-foreground border-transparent">
            <CardContent className="p-6">
              <p className="text-primary-foreground/80 font-medium mb-1">Total Spent</p>
              <h2 className="text-3xl font-bold">{formatCurrency(summary?.totalSpent || 0, group.currency)}</h2>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Expenses</p>
                <h2 className="text-2xl font-bold">{summary?.expenseCount || 0}</h2>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-accent rounded-full text-accent-foreground">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Members</p>
                <h2 className="text-2xl font-bold">{summary?.memberCount || 0}</h2>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <div>
              <Link href={`/groups/${groupId}/expenses/new`}>
                <Button className="w-full sm:w-auto shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="expenses" className="space-y-4 outline-none">
            {!expenses || expenses.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No expenses yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">Start tracking your shared costs.</p>
                <Link href={`/groups/${groupId}/expenses/new`}>
                  <Button variant="outline">Add your first expense</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <Link href={`/groups/${groupId}/expenses/${exp.id}`} key={exp.id} className="block group">
                    <Card className="transition-colors hover:border-primary/40 hover:shadow-sm">
                      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex h-12 w-12 rounded-full bg-secondary/50 items-center justify-center text-muted-foreground text-sm font-medium">
                            {format(parseISO(exp.date), "MMM d")}
                          </div>
                          <div>
                            <h4 className="font-medium text-lg group-hover:text-primary transition-colors">{exp.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>Paid by {exp.payerName}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs font-normal px-2 py-0">
                                {exp.splitMode}
                              </Badge>
                              {exp.productSize && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px]">{exp.productSize}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-lg">{formatCurrency(exp.amount, group.currency)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances" className="space-y-6 outline-none">
            {settlements && settlements.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  How to settle up
                </h3>
                <div className="grid gap-3">
                  {settlements.map((settle, i) => (
                    <Card key={i} className="bg-card border-card-border overflow-hidden">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(settle.fromMemberName)}</AvatarFallback></Avatar>
                          <span className="font-medium">{settle.fromMemberName}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(settle.toMemberName)}</AvatarFallback></Avatar>
                          <span className="font-medium">{settle.toMemberName}</span>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className="font-bold text-lg">{formatCurrency(settle.amount, group.currency)}</span>
                          <RecordPaymentDialog 
                            groupId={groupId} 
                            defaultFrom={settle.fromMemberId} 
                            defaultTo={settle.toMemberId} 
                            defaultAmount={settle.amount}
                            trigger={<Button size="sm">Record</Button>}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Group Balances</h3>
                <AddMemberDialog groupId={groupId} />
              </div>
              <Card>
                <div className="divide-y divide-border">
                  {balances?.map((bal) => (
                    <div key={bal.memberId} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                            {getInitials(bal.memberName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{bal.memberName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        {bal.netBalance > 0 ? (
                          <span className="text-success font-semibold">gets back {formatCurrency(bal.netBalance, group.currency)}</span>
                        ) : bal.netBalance < 0 ? (
                          <span className="text-destructive font-semibold">owes {formatCurrency(Math.abs(bal.netBalance), group.currency)}</span>
                        ) : (
                          <span className="text-muted-foreground">settled up</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (bal.netBalance !== 0) {
                              toast({ variant: "destructive", title: "Cannot remove member", description: "Settle balances first before removing this member." });
                              return;
                            }
                            if (confirm(`Remove ${bal.memberName} from the group?`)) {
                              removeMember.mutate({ groupId, memberId: bal.memberId }, {
                                onSuccess: () => {
                                  queryClient.invalidateQueries({ queryKey: getListMembersQueryKey(groupId) });
                                  queryClient.invalidateQueries({ queryKey: getGetBalancesQueryKey(groupId) });
                                  queryClient.invalidateQueries({ queryKey: getGetGroupSummaryQueryKey(groupId) });
                                  toast({ title: "Member removed" });
                                }
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!balances || balances.length === 0) && (
                    <div className="p-8 text-center text-muted-foreground">No members in this group yet.</div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 outline-none">
            <div className="flex justify-end mb-4">
              <RecordPaymentDialog groupId={groupId} />
            </div>
            {!payments || payments.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No payments yet</h3>
                <p className="text-muted-foreground mt-1">Record payments to settle balances.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <Card key={pay.id}>
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-10 w-10 rounded-full bg-success/10 text-success items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {pay.fromMemberName} paid {pay.toMemberName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(pay.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-success">
                          {formatCurrency(pay.amount, group.currency)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this payment?")) {
                              deletePayment.mutate({ groupId, paymentId: pay.id }, {
                                onSuccess: () => {
                                  queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(groupId) });
                                  queryClient.invalidateQueries({ queryKey: getGetBalancesQueryKey(groupId) });
                                  queryClient.invalidateQueries({ queryKey: getGetSettlementsQueryKey(groupId) });
                                  toast({ title: "Payment deleted" });
                                }
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
