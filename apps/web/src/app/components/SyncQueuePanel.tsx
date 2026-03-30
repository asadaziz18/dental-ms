import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  useToast,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  getSyncQueueItems,
  deleteSyncQueueItem,
  clearSyncQueue,
  invalidateSyncQueries,
  syncQueueItemsKey,
} from '@/core/sync';
import type { SyncQueueRecord } from '@/core/db/schema';

function formatQueueItem(item: SyncQueueRecord & { id: number }): string {
  const { entity, operation } = item;
  const payload = item.payload as Record<string, unknown>;
  const name = payload?.fullName ?? payload?.email ?? payload?.id ?? entity;
  return `${entity} ${operation} · ${String(name)}`;
}

function SyncQueuePanelBody({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: items = [], isLoading } = useQuery({
    queryKey: syncQueueItemsKey,
    queryFn: getSyncQueueItems,
    enabled: isOpen,
  });

  const handleRemove = async (id: number) => {
    try {
      await deleteSyncQueueItem(id);
      invalidateSyncQueries(queryClient);
      toast({ title: 'Removed from queue', status: 'info', duration: 2000, isClosable: true });
    } catch {
      toast({ title: 'Could not remove item', status: 'error', isClosable: true });
    }
  };

  const handleClearAll = async () => {
    try {
      const count = await clearSyncQueue();
      invalidateSyncQueries(queryClient);
      toast({
        title: count === 1 ? '1 item cleared' : `${count} items cleared`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({ title: 'Could not clear queue', status: 'error', isClosable: true });
    }
  };

  return (
    <>
      <Text fontWeight="600" mb={2} fontSize="sm">
        Pending sync ({items.length})
      </Text>
      {isLoading ? (
        <HStack justify="center" py={4}>
          <Spinner size="sm" />
        </HStack>
      ) : items.length === 0 ? (
        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
          Queue is empty
        </Text>
      ) : (
        <VStack align="stretch" spacing={2} maxH="240px" overflowY="auto">
          {items.map((item) => (
            <HStack
              key={item.id!}
              justify="space-between"
              p={2}
              borderRadius="md"
              bg="gray.50"
              _dark={{ bg: 'gray.800' }}
            >
              <Box flex={1} minW={0}>
                <Text fontSize="sm" noOfLines={1} title={formatQueueItem(item)}>
                  {formatQueueItem(item)}
                </Text>
                {(item.retryCount ?? 0) > 0 && (
                  <Text fontSize="xs" color="orange.600" _dark={{ color: 'orange.400' }}>
                    {item.retryCount} retries
                  </Text>
                )}
              </Box>
              <IconButton
                aria-label="Remove from queue"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={() => {
                  handleRemove(item.id!);
                  onClose();
                }}
              />
            </HStack>
          ))}
        </VStack>
      )}
      {items.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          mt={3}
          w="full"
          onClick={() => {
            handleClearAll();
            onClose();
          }}
        >
          Clear all
        </Button>
      )}
    </>
  );
}

export function SyncQueuePanel() {
  return (
    <Popover isLazy placement="bottom-end">
      {({ isOpen, onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              size="xs"
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-label="View sync queue"
            >
              View queue
            </Button>
          </PopoverTrigger>
          <PopoverContent _focusVisible={{ outline: 'none' }} maxW="sm">
            <PopoverCloseButton />
            <PopoverBody pt={8} pb={4}>
              <SyncQueuePanelBody isOpen={isOpen} onClose={onClose} />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
