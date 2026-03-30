import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { useAllInvoicesQuery, useRefreshSubscription } from '../hooks/use-subscription';
import { subscriptionApi } from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionKeys } from '../hooks/use-subscription';

export function SuperAdminInvoicesPage() {
  const { data: invoices = [], isLoading } = useAllInvoicesQuery();
  const qc = useQueryClient();
  const toast = useToast();
  const refresh = useRefreshSubscription();

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.markInvoicePaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.invoicesAll() });
      refresh();
      toast({ title: 'Invoice marked as paid', status: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, status: 'error' }),
  });

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Invoices
      </Heading>
      {isLoading ? (
        <Skeleton height="200px" />
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Branch</Th>
              <Th>Amount</Th>
              <Th>Due date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoices.map((inv) => (
              <Tr key={inv.id}>
                <Td>{inv.invoiceNumber}</Td>
                <Td>{(inv as { branch?: { name: string } }).branch?.name ?? inv.branchId}</Td>
                <Td>${Number(inv.amount).toFixed(2)}</Td>
                <Td>{new Date(inv.dueDate).toLocaleDateString()}</Td>
                <Td>
                  <Badge colorScheme={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'gray'}>
                    {inv.status}
                  </Badge>
                </Td>
                <Td>
                  {inv.status === 'sent' || inv.status === 'overdue' ? (
                    <Button
                      size="xs"
                      colorScheme="teal"
                      onClick={() => markPaidMutation.mutate(inv.id)}
                      isLoading={markPaidMutation.isPending}
                    >
                      Mark as paid
                    </Button>
                  ) : null}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
