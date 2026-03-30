import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Skeleton,
} from '@chakra-ui/react';
import { useLabOrderByPatientQuery } from '../hooks/use-labs';
import type { LabOrder } from '@dental-ms/shared-types';
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export function PatientLabOrdersTab({ patientId }: { patientId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = useLabOrderByPatientQuery(patientId);
  const orders = data?.data ?? [];

  if (isLoading) {
    return <Skeleton height="120px" />;
  }

  return (
    <Box>
      <Heading size="sm" mb={4}>Lab Orders</Heading>
      {orders.length === 0 ? (
        <Text color="gray.500" fontSize="sm">No lab orders for this patient.</Text>
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Order #</Th>
              <Th>Work Type</Th>
              <Th>Vendor</Th>
              <Th>Status</Th>
              <Th>Sent</Th>
              <Th>Delivery</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((o: LabOrder) => (
              <Tr
                key={o.id}
                _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
                cursor="pointer"
                onClick={() => navigate(`/labs/orders/${o.id}`)}
              >
                <Td fontWeight="medium">{o.orderNumber}</Td>
                <Td>{o.customWorkType || o.workType?.replace(/_/g, ' ')}</Td>
                <Td>{o.vendor?.name ?? '—'}</Td>
                <Td>
                  <Badge colorScheme={STATUS_COLORS[o.status] ?? 'gray'}>
                    {o.status?.replace(/_/g, ' ')}
                  </Badge>
                </Td>
                <Td>{o.sentToLabAt ? fmtDate(o.sentToLabAt) : '—'}</Td>
                <Td>{o.finalDeliveryDate ? fmtDate(o.finalDeliveryDate) : '—'}</Td>
                <Td textAlign="right">
                  <Button size="sm" variant="link" colorScheme="teal" onClick={(e) => { e.stopPropagation(); navigate(`/labs/orders/${o.id}`); }}>
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
