import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Text,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import type { PrescriptionItem } from '@dental-ms/shared-types';
import { useCreatePrescriptionMutation, usePrescriptionsByPatientQuery } from '../hooks/use-treatments';
import { PrescriptionPrintLayout } from './PrescriptionPrintLayout';

interface PrescriptionPadProps {
  patientId: string;
  patientName?: string;
  treatmentPlanId?: string | null;
  onCreated?: () => void;
}

const emptyItem: PrescriptionItem = {
  medication: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

export function PrescriptionPad({
  patientId,
  patientName = 'Patient',
  treatmentPlanId = null,
  onCreated,
}: PrescriptionPadProps) {
  const toast = useToast();
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...emptyItem }]);
  const [notes, setNotes] = useState('');
  const [printingId, setPrintingId] = useState<string | null>(null);
  const createMutation = useCreatePrescriptionMutation(patientId);
  const { data: prescriptions, isLoading } = usePrescriptionsByPatientQuery(patientId);

  const addRow = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const valid = items.filter(
      (i) => i.medication.trim() && i.dosage.trim() && i.frequency.trim() && i.duration.trim(),
    );
    if (valid.length === 0) {
      toast({ title: 'Add at least one medication with dosage, frequency, and duration', status: 'warning' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        patientId,
        treatmentPlanId,
        items: valid,
        notes: notes.trim() || null,
      });
      setItems([{ ...emptyItem }]);
      setNotes('');
      toast({ title: 'Prescription saved', status: 'success', duration: 2000 });
      onCreated?.();
    } catch (e) {
      toast({
        title: 'Failed to save prescription',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  return (
    <Box>
      <Heading size="sm" mb={4}>
        New prescription
      </Heading>
      <VStack align="stretch" spacing={4}>
        <Box overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Medication</Th>
                <Th>Dosage</Th>
                <Th>Frequency</Th>
                <Th>Duration</Th>
                <Th>Instructions</Th>
                <Th w="40px" />
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Input
                      size="sm"
                      value={item.medication}
                      onChange={(e) => updateItem(index, 'medication', e.target.value)}
                      placeholder="e.g. Amoxicillin"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      value={item.dosage}
                      onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                      placeholder="500mg"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      value={item.frequency}
                      onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                      placeholder="TID"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      value={item.duration}
                      onChange={(e) => updateItem(index, 'duration', e.target.value)}
                      placeholder="7 days"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      value={item.instructions ?? ''}
                      onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                      placeholder="Optional"
                    />
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Remove row"
                      size="xs"
                      variant="ghost"
                      icon={<DeleteIcon />}
                      onClick={() => removeRow(index)}
                      isDisabled={items.length <= 1}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Button leftIcon={<AddIcon />} size="sm" variant="outline" onClick={addRow}>
          Add medication
        </Button>
        <FormControl>
          <FormLabel size="sm">Notes</FormLabel>
          <Textarea
            size="sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional instructions for pharmacist or patient"
            rows={2}
          />
        </FormControl>
        <Button
          size="sm"
          colorScheme="teal"
          onClick={handleSubmit}
          isLoading={createMutation.isPending}
        >
          Save prescription
        </Button>
      </VStack>

      {!isLoading && (prescriptions?.length ?? 0) > 0 && (
        <Box mt={8}>
          <Heading size="sm" mb={2}>
            Recent prescriptions
          </Heading>
          <VStack align="stretch" spacing={2}>
            {prescriptions!.slice(0, 5).map((rx) => (
              <Box
                key={rx.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                sx={{ '@media print': { breakInside: 'avoid' } }}
              >
                <Text fontSize="xs" color="gray.500">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </Text>
                <VStack align="stretch" spacing={1} mt={1}>
                  {rx.items.map((line, i) => (
                    <Text key={i} fontSize="sm">
                      {line.medication} — {line.dosage}, {line.frequency}, {line.duration}
                      {line.instructions ? ` (${line.instructions})` : ''}
                    </Text>
                  ))}
                </VStack>
                {rx.notes && (
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    {rx.notes}
                  </Text>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  mt={2}
                  className="no-print"
                  onClick={() => {
                    setPrintingId(rx.id);
                    setTimeout(() => {
                      document.body.classList.add('print-prescription-only');
                      let ended = false;
                      const endPrescriptionPrint = () => {
                        if (ended) return;
                        ended = true;
                        document.body.classList.remove('print-prescription-only');
                        window.clearTimeout(fallback);
                      };
                      const fallback = window.setTimeout(endPrescriptionPrint, 5000);
                      window.addEventListener('afterprint', endPrescriptionPrint, { once: true });
                      window.print();
                    }, 200);
                  }}
                >
                  Print
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Print layout: when printing, only this is visible (via @media print) */}
      {printingId && (() => {
        const rx = prescriptions?.find((r) => r.id === printingId);
        if (!rx) return null;
        return (
          <Box
            className="prescription-print-view"
            position="fixed"
            left={0}
            top={0}
            right={0}
            bottom={0}
            zIndex={9999}
            bg="white"
            overflow="auto"
            sx={{
              '@media print': { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
              '@media screen': { display: 'block' },
            }}
          >
            <Box className="no-print" p={2}>
              <Button size="sm" onClick={() => setPrintingId(null)}>
                Close preview
              </Button>
            </Box>
            <PrescriptionPrintLayout prescription={rx} patientName={patientName} />
          </Box>
        );
      })()}
    </Box>
  );
}
