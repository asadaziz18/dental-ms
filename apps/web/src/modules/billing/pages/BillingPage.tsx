import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Text,
  Link,
  Button,
  HStack,
  TableContainer,
} from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';
import { usePatientsQuery } from '@/modules/patients/hooks/use-patients';
import { getBranchId } from '@/core/api/client';

function formatPatientName(p: { firstName?: string; lastName?: string }) {
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || '—';
}

export function BillingPage() {
  const navigate = useNavigate();
  const branchId = getBranchId();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = usePatientsQuery({
    search: search || undefined,
    page,
    limit,
    branchId: branchId ?? undefined,
  });

  const patients = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Billing
      </Heading>
      <Text color="gray.600" _dark={{ color: 'gray.400' }} mb={6}>
        Select a patient to view invoices, record payments, and manage insurance claims.
      </Text>

      <InputGroup maxW="md" mb={4}>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </InputGroup>

      {isLoading ? (
        <Skeleton height="200px" />
      ) : (
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Patient</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {patients.length === 0 ? (
                <Tr>
                  <Td colSpan={2} color="gray.500">
                    No patients found. <Link as={RouterLink} to="/patients" color="teal.600">Add a patient</Link> or try a different search.
                  </Td>
                </Tr>
              ) : (
                patients.map((p) => (
                  <Tr key={p.id}>
                    <Td fontWeight="medium">{formatPatientName(p)}</Td>
                    <Td textAlign="right">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => navigate(`/patients/${p.id}/billing`)}
                      >
                        View billing
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {total > limit && (
        <Box mt={4}>
          <Text fontSize="sm" mb={2}>
            Page {page} of {Math.ceil(total / limit)} ({total} patients)
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              isDisabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              isDisabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
