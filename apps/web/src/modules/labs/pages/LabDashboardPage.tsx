import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Button,
  Badge,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import { useLabDashboardQuery } from '../hooks/use-labs';
import type { LabOrder, LabTrial } from '@dental-ms/shared-types';
function fmtDate(d: string | Date): string {
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

const CAN_ADD_VENDOR_ROLES = ['SuperAdmin', 'BranchAdmin'];

export function LabDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useLabDashboardQuery();
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const canAddVendor = user?.role && CAN_ADD_VENDOR_ROLES.includes(user.role);

  if (isLoading || !data) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Lab Management</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="80px" borderRadius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height="300px" />
      </Box>
    );
  }

  const { activeOrders, trialsThisWeek, awaitingDelivery, overdueOrders, upcomingTrials, recentOrders } = data;

  return (
    <Box>
      <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4} mb={6}>
        <Box>
          <Heading size="lg" mb={2}>Lab Management</Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Track lab orders, trials, and patient notifications.
          </Text>
        </Box>
        <HStack gap={3}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            onClick={() => navigate('/labs/vendors')}
          >
            View Vendors
          </Button>
          {canAddVendor && (
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              colorScheme="teal"
              onClick={() => navigate('/labs/vendors/new')}
            >
              Add vendor
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={() => navigate('/labs/orders/new')}
          >
            New lab order
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Active Orders</Text>
            <Heading size="lg">{activeOrders}</Heading>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Trials This Week</Text>
            <Heading size="lg">{trialsThisWeek}</Heading>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody>
            <Text fontSize="sm" color="gray.500">Awaiting Delivery</Text>
            <Heading size="lg">{awaitingDelivery}</Heading>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderColor={overdueOrders > 0 ? 'red.400' : undefined} borderWidth={overdueOrders > 0 ? 1 : 0}>
          <CardBody>
            <Text fontSize="sm" color={overdueOrders > 0 ? 'red.500' : 'gray.500'}>Overdue Orders</Text>
            <Heading size="lg" color={overdueOrders > 0 ? 'red.500' : undefined}>{overdueOrders}</Heading>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Upcoming Trials (next 7 days)</Heading>
          </CardHeader>
          <CardBody pt={0}>
            {upcomingTrials.length === 0 ? (
              <Text color="gray.500" fontSize="sm">No trials scheduled.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {upcomingTrials.map(({ trial, order, patient, vendor }: { trial: LabTrial; order: LabOrder; patient: { firstName: string; lastName: string }; vendor: { name: string } }) => (
                  <Box
                    key={trial.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                  >
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">
                          {fmtDate(trial.trialDate)} — Trial #{trial.trialNumber}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {patient.firstName} {patient.lastName} · {order.orderNumber} · {vendor.name}
                        </Text>
                        <Badge colorScheme={STATUS_COLORS[order.status] ?? 'gray'} size="sm" mt={1}>
                          {order.status?.replace(/_/g, ' ')}
                        </Badge>
                      </VStack>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={() => navigate(`/labs/orders/${order.id}`)}
                      >
                        View / Mark Complete
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Recent Orders</Heading>
          </CardHeader>
          <CardBody pt={0}>
            {recentOrders.length === 0 ? (
              <Text color="gray.500" fontSize="sm">No orders yet.</Text>
            ) : (
              <VStack align="stretch" spacing={2}>
                {recentOrders.map((order: LabOrder) => (
                  <HStack
                    key={order.id}
                    justify="space-between"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onClick={() => navigate(`/labs/orders/${order.id}`)}
                  >
                    <Box>
                      <Text fontWeight="medium">{order.orderNumber}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : '—'} · {order.vendor?.name ?? '—'}
                      </Text>
                    </Box>
                    <Badge colorScheme={STATUS_COLORS[order.status] ?? 'gray'}>
                      {order.status?.replace(/_/g, ' ')}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
