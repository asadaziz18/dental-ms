import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Badge,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  useToast,
  } from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import {
  useBranchDetail,
  useBranchStaff,
  useBranchStats,
  useUpdateBranchStatusMutation,
  useDeleteBranchMutation,
  useAssignBranchManagerMutation,
} from '../hooks/use-branches';
import { staffApi } from '@/modules/staff/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isBranchAdmin = user?.role === 'BranchAdmin';
  const canEdit = isSuperAdmin || (isBranchAdmin && user?.branchId === id);
  const toast = useToast();
  const { data: branch, isLoading } = useBranchDetail(id ?? null, !!id);
  const { data: staff = [] } = useBranchStaff(id ?? null, !!id);
  const { data: stats } = useBranchStats(id ?? null, !!id);
  const statusMutation = useUpdateBranchStatusMutation();
  const deleteMutation = useDeleteBranchMutation();
  const assignManagerMutation = useAssignBranchManagerMutation(id ?? '');
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [managerUserId, setManagerUserId] = useState('');

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff', 'branch-admins'],
    queryFn: () => staffApi.list(),
    enabled: isSuperAdmin && !!id,
  });
  const branchAdmins = staffList.filter((s) => s.role === 'BranchAdmin');

  const handleAssignManager = async () => {
    if (!id || !managerUserId) return;
    try {
      await assignManagerMutation.mutateAsync(managerUserId);
      toast({ title: 'Manager assigned', status: 'success', isClosable: true });
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : 'Failed';
      toast({ title: String(msg), status: 'error', isClosable: true });
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await statusMutation.mutateAsync({ id, isActive: false });
      toast({ title: 'Branch deactivated', status: 'success', isClosable: true });
      setDeactivateOpen(false);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : 'Failed';
      toast({ title: String(msg), status: 'error', isClosable: true });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Branch deleted', status: 'success', isClosable: true });
      setDeleteOpen(false);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : 'Failed';
      toast({ title: String(msg), status: 'error', isClosable: true });
    }
  };

  if (isLoading || !branch) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <HStack>
          <Heading size="lg">{branch.name}</Heading>
          <Badge fontSize="md">{branch.code}</Badge>
          <Badge colorScheme={branch.isActive ? 'green' : 'red'}>
            {branch.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>
        {canEdit && (
          <Button as={RouterLink} to={`/settings/branches/${id}/edit`} colorScheme="teal" size="sm">
            Edit Branch
          </Button>
        )}
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <VStack align="stretch" spacing={4}>
          <Card>
            <CardHeader fontWeight="600">Info</CardHeader>
            <CardBody pt={0}>
              <Text>{branch.address}</Text>
              <Text>{branch.city}</Text>
              <Text>Phone: {branch.phone}</Text>
              {branch.email && <Text>Email: {branch.email}</Text>}
              <Text mt={2}>
                Hours: {branch.openingTime} – {branch.closingTime}
              </Text>
              <Text>Working days: {branch.workingDays?.join(', ') ?? '—'}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader fontWeight="600">Manager</CardHeader>
            <CardBody pt={0}>
              {branch.manager ? (
                <VStack align="stretch">
                  <Text fontWeight="500">{branch.manager.fullName}</Text>
                  <Text fontSize="sm">{branch.manager.email}</Text>
                  {isSuperAdmin && (
                    <Button size="sm" variant="outline" mt={2} onClick={() => setManagerUserId(branch.managerUserId ?? '')}>
                      Change Manager
                    </Button>
                  )}
                </VStack>
              ) : (
                <Text color="gray.500">No manager assigned</Text>
              )}
              {isSuperAdmin && (
                <HStack mt={2}>
                  <Select
                    size="sm"
                    placeholder="Assign manager"
                    value={managerUserId}
                    onChange={(e) => setManagerUserId(e.target.value)}
                  >
                    {branchAdmins.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                  </Select>
                  <Button size="sm" colorScheme="teal" onClick={handleAssignManager} isLoading={assignManagerMutation.isPending}>
                    Assign
                  </Button>
                </HStack>
              )}
            </CardBody>
          </Card>
          {branch.parentBranchId == null && (branch.subBranches?.length ?? 0) > 0 && (
            <Card>
              <CardHeader fontWeight="600">Sub-branches</CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={2}>
                  {branch.subBranches?.map((s) => (
                    <HStack key={s.id} justify="space-between">
                      <Text>{s.name}</Text>
                      <Badge colorScheme={s.isActive ? 'green' : 'red'} size="sm">
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="xs" as={RouterLink} to={`/settings/branches/${s.id}`}>
                        View
                      </Button>
                    </HStack>
                  ))}
                </VStack>
                {isSuperAdmin && (
                  <Button as={RouterLink} to={`/settings/branches/${id}/sub/new`} size="sm" mt={2}>
                    Add Sub-branch
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </VStack>

        <VStack align="stretch" spacing={4}>
          {stats && (
            <Card>
              <CardHeader fontWeight="600">Stats</CardHeader>
              <CardBody pt={0}>
                <StatGroup>
                  <Stat>
                    <StatLabel>Patients</StatLabel>
                    <StatNumber>{stats.totalPatients}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Doctors</StatLabel>
                    <StatNumber>{stats.totalDoctors}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Staff</StatLabel>
                    <StatNumber>{stats.totalStaff}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Appointments (month)</StatLabel>
                    <StatNumber>{stats.appointmentsThisMonth}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Revenue (month)</StatLabel>
                    <StatNumber>PKR {stats.revenueThisMonth.toLocaleString()}</StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>
          )}
          <Card>
            <CardHeader fontWeight="600">Staff</CardHeader>
            <CardBody pt={0}>
              {staff.slice(0, 5).map((s) => (
                <HStack key={s.id} py={1}>
                  <Text>{s.fullName}</Text>
                  <Badge size="sm">{s.role}</Badge>
                </HStack>
              ))}
              {staff.length > 5 && (
                <Button as={RouterLink} to="/staff" size="sm" variant="link" mt={2}>
                  View All
                </Button>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Grid>

      {isSuperAdmin && (
        <Box mt={8} p={4} borderWidth="1px" borderRadius="md" borderColor="red.200" _dark={{ borderColor: 'red.800' }}>
          <Text fontWeight="600" mb={2}>
            Danger Zone
          </Text>
          <HStack>
            <Button colorScheme="orange" size="sm" onClick={() => setDeactivateOpen(true)} isDisabled={!branch.isActive}>
              Deactivate Branch
            </Button>
            <Button colorScheme="red" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete Branch
            </Button>
          </HStack>
        </Box>
      )}

      <Modal isOpen={deactivateOpen} onClose={() => setDeactivateOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deactivate branch</ModalHeader>
          <ModalBody>Are you sure? You cannot deactivate if there are future appointments.</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={() => setDeactivateOpen(false)}>Cancel</Button>
            <Button colorScheme="orange" onClick={handleDeactivate} isLoading={statusMutation.isPending}>
              Deactivate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete branch</ModalHeader>
          <ModalBody>
            This cannot be undone. The branch must have no future appointments and no assigned users.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
