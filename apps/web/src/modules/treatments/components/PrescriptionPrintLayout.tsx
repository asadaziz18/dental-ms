import { Box, Text, VStack, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import type { Prescription, PrescriptionItem } from '@dental-ms/shared-types';

const CLINIC_NAME = 'Dental MS';

interface PrescriptionPrintLayoutProps {
  prescription: Prescription;
  patientName: string;
}

/**
 * Print-only layout for a single prescription: clinic header, patient, date, medications table.
 * Use with window.print() or a print stylesheet that hides .no-print and shows this.
 */
export function PrescriptionPrintLayout({
  prescription,
  patientName,
}: PrescriptionPrintLayoutProps) {
  const date = new Date(prescription.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Box
      className="prescription-print-document"
      p={6}
      maxW="600px"
      mx="auto"
      sx={{
        '@media print': {
          '&': { padding: 0, maxWidth: '100%' },
          '.no-print': { display: 'none !important' },
        },
      }}
    >
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          {CLINIC_NAME}
        </Text>
        <Text fontSize="sm" color="gray.600">
          PRESCRIPTION
        </Text>
        <Box borderBottomWidth="1px" pb={2}>
          <Text><strong>Patient:</strong> {patientName}</Text>
          <Text fontSize="sm" color="gray.600">Date: {date}</Text>
          {prescription.prescribedBy && (
            <Text fontSize="sm">Prescribed by: {prescription.prescribedBy.fullName}</Text>
          )}
        </Box>

        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Medication</Th>
              <Th>Dosage</Th>
              <Th>Frequency</Th>
              <Th>Duration</Th>
              <Th>Instructions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {prescription.items.map((item: PrescriptionItem, i: number) => (
              <Tr key={i}>
                <Td>{item.medication}</Td>
                <Td>{item.dosage}</Td>
                <Td>{item.frequency}</Td>
                <Td>{item.duration}</Td>
                <Td>{item.instructions ?? '—'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {prescription.notes && (
          <Box pt={2}>
            <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
              Notes
            </Text>
            <Text fontSize="sm">{prescription.notes}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
