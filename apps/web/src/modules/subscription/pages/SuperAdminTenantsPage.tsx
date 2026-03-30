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
  Select,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { useTenantsQuery, usePlansQuery, useRefreshSubscription } from '../hooks/use-subscription';
import { subscriptionApi } from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionKeys } from '../hooks/use-subscription';

const statusColor: Record<string, string> = {
  active: 'green',
  trialing: 'blue',
  grace: 'orange',
  suspended: 'red',
  past_due: 'orange',
  cancelled: 'gray',
};

export function SuperAdminTenantsPage() {
  const { data: tenants = [], isLoading } = useTenantsQuery();
  const { data: plans = [] } = usePlansQuery(false);
  const qc = useQueryClient();
  const toast = useToast();
  const refresh = useRefreshSubscription();

  const assignMutation = useMutation({
    mutationFn: ({ branchId, planId, trialDays }: { branchId: string; planId: string; trialDays?: number }) =>
      subscriptionApi.assignPlan(branchId, planId, trialDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.tenants() });
      refresh();
      toast({ title: 'Plan assigned', status: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, status: 'error' }),
  });

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Tenants
      </Heading>
      {isLoading ? (
        <Skeleton height="200px" />
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Branch</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Period end</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tenants.map((t) => (
              <Tr key={t.branchId}>
                <Td>
                  <Box fontWeight="medium">{t.branchName}</Box>
                  {t.branchAddress && (
                    <Box fontSize="xs" color="gray.500">
                      {t.branchAddress}
                    </Box>
                  )}
                </Td>
                <Td>
                  <Badge colorScheme="teal">{t.planName ?? '—'}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme={t.status ? statusColor[t.status] ?? 'gray' : 'gray'}>
                    {t.status ?? 'No plan'}
                  </Badge>
                </Td>
                <Td>{t.currentPeriodEnd ? new Date(t.currentPeriodEnd).toLocaleDateString() : '—'}</Td>
                <Td>
                  <Select
                    size="sm"
                    maxW="40"
                    placeholder="Assign plan"
                    value=""
                    onChange={(e) => {
                      const planId = e.target.value;
                      if (!planId) return;
                      assignMutation.mutate({ branchId: t.branchId, planId });
                      e.target.value = '';
                    }}
                    isDisabled={assignMutation.isPending}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
