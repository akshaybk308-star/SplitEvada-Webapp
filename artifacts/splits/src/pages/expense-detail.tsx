import { useRoute, Link, useLocation } from "wouter";
import { TopNav } from "@/components/ui/top-nav";
import { useGetExpense, useGetGroup, useDeleteExpense, getListExpensesQueryKey, getGetGroupSummaryQueryKey, getGetBalancesQueryKey, getGetSettlementsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { formatCurrency, getInitials } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Trash2, Edit, Calendar, FileText, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ExpenseDetail() {
  const [, params] = useRoute("/groups/:groupId/expenses/:expenseId");
  const groupId = Number(params?.groupId);
  const expenseId = Number(params?.expenseId);
  const [, setLocation] = useLocation();

  const { data: group } = useGetGroup(groupId, { query: { enabled: !!groupId, queryKey: [`/api/groups/${groupId}`] } });
  const { data: expenseDetail, isLoading } = useGetExpense(groupId, expenseId, { 
    query: { enabled: !!groupId && !!expenseId, queryKey: [`/api/groups/${groupId}/expenses/${expenseId}`] } 
  });

  const deleteExpense = useDeleteExpense();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      deleteExpense.mutate({ groupId, expenseId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetGroupSummaryQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetBalancesQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getGetSettlementsQueryKey(groupId) });
          toast({ title: "Expense deleted" });
          setLocation(`/groups/${groupId}`);
        }
      });
    }
  };

  if (isLoading || !group) return <div className="p-8 text-center">Loading...</div>;
  if (!expenseDetail) return <div className="p-8 text-center">Expense not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav 
        title="Expense Details" 
        backTo={`/groups/${groupId}`} 
        action={
          <div className="flex items-center gap-2">
            <Link href={`/groups/${groupId}/expenses/${expenseId}/edit`} className="p-2 text-muted-foreground hover:text-foreground">
              <Edit className="h-5 w-5" />
            </Link>
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">{expenseDetail.splitMode} split</Badge>
          <h1 className="text-4xl font-bold mb-2">{expenseDetail.title}</h1>
          <div className="text-4xl font-bold text-primary mb-6">
            {formatCurrency(expenseDetail.amount, group.currency)}
          </div>
          <p className="text-muted-foreground text-lg">
            Paid by <span className="font-semibold text-foreground">{expenseDetail.payerName}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Date</p>
                <p className="font-medium">{format(parseISO(expenseDetail.date), "MMM d, yyyy")}</p>
              </div>
            </CardContent>
          </Card>
          {(expenseDetail.productSize || expenseDetail.notes) && (
            <Card className="bg-card">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                {expenseDetail.productSize && (
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{expenseDetail.productSize}</span>
                  </div>
                )}
                {expenseDetail.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground line-clamp-2">{expenseDetail.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-4 px-1">How it was split</h3>
        <Card>
          <div className="divide-y divide-border">
            {expenseDetail.splits.map(split => (
              <div key={split.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                    {getInitials(split.memberName)}
                  </div>
                  <div>
                    <p className="font-medium">{split.memberName}</p>
                    {expenseDetail.splitMode === "shares" && (
                      <p className="text-xs text-muted-foreground">{split.shares} shares</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatCurrency(split.owedAmount, group.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
