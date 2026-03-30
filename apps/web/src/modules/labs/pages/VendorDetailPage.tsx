import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Skeleton,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { EditIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useLabVendorQuery, useLabOrdersQuery } from '../hooks/use-labs';
import type { LabOrder } from '@dental-ms/shared-types';

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useLabVendorQuery(id);
  const { data: ordersData } = useLabOrdersQuery({ vendorId: id ?? '', limit: 50 });

  const vendor = data?.vendor;
  const activeOrdersCount = data?.activeOrdersCount ?? 0;
  const orders = ordersData?.data ?? [];

  if (isLoading || !vendor) {
    return <Skeleton height="300px" />;
  }

  return (
    <Box>
      <Button leftIcon={<ArrowBackIcon />} variant="ghost" size="sm" mb={4} onClick={() => navigate('/labs/vendors')}>
        Back to vendors
      </Button>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">{vendor.name}</Heading>
          <Badge colorScheme={vendor.isActive ? 'green' : 'gray'} mt={2}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Box>
        <Button leftIcon={<EditIcon />} colorScheme="teal" variant="outline" onClick={() => navigate(`/labs/vendors/${id}/edit`)}>
          Edit
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Contact</Heading>
            <VStack align="stretch" spacing={2}>
              <Text><strong>Contact person:</strong> {vendor.contactPerson}</Text>
              <Text><strong>Phone:</strong> {vendor.phone}</Text>
              {vendor.whatsapp && <Text><strong>WhatsApp:</strong> {vendor.whatsapp}</Text>}
              {vendor.email && <Text><strong>Email:</strong> {vendor.email}</Text>}
              {vendor.address && <Text><strong>Address:</strong> {vendor.address}</Text>}
              <Text><strong>City:</strong> {vendor.city}</Text>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Summary</Heading>
            <VStack align="stretch" spacing={2}>
              <Text><strong>Active orders:</strong> {activeOrdersCount}</Text>
              <Text><strong>Specializations:</strong></Text>
              <HStack gap={2} flexWrap="wrap">
                {(vendor.specializations || []).map((s: string) => (
                  <Badge key={s} variant="subtle">{s.replace(/_/g, ' ')}</Badge>
                ))}
              </HStack>
              {vendor.notes && <Text><strong>Notes:</strong> {vendor.notes}</Text>}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {orders.length > 0 && (
        <Box mt={8}>
          <Heading size="sm" mb={4}>Recent orders</Heading>
          <VStack align="stretch" spacing={2}>
            {orders.slice(0, 10).map((o: LabOrder) => (
              <HStack
                key={o.id}
                p={2}
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
                onClick={() => navigate(`/labs/orders/${o.id}`)}
              >
                <Text fontWeight="medium">{o.orderNumber}</Text>
                <Badge>{o.status?.replace(/_/g, ' ')}</Badge>
                <Text fontSize="sm" color="gray.500">
                  {o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—'}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
