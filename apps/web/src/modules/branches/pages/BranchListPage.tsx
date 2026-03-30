import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Badge,
  Input,
  Select,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import { useBranchTree, useDeleteBranchMutation, useUpdateBranchStatusMutation } from '../hooks/use-branches';
import type { BranchTreeItem } from '../api';
import { useSyncStatus } from '@/shared/hooks/useSyncStatus';
import { getBranchesListLastFetched } from '../hooks/use-branches';
import { useEffect } from 'react';

function flattenBranches(items: BranchTreeItem[]): BranchTreeItem[] {
  const out: BranchTreeItem[] = [];
  for (const b of items) {
    out.push(b);
    if (b.subBranches?.length) out.push(...flattenBranches(b.subBranches));
  }
  return out;
}

export function BranchListPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isBranchAdmin = user?.role === 'BranchAdmin';
  const toast = useToast();
  const { data: tree = [], isLoading } = useBranchTree();
  const deleteMutation = useDeleteBranchMutation();
  const statusMutation = useUpdateBranchStatusMutation();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [staleTime, setStaleTime] = useState<string | null>(null);
  const { isOnline } = useSyncStatus();

  const canEdit = (branchId: string) =>
    isSuperAdmin || (isBranchAdmin && user?.branchId === branchId);

  useEffect(() => {
    if (!isOnline) {
      getBranchesListLastFetched().then((ts) => {
        if (ts) setStaleTime(new Date(ts).toLocaleString());
      });
    } else {
      setStaleTime(null);
    }
  }, [isOnline]);

  const flat = flattenBranches(tree);
  const cities = Array.from(new Set(flat.map((b) => b.city).filter((c): c is string => c != null && c !== ''))).sort();
  const filtered = tree.filter((main) => {
    const name = main.name ?? '';
    const code = main.code ?? '';
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase());
    const matchCity = !cityFilter || main.city === cityFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && main.isActive) ||
      (statusFilter === 'inactive' && !main.isActive);
    if (!matchSearch || !matchCity || !matchStatus) return false;
    if (main.subBranches?.length) {
      const subMatch = main.subBranches.some(
        (s) => {
          const subName = s.name ?? '';
          const subCode = s.code ?? '';
          return (
            (!search || subName.toLowerCase().includes(search.toLowerCase()) || subCode.toLowerCase().includes(search.toLowerCase())) &&
            (!cityFilter || s.city === cityFilter) &&
            (statusFilter === 'all' || (statusFilter === 'active' && s.isActive) || (statusFilter === 'inactive' && !s.isActive))
          );
        },
      );
      if (subMatch) return true;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: 'Branch deleted', status: 'success', isClosable: true });
      setDeleteTarget(null);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : 'Failed to delete';
      toast({ title: Array.isArray(msg) ? msg[0] : msg, status: 'error', isClosable: true });
    }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      await statusMutation.mutateAsync({ id, isActive: !current });
      toast({ title: current ? 'Branch deactivated' : 'Branch activated', status: 'success', isClosable: true });
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : 'Failed to update status';
      toast({ title: Array.isArray(msg) ? msg[0] : msg, status: 'error', isClosable: true });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg">Branch Management</Heading>
        {isSuperAdmin && (
          <Button as={RouterLink} to="/settings/branches/new" leftIcon={<AddIcon />} colorScheme="teal">
            Add Main Branch
          </Button>
        )}
      </HStack>

      {!isOnline && staleTime && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          You are offline. Showing data from last sync at {staleTime}.
        </Alert>
      )}

      <HStack mb={4} spacing={4} flexWrap="wrap">
        <Input
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="xs"
          size="sm"
        />
        <Select
          size="sm"
          maxW="40"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="All cities"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          maxW="32"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </HStack>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text color="gray.500" mb={4}>
            No branches yet. Add your first branch.
          </Text>
          {isSuperAdmin && (
            <Button as={RouterLink} to="/settings/branches/new" colorScheme="teal">
              Add Main Branch
            </Button>
          )}
        </Box>
      ) : (
        <Accordion allowMultiple>
          {filtered.map((main) => (
            <AccordionItem key={main.id}>
              <AccordionButton>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Text fontWeight="600">{main.name}</Text>
                  <Badge>{main.code}</Badge>
                  <Text fontSize="sm" color="gray.500">
                    {main.city ?? '—'}
                  </Text>
                  <Badge colorScheme={main.isActive ? 'green' : 'red'}>
                    {main.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {main.manager && (
                    <Text fontSize="sm" color="gray.600">
                      Manager: {main.manager.fullName}
                    </Text>
                  )}
                  {main.subBranches?.length ? (
                    <Text fontSize="sm" color="gray.500">
                      {main.subBranches.length} sub-branch(es)
                    </Text>
                  ) : null}
                </HStack>
                <ChevronDownIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <HStack mb={2} spacing={2}>
                  {canEdit(main.id) && (
                    <Button size="sm" variant="outline" as={RouterLink} to={`/settings/branches/${main.id}/edit`}>
                      Edit
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button size="sm" variant="outline" as={RouterLink} to={`/settings/branches/${main.id}/sub/new`}>
                      Add Sub-branch
                    </Button>
                  )}
                  <Button size="sm" variant="outline" as={RouterLink} to={`/settings/branches/${main.id}`}>
                    View Stats
                  </Button>
                  {canEdit(main.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(main.id, main.isActive)}
                    >
                      {main.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button size="sm" variant="outline" as={RouterLink} to={`/settings/branches/${main.id}`}>
                      Assign Manager
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => setDeleteTarget({ id: main.id, name: main.name })}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
                {main.subBranches?.map((sub) => (
                  <Box key={sub.id} pl={6} py={2} borderLeftWidth="2px" borderColor="gray.200" _dark={{ borderColor: 'gray.600' }}>
                    <HStack justify="space-between">
                      <HStack>
                        <Text fontWeight="500">{sub.name}</Text>
                        <Badge size="sm">{sub.code}</Badge>
                        <Text fontSize="sm" color="gray.500">{sub.city ?? '—'}</Text>
                        <Badge colorScheme={sub.isActive ? 'green' : 'red'} size="sm">
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>
                      <HStack>
                        {canEdit(sub.id) && (
                          <Button size="xs" as={RouterLink} to={`/settings/branches/${sub.id}/edit`}>
                            Edit
                          </Button>
                        )}
                        <Button size="xs" variant="ghost" as={RouterLink} to={`/settings/branches/${sub.id}`}>
                          View
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => setDeleteTarget({ id: sub.id, name: sub.name })}
                          >
                            Delete
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete branch</ModalHeader>
          <ModalBody>
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
