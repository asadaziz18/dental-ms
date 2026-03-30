import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import type { StaffRole } from '@dental-ms/shared-types';
import { PERMISSION_LABELS, ROLE_PERMISSIONS, ROLE_LABELS } from '../constants';

const PERMISSION_IDS = Object.keys(PERMISSION_LABELS);
const ROLES: StaffRole[] = [
  'SuperAdmin',
  'BranchAdmin',
  'Doctor',
  'Receptionist',
  'Nurse',
];

export function PermissionsMatrixTable() {
  return (
    <Box>
      <Heading size="sm" mb={2} color="teal.700" _dark={{ color: 'teal.300' }}>
        Role permissions
      </Heading>
      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={3}>
        View and edit access by role. Changes require backend role assignment.
      </Text>
      <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" shadow="sm" overflowX="auto">
        <Table size="sm">
          <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
            <Tr>
              <Th>Permission</Th>
              {ROLES.map((role) => (
                <Th key={role} textAlign="center" whiteSpace="nowrap">
                  {ROLE_LABELS[role]}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {PERMISSION_IDS.map((permId) => (
              <Tr key={permId} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}>
                <Td fontWeight="medium">{PERMISSION_LABELS[permId] ?? permId}</Td>
                {ROLES.map((role) => {
                  const allowed = ROLE_PERMISSIONS[role][permId];
                  return (
                    <Td key={role} textAlign="center">
                      {allowed ? (
                        <Badge colorScheme="green" gap={1} display="inline-flex" alignItems="center">
                          <CheckIcon boxSize={3} /> Yes
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray" gap={1} display="inline-flex" alignItems="center">
                          <CloseIcon boxSize={3} /> No
                        </Badge>
                      )}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
