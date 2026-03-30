import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
  HStack,
  Icon,
  TableContainer,
} from '@chakra-ui/react';
import { Search2Icon, AddIcon } from '@chakra-ui/icons';
import { useBranchId } from '@/core/branch';
import { usePatientsQuery } from '../hooks/use-patients';
import type { Patient } from '@dental-ms/shared-types';

function formatPatientName(p: Patient) {
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || '—';
}

export function PatientListPage() {
  const navigate = useNavigate();
  const branchId = useBranchId();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = usePatientsQuery({
    search: search || undefined,
    page,
    limit,
    branchId: branchId ?? undefined,
  });

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="teal.700">
          Patients
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          size="sm"
          onClick={() => navigate('/patients/new')}
        >
          New patient
        </Button>
      </HStack>

      <InputGroup maxW="md" mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={Search2Icon} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search by name, phone, email, ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          bg="white"
        />
      </InputGroup>

      <TableContainer bg="white" borderRadius="lg" shadow="sm" overflowX="auto">
        {isLoading ? (
          <Box p={4}>
            <Skeleton height="40px" mb={2} />
            <Skeleton height="40px" mb={2} />
            <Skeleton height="40px" mb={2} />
            <Skeleton height="40px" />
          </Box>
        ) : isError ? (
          <Box p={4}>
            <Text color="red.500">
              {error instanceof Error ? error.message : 'Failed to load patients'}
            </Text>
          </Box>
        ) : (
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Email</Th>
                <Th>Branch</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(data?.data ?? []).map((p) => (
                <Tr key={p.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text
                      as="button"
                      type="button"
                      fontWeight="medium"
                      color="teal.600"
                      _hover={{ textDecoration: 'underline' }}
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      {formatPatientName(p)}
                    </Text>
                  </Td>
                  <Td>{p.phone || '—'}</Td>
                  <Td>{p.email || '—'}</Td>
                  <Td>{p.branchId}</Td>
                  <Td textAlign="right">
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="teal"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        {data && data.data.length === 0 && !isLoading && (
          <Box p={8} textAlign="center" color="gray.500">
            No patients found. Add one to get started.
          </Box>
        )}
      </TableContainer>

      {data && data.total > limit && (
        <HStack mt={4} gap={2}>
          <Button
            size="sm"
            isDisabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {page} of {Math.ceil(data.total / limit)}
          </Text>
          <Button
            size="sm"
            isDisabled={page >= Math.ceil(data.total / limit)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
}
