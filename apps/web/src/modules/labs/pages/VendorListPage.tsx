import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Skeleton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { AddIcon, Search2Icon, ChevronDownIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import { useLabVendorsQuery, useUpdateLabVendorStatusMutation, useDeleteLabVendorMutation } from '../hooks/use-labs';

const CAN_ADD_VENDOR_ROLES = ['SuperAdmin', 'BranchAdmin'];

const SPECIALIZATIONS = [
  'crown_bridge',
  'denture',
  'orthodontic',
  'veneer_laminate',
  'implant',
  'custom',
];

export function VendorListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [spec, setSpec] = useState('');
  const canAddVendor = user?.role && CAN_ADD_VENDOR_ROLES.includes(user.role);

  const { data: vendors, isLoading } = useLabVendorsQuery({
    isActive: undefined,
    city: city || undefined,
    specialization: spec || undefined,
  });
  const updateStatusMutation = useUpdateLabVendorStatusMutation();
  const deleteMutation = useDeleteLabVendorMutation();

  const filtered = (vendors ?? []).filter(
    (v) => !search.trim() || v.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id, isActive });
      toast({ title: isActive ? 'Vendor activated' : 'Vendor deactivated', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete vendor "${name}"? This is only allowed if they have no active orders.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Vendor deleted', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">Lab Vendors</Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }} mt={1}>
            Manage dental lab vendors and their specializations.
          </Text>
        </Box>
        {canAddVendor && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            as={RouterLink}
            to="/labs/vendors/new"
          >
            Add Vendor
          </Button>
        )}
      </HStack>

      <HStack gap={4} mb={4} flexWrap="wrap">
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Select
          placeholder="City"
          maxW="40"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">All</option>
          <option value="Karachi">Karachi</option>
          <option value="Lahore">Lahore</option>
          <option value="Islamabad">Islamabad</option>
        </Select>
        <Select
          placeholder="Specialization"
          maxW="48"
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
        >
          <option value="">All</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </HStack>

      {isLoading ? (
        <Skeleton height="200px" />
      ) : filtered.length === 0 ? (
        <Box py={8} textAlign="center" color="gray.500">
          No vendors added yet. Add your first lab vendor to get started.
        </Box>
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>City</Th>
              <Th>Specializations</Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((v) => (
              <Tr key={v.id}>
                <Td fontWeight="medium">{v.name}</Td>
                <Td>{v.city}</Td>
                <Td>
                  <HStack gap={1} flexWrap="wrap">
                    {(v.specializations || []).slice(0, 3).map((s: string) => (
                      <Badge key={s} size="sm" variant="subtle">{s.replace(/_/g, ' ')}</Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={v.isActive ? 'green' : 'gray'}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                </Td>
                <Td textAlign="right">
                  <HStack justify="end" gap={1}>
                    <Button size="sm" variant="ghost" leftIcon={<ViewIcon />} onClick={() => navigate(`/labs/vendors/${v.id}`)}>
                      View
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<EditIcon />} onClick={() => navigate(`/labs/vendors/${v.id}/edit`)}>
                      Edit
                    </Button>
                    <Menu>
                      <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                        More
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleToggleStatus(v.id, !v.isActive)}>
                          {v.isActive ? 'Deactivate' : 'Activate'}
                        </MenuItem>
                        <MenuItem color="red.500" onClick={() => handleDelete(v.id, v.name)}>
                          Delete (SuperAdmin only)
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
