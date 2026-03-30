import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Skeleton,
  TableContainer,
} from '@chakra-ui/react';
import { AddIcon, Search2Icon } from '@chakra-ui/icons';
import { useLabOrdersQuery } from '../hooks/use-labs';
import type { LabOrder } from '@dental-ms/shared-types';
import { useBranchId } from '@/core/branch';
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  sent_to_lab: 'blue',
  trial_scheduled: 'purple',
  trial_in_progress: 'yellow',
  approved: 'teal',
  delivered: 'green',
  cancelled: 'red',
  rejected: 'orange',
};

export function LabOrderListPage() {
  const navigate = useNavigate();
  const branchId = useBranchId();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useLabOrdersQuery({
    branchId: branchId ?? undefined,
    search: search || undefined,
    status: status || undefined,
    page,
    limit,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  const patientName = (o: { patient?: { firstName?: string; lastName?: string } }) =>
    o.patient ? `${o.patient.firstName ?? ''} ${o.patient.lastName ?? ''}`.trim() || '—' : '—';

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">Lab Orders</Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }} mt={1}>
            Track orders sent to labs, trials, and delivery.
          </Text>
        </Box>
        <Button leftIcon={<AddIcon />} colorScheme="teal" as={RouterLink} to="/labs/orders/new">
          New Lab Order
        </Button>
      </HStack>

      <HStack gap={4} mb={4} flexWrap="wrap">
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Order # or patient name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </InputGroup>
        <Select
          placeholder="Status"
          maxW="40"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </HStack>

      {isLoading ? (
        <Skeleton height="300px" />
      ) : (
        <>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Order #</Th>
                  <Th>Patient</Th>
                  <Th>Doctor</Th>
                  <Th>Vendor</Th>
                  <Th>Work Type</Th>
                  <Th>Tooth(s)</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Sent</Th>
                  <Th>Expected Trial</Th>
                  <Th>Delivery</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.length === 0 ? (
                  <Tr>
                    <Td colSpan={12} color="gray.500" py={8} textAlign="center">
                      No orders found.
                    </Td>
                  </Tr>
                ) : (
                  orders.map((o: LabOrder) => (
                    <Tr key={o.id} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}>
                      <Td fontWeight="medium">{o.orderNumber}</Td>
                      <Td>{patientName(o)}</Td>
                      <Td>{o.doctor?.fullName ?? '—'}</Td>
                      <Td>{o.vendor?.name ?? '—'}</Td>
                      <Td>{o.customWorkType || o.workType?.replace(/_/g, ' ')}</Td>
                      <Td>{(o.toothNumbers || []).join(', ') || '—'}</Td>
                      <Td>
                        <Badge colorScheme={STATUS_COLORS[o.status] ?? 'gray'}>
                          {o.status?.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={o.priority === 'urgent' ? 'red' : 'gray'} size="sm">
                          {o.priority}
                        </Badge>
                      </Td>
                      <Td>{o.sentToLabAt ? fmtDate(o.sentToLabAt) : '—'}</Td>
                      <Td>{o.expectedTrialDate ? fmtDate(o.expectedTrialDate) : '—'}</Td>
                      <Td>{o.finalDeliveryDate ? fmtDate(o.finalDeliveryDate) : '—'}</Td>
                      <Td textAlign="right">
                        <Button size="sm" variant="link" colorScheme="teal" onClick={() => navigate(`/labs/orders/${o.id}`)}>
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
          {total > limit && (
            <HStack mt={4} gap={2}>
              <Button size="sm" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Text fontSize="sm">Page {page} of {Math.ceil(total / limit)}</Text>
              <Button size="sm" isDisabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </HStack>
          )}
        </>
      )}
    </Box>
  );
}
