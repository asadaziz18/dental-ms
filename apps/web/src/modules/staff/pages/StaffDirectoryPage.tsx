import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Text,
  HStack,
  TableContainer,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import { useStaffListQuery } from '../hooks/use-staff';
import { PermissionsMatrixTable } from '../components/PermissionsMatrixTable';
import { AddStaffModal } from '../components/AddStaffModal';
import { ROLE_LABELS } from '../constants';
import type { Staff, StaffRole } from '@dental-ms/shared-types';

export function StaffDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: staffList = [], isLoading, isError, error } = useStaffListQuery(
    branchFilter || undefined,
  );

  const canAddStaff =
    user?.role === 'SuperAdmin' || user?.role === 'BranchAdmin';

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="teal.700" _dark={{ color: 'teal.300' }}>
          Staff &amp; Doctors
        </Heading>
        {canAddStaff && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            onClick={() => setAddModalOpen(true)}
          >
            Add staff
          </Button>
        )}
      </HStack>

      <Tabs colorScheme="teal" variant="enclosed">
        <TabList>
          <Tab>Directory</Tab>
          <Tab>Permissions</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <HStack mb={4} gap={4}>
              <Select
                maxW="xs"
                placeholder="All branches"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                bg="white"
                _dark={{ bg: 'gray.800' }}
              >
                {/* Branch options could come from branches API */}
              </Select>
            </HStack>
            <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" shadow="sm" overflowX="auto">
              {isLoading ? (
                <Box p={4}>
                  <Skeleton height="40px" mb={2} />
                  <Skeleton height="40px" mb={2} />
                  <Skeleton height="40px" />
                </Box>
              ) : isError ? (
                <Box p={4}>
                  <Text color="red.500">
                    {error instanceof Error ? error.message : 'Failed to load staff'}
                  </Text>
                </Box>
              ) : (
                <Table size="sm">
                  <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Branch</Th>
                      <Th>Status</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {staffList.map((s: Staff) => (
                      <Tr key={s.id} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}>
                        <Td>
                          <Text
                            as="button"
                            type="button"
                            fontWeight="medium"
                            color="teal.600"
                            _dark={{ color: 'teal.400' }}
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => navigate(`/staff/${s.id}`)}
                          >
                            {s.fullName}
                          </Text>
                        </Td>
                        <Td>{s.email}</Td>
                        <Td>{ROLE_LABELS[s.role as StaffRole] ?? s.role}</Td>
                        <Td>{s.branch?.name ?? s.branchId ?? '—'}</Td>
                        <Td>
                          <Badge colorScheme={s.isActive ? 'green' : 'gray'}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td textAlign="right">
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="teal"
                            onClick={() => navigate(`/staff/${s.id}`)}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
              {staffList.length === 0 && !isLoading && (
                <Box p={8} textAlign="center" color="gray.500">
                  No staff found. Add staff to get started.
                </Box>
              )}
            </TableContainer>
          </TabPanel>
          <TabPanel px={0}>
            <PermissionsMatrixTable />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AddStaffModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultBranchId={user?.branchId ?? user?.allowedBranches?.[0]}
        currentUserRole={user?.role ?? 'Receptionist'}
      />
    </Box>
  );
}
