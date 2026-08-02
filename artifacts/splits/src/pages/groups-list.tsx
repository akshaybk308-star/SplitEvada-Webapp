import { Link } from "wouter";
import { Plus, Users, Receipt, ArrowRight } from "lucide-react";
import {
  useListGroups,
  useCreateGroup,
  getListGroupsQueryKey,
  useGetGroupSummary,
  Group,
} from "@workspace/api-client-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from "@/components/ui";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getInitials } from "@/lib/utils";

function GroupCard({ group }: { group: Group }) {
  const { data: summary, isLoading } = useGetGroupSummary(group.id, {
    query: { enabled: !!group.id, queryKey: [`/api/groups/${group.id}/summary`] },
  });

  return (
    <Link href={`/groups/${group.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                {getInitials(group.name)}
              </div>
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {group.name}
                </CardTitle>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary/70" />
                <span>{summary?.memberCount || 0} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary/70" />
                <span className="font-medium text-foreground">
                  {formatCurrency(summary?.totalSpent || 0, group.currency)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateGroupDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createGroup = useCreateGroup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup.mutate(
      { data: { name, description, currency } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
          setOpen(false);
          setName("");
          setDescription("");
          setCurrency("USD");
          toast({
            title: "Group created",
            description: "Your new group is ready.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create group.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g. Ski Trip 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Expenses for the cabin"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              placeholder="USD"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createGroup.isPending}>
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GroupsList() {
  const { data: groups, isLoading } = useListGroups({
    query: { queryKey: getListGroupsQueryKey() },
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-12 sm:pt-20">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">SplitTab</h1>
            <p className="text-lg text-muted-foreground">
              Keep track of shared expenses, gracefully.
            </p>
          </div>
          <CreateGroupDialog>
            <Button size="lg" className="w-full sm:w-auto shadow-md">
              <Plus className="mr-2 h-5 w-5" />
              New Group
            </Button>
          </CreateGroupDialog>
        </header>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No groups yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first group to start splitting bills with friends, roommates, or travel buddies.
            </p>
            <CreateGroupDialog>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create your first group
              </Button>
            </CreateGroupDialog>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
