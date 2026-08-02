import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import GroupsList from '@/pages/groups-list';
import GroupDashboard from '@/pages/group-dashboard';
import ExpenseForm from '@/pages/expense-form';
import ExpenseDetail from '@/pages/expense-detail';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={GroupsList} />
      <Route path="/groups/:groupId/expenses/new" component={ExpenseForm} />
      <Route path="/groups/:groupId/expenses/:expenseId/edit" component={ExpenseForm} />
      <Route path="/groups/:groupId/expenses/:expenseId" component={ExpenseDetail} />
      <Route path="/groups/:groupId" component={GroupDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
