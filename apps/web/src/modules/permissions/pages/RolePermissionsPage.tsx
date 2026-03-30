import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  useToast,
  Text,
  TableContainer,
} from '@chakra-ui/react';
import { getRolePermissions, updateRolePermissions } from '@/core/permissions';
import { SCREEN_LABELS } from '@/core/permissions';
import { ROLE_LABELS } from '@/modules/staff/constants';
import { SCREEN_KEYS } from '@dental-ms/shared-types';
import type { UserRole } from '@dental-ms/shared-types';

const ROLES: UserRole[] = ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'];

export function RolePermissionsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: rolePermissions, isLoading } = useQuery({
    queryKey: ['permissions', 'roles'],
    queryFn: getRolePermissions,
  });

  const updateRole = useMutation({
    mutationFn: ({ role, permissions }: { role: UserRole; permissions: Record<string, boolean> }) =>
      updateRolePermissions(role, permissions),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'roles'] });
      toast({ title: `Permissions for ${ROLE_LABELS[role]} saved`, status: 'success', isClosable: true });
    },
    onError: () => {
      toast({ title: 'Failed to save permissions', status: 'error', isClosable: true });
    },
  });

  if (isLoading || !rolePermissions) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Role permissions</Heading>
        <Text>Loading…</Text>
      </Box>
    );
  }

  const handleToggle = (role: UserRole, screenKey: string, allowed: boolean) => {
    const next = { ...rolePermissions[role], [screenKey]: allowed };
    updateRole.mutate({ role, permissions: next });
  };

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Role permissions
      </Heading>
      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={6}>
        Set which screens each role can access by default. Branch admins can override these per staff member.
      </Text>
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Screen</Th>
              {ROLES.map((role) => (
                <Th key={role}>{ROLE_LABELS[role]}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {SCREEN_KEYS.map((screenKey) => (
              <Tr key={screenKey}>
                <Td fontWeight="medium">{SCREEN_LABELS[screenKey]}</Td>
                {ROLES.map((role) => (
                  <Td key={role}>
                    <Switch
                      isChecked={rolePermissions[role]?.[screenKey] === true}
                      onChange={(e) =>
                        handleToggle(role, screenKey, e.target.checked)
                      }
                      isDisabled={updateRole.isPending}
                    />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
