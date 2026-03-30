import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton, Text, VStack, Badge } from '@chakra-ui/react';
import type { LowStockItem } from '../api';

interface LowStockAlertsProps {
  items: LowStockItem[] | undefined;
  isLoading: boolean;
}

export function LowStockAlerts({ items, isLoading }: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
        <Skeleton height="6" mb={4} />
        <Skeleton height="80px" />
      </Box>
    );
  }

  const list = items ?? [];

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="600" fontSize="lg">
          Low Stock
          {list.length > 0 && (
            <Badge ml={2} colorScheme="orange">
              {list.length}
            </Badge>
          )}
        </Text>
        <Button as={RouterLink} to="/inventory" size="xs" variant="link" colorScheme="teal">
          Manage Inventory
        </Button>
      </Box>
      {list.length === 0 ? (
        <Text color="gray.500" py={6} textAlign="center" fontSize="sm">
          All stock levels are healthy ✅
        </Text>
      ) : (
        <VStack align="stretch" spacing={2}>
          {list.slice(0, 5).map((item) => (
            <Box
              key={item.itemId}
              p={2}
              borderRadius="md"
              borderWidth="1px"
              borderColor="orange.200"
              _dark={{ borderColor: 'orange.800' }}
            >
              <Text fontSize="sm" fontWeight="500">
                {item.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {item.sku} · Qty: {item.currentQuantity} (reorder at {item.reorderThreshold})
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
