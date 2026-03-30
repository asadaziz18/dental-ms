import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Skeleton,
  HStack,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Switch,
  SimpleGrid,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/core/auth';
import { getUserOverrides, setUserOverrides, getRolePermissions } from '@/core/permissions';
import { SCREEN_LABELS } from '@/core/permissions';
import { SCREEN_KEYS } from '@dental-ms/shared-types';
import { useStaffQuery } from '../hooks/use-staff';
import {
  useAttendanceByUserQuery,
  useUpsertAttendanceMutation,
  useLeavesByUserQuery,
  useCreateLeaveMutation,
  useCommissionSummaryQuery,
  useCommissionRateQuery,
  useSetCommissionRateMutation,
} from '../hooks/use-staff';
import { ScheduleEditor } from '../components/ScheduleEditor';
import { ROLE_LABELS } from '../constants';
import type { StaffRole } from '@dental-ms/shared-types';
import { useState } from 'react';

export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { isOpen: isAttendanceOpen, onOpen: onAttendanceOpen, onClose: onAttendanceClose } = useDisclosure();
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure();

  const canManageScreenAccess =
    (currentUser?.role === 'SuperAdmin' || currentUser?.role === 'BranchAdmin') &&
    currentUser?.id !== id;

  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceCheckIn, setAttendanceCheckIn] = useState('');
  const [attendanceCheckOut, setAttendanceCheckOut] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [commissionRateInput, setCommissionRateInput] = useState('');

  const { data: staff, isLoading: staffLoading } = useStaffQuery(id);
  const { data: rolePermissions } = useQuery({
    queryKey: ['permissions', 'roles'],
    queryFn: getRolePermissions,
    enabled: !!id && !!staff && canManageScreenAccess,
  });
  const { data: userOverrides = {} } = useQuery({
    queryKey: ['permissions', 'users', id],
    queryFn: () => getUserOverrides(id!),
    enabled: !!id && !!staff && canManageScreenAccess,
  });
  const setOverrides = useMutation({
    mutationFn: (overrides: Partial<Record<string, boolean>>) =>
      setUserOverrides(id!, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'users', id] });
      toast({ title: 'Screen access updated', status: 'success', isClosable: true });
    },
    onError: () => {
      toast({ title: 'Failed to update screen access', status: 'error', isClosable: true });
    },
  });
  const { data: attendance = [] } = useAttendanceByUserQuery(id, {
    fromDate: undefined,
    toDate: undefined,
  });
  const { data: leaves = [] } = useLeavesByUserQuery(id);
  const { data: commissionSummary = [] } = useCommissionSummaryQuery({ doctorId: id });
  const { data: commissionRate } = useCommissionRateQuery(staff?.role === 'Doctor' ? id ?? undefined : undefined);

  const upsertAttendance = useUpsertAttendanceMutation(id ?? '');
  const createLeave = useCreateLeaveMutation();
  const setCommissionRate = useSetCommissionRateMutation(id ?? '');

  const isDoctor = staff?.role === 'Doctor';
  const summaryRow = commissionSummary[0];

  const handleSaveAttendance = async () => {
    if (!id || !attendanceDate) return;
    try {
      await upsertAttendance.mutateAsync({
        date: attendanceDate,
        checkInAt: attendanceCheckIn || undefined,
        checkOutAt: attendanceCheckOut || undefined,
      });
      toast({ title: 'Attendance recorded', status: 'success', isClosable: true });
      onAttendanceClose();
      setAttendanceDate('');
      setAttendanceCheckIn('');
      setAttendanceCheckOut('');
    } catch {
      toast({ title: 'Failed to save attendance', status: 'error', isClosable: true });
    }
  };

  const handleCreateLeave = async () => {
    if (!id || !staff?.branchId || !leaveFrom || !leaveTo) return;
    try {
      await createLeave.mutateAsync({
        userId: id,
        fromDate: leaveFrom,
        toDate: leaveTo,
      });
      toast({ title: 'Leave request created', status: 'success', isClosable: true });
      onLeaveClose();
      setLeaveFrom('');
      setLeaveTo('');
    } catch {
      toast({ title: 'Failed to create leave', status: 'error', isClosable: true });
    }
  };

  const handleSetCommissionRate = async () => {
    const rate = parseFloat(commissionRateInput);
    if (!id || isNaN(rate) || rate < 0 || rate > 100) return;
    try {
      await setCommissionRate.mutateAsync({ ratePercent: rate });
      toast({ title: 'Commission rate updated', status: 'success', isClosable: true });
    } catch {
      toast({ title: 'Failed to update rate', status: 'error', isClosable: true });
    }
  };

  if (staffLoading || !staff) {
    return (
      <Box>
        <Skeleton height="8" w="48" mb={4} />
        <Skeleton height="120px" />
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={6} gap={4}>
        <Button
          leftIcon={<ChevronLeftIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff')}
        >
          Back
        </Button>
        <Heading size="lg" color="teal.700" _dark={{ color: 'teal.300' }}>
          {staff.fullName}
        </Heading>
        <Badge colorScheme="teal">{ROLE_LABELS[staff.role as StaffRole] ?? staff.role}</Badge>
        {!staff.isActive && <Badge colorScheme="gray">Inactive</Badge>}
      </HStack>

      <Box mb={4}>
        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
          {staff.email} · {staff.branch?.name ?? staff.branchId ?? 'No branch'}
        </Text>
      </Box>

      <Tabs colorScheme="teal" variant="enclosed">
        <TabList>
          <Tab>Schedule</Tab>
          <Tab>Attendance</Tab>
          <Tab>Leave</Tab>
          {isDoctor && <Tab>Commission</Tab>}
          {canManageScreenAccess && staff.role !== 'SuperAdmin' && <Tab>Screen access</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <ScheduleEditor userId={staff.id} readOnly={false} />
          </TabPanel>
          <TabPanel px={0}>
            <Heading size="sm" mb={3}>
              Attendance
            </Heading>
            <Button size="sm" colorScheme="teal" mb={4} onClick={onAttendanceOpen}>
              Record check-in / check-out
            </Button>
            <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" shadow="sm">
              <Table size="sm">
                <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Check in</Th>
                    <Th>Check out</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {attendance.slice(0, 30).map((a) => (
                    <Tr key={a.id}>
                      <Td>{a.date}</Td>
                      <Td>{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString() : '—'}</Td>
                      <Td>{a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString() : '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {attendance.length === 0 && (
                <Box p={6} textAlign="center" color="gray.500">
                  No attendance records yet.
                </Box>
              )}
            </TableContainer>

            <Modal isOpen={isAttendanceOpen} onClose={onAttendanceClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Record attendance</ModalHeader>
                <ModalBody>
                  <FormControl mb={3}>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Check in (optional)</FormLabel>
                    <Input
                      type="time"
                      value={attendanceCheckIn}
                      onChange={(e) => setAttendanceCheckIn(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Check out (optional)</FormLabel>
                    <Input
                      type="time"
                      value={attendanceCheckOut}
                      onChange={(e) => setAttendanceCheckOut(e.target.value)}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onAttendanceClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="teal" onClick={handleSaveAttendance} isLoading={upsertAttendance.isPending}>
                    Save
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
          <TabPanel px={0}>
            <Heading size="sm" mb={3}>
              Leave
            </Heading>
            <Button size="sm" colorScheme="teal" mb={4} onClick={onLeaveOpen}>
              Request leave
            </Button>
            <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" shadow="sm">
              <Table size="sm">
                <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                  <Tr>
                    <Th>From</Th>
                    <Th>To</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {leaves.map((l) => (
                    <Tr key={l.id}>
                      <Td>{l.fromDate}</Td>
                      <Td>{l.toDate}</Td>
                      <Td>{l.type}</Td>
                      <Td>
                        <Badge colorScheme={l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'yellow'}>
                          {l.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {leaves.length === 0 && (
                <Box p={6} textAlign="center" color="gray.500">
                  No leave records.
                </Box>
              )}
            </TableContainer>

            <Modal isOpen={isLeaveOpen} onClose={onLeaveClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Request leave</ModalHeader>
                <ModalBody>
                  <FormControl mb={3}>
                    <FormLabel>From date</FormLabel>
                    <Input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>To date</FormLabel>
                    <Input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onLeaveClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="teal" onClick={handleCreateLeave} isLoading={createLeave.isPending}>
                    Submit
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
          {isDoctor && (
            <TabPanel px={0}>
              <Heading size="sm" mb={3}>
                Commission
              </Heading>
              {summaryRow && (
                <Box mb={4} p={4} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                  <Text fontSize="sm">Total revenue (invoiced): {summaryRow.totalRevenue.toFixed(2)}</Text>
                  <Text fontSize="sm">Rate: {summaryRow.ratePercent}%</Text>
                  <Text fontWeight="bold">Commission: {summaryRow.commission.toFixed(2)}</Text>
                </Box>
              )}
              <HStack align="flex-end" gap={2} mb={4}>
                <FormControl maxW="32">
                  <FormLabel>Rate %</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={commissionRateInput || (commissionRate?.ratePercent ?? '')}
                    onChange={(e) => setCommissionRateInput(e.target.value)}
                    placeholder="0"
                  />
                </FormControl>
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={handleSetCommissionRate}
                  isLoading={setCommissionRate.isPending}
                >
                  Set rate
                </Button>
              </HStack>
              {!summaryRow && !commissionRate && (
                <Text color="gray.500">No commission data yet. Set a rate and link invoices to this doctor.</Text>
              )}
            </TabPanel>
          )}
          {canManageScreenAccess && staff.role !== 'SuperAdmin' && (
            <TabPanel px={0}>
              <Heading size="sm" mb={2}>
                Screen access
              </Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={4}>
                Override which screens this user can see in this branch. If not set, the role default applies.
              </Text>
              {rolePermissions && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {SCREEN_KEYS.map((screenKey) => {
                    const roleDefault = rolePermissions[staff.role as StaffRole]?.[screenKey] ?? false;
                    const effective = userOverrides[screenKey] ?? roleDefault;
                    return (
                      <HStack key={screenKey} justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                        <Text fontSize="sm">{SCREEN_LABELS[screenKey]}</Text>
                        <Switch
                          isChecked={effective}
                          onChange={(e) => {
                            const newVal = e.target.checked;
                            setOverrides.mutate({ ...userOverrides, [screenKey]: newVal });
                          }}
                          isDisabled={setOverrides.isPending}
                        />
                      </HStack>
                    );
                  })}
                </SimpleGrid>
              )}
              {!rolePermissions && <Text color="gray.500">Loading…</Text>}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
}
