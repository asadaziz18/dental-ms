import { useState } from 'react';
import { Box, Button, HStack, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { useSyncStatus } from '@/shared/hooks/useSyncStatus';
import { triggerSyncNow } from '@/core/sync';
import { SyncQueuePanel } from './SyncQueuePanel';
import type { SyncState } from '@/shared/hooks/useSyncStatus';

const statusConfig: Record<
  SyncState,
  { label: string; light: { color: string; bg: string }; dark: { color: string; bg: string }; icon: string }
> = {
  online: {
    label: 'Synced',
    icon: '✓',
    light: { color: 'green.700', bg: 'green.50' },
    dark: { color: 'green.300', bg: 'green.900' },
  },
  offline: {
    label: 'Offline',
    icon: '!',
    light: { color: 'red.700', bg: 'red.50' },
    dark: { color: 'red.300', bg: 'red.900' },
  },
  syncing: {
    label: 'Syncing…',
    icon: '⟳',
    light: { color: 'yellow.700', bg: 'yellow.50' },
    dark: { color: 'yellow.300', bg: 'yellow.900' },
  },
};

export function SyncStatusBanner() {
  const { status, pendingCount, isOnline } = useSyncStatus();
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();
  const config = statusConfig[status];
  const color = useColorModeValue(config.light.color, config.dark.color);
  const bg = useColorModeValue(config.light.bg, config.dark.bg);
  const label = status === 'syncing' && pendingCount > 0 ? `${config.label} (${pendingCount})` : config.label;

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const { processed, failed } = await triggerSyncNow();
      if (failed > 0) {
        toast({
          title: failed === 1 ? '1 item could not be synced' : `${failed} items could not be synced`,
          description: 'Check your connection or try again. Failed items stay in the queue.',
          status: 'warning',
          isClosable: true,
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box px={2} py={1} borderRadius="md" bg={bg} color={color} fontSize="sm" fontWeight="medium">
      <HStack spacing={2}>
        <Text as="span" aria-hidden>{config.icon}</Text>
        <Text>{label}</Text>
        {isOnline && pendingCount > 0 && (
          <>
            <Button
              size="xs"
              variant="outline"
              colorScheme="yellow"
              onClick={handleSyncNow}
              isLoading={syncing}
              _dark={{ borderColor: 'yellow.400', color: 'yellow.300' }}
            >
              Sync now
            </Button>
            <SyncQueuePanel />
          </>
        )}
      </HStack>
    </Box>
  );
}
