import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Skeleton,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Select,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  useTreatmentPlanQuery,
  useProceduresQuery,
  useUpdateTreatmentPlanMutation,
  useAddTreatmentPlanItemMutation,
  useRemoveTreatmentPlanItemMutation,
} from '../hooks/use-treatments';
import { DentalChart } from '../components/DentalChart';
import { ClinicalNotesEditor } from '../components/ClinicalNotesEditor';
import { PrescriptionPad } from '../components/PrescriptionPad';
import { AddPlanItemModal, type AddPlanItemFormValues } from '../components/AddPlanItemModal';
import type { TreatmentPlanItem as TPI } from '@dental-ms/shared-types';
import { TOOTH_CONDITIONS } from '../constants';

function buildToothStates(items: TPI[]): Map<number, { toothNumber: number; conditionTag: TPI['conditionTag'] }> {
  const map = new Map<number, { toothNumber: number; conditionTag: TPI['conditionTag'] }>();
  for (const item of items) {
    const existing = map.get(item.toothNumber);
    if (!existing || (item.conditionTag && item.conditionTag !== 'healthy')) {
      map.set(item.toothNumber, {
        toothNumber: item.toothNumber,
        conditionTag: item.conditionTag ?? null,
      });
    }
  }
  return map;
}

export function TreatmentPlanDetailPage() {
  const { patientId, planId } = useParams<{ patientId: string; planId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const { data: plan, isLoading, isError } = useTreatmentPlanQuery(planId);
  const { data: procedures } = useProceduresQuery();
  const updatePlanMutation = useUpdateTreatmentPlanMutation(planId ?? '', patientId ?? '');
  const addItemMutation = useAddTreatmentPlanItemMutation(planId ?? '', patientId ?? '');
  const removeItemMutation = useRemoveTreatmentPlanItemMutation(planId ?? '', patientId ?? '');

  const toothStates = plan?.items ? buildToothStates(plan.items) : undefined;
  const patientName = plan?.patient
    ? [plan.patient.firstName, plan.patient.lastName].filter(Boolean).join(' ')
    : 'Patient';

  const handleAddItem = async (values: AddPlanItemFormValues) => {
    try {
      await addItemMutation.mutateAsync({
        toothNumber: values.toothNumber,
        procedureId: values.procedureId,
        conditionTag: values.conditionTag ?? undefined,
        estimatedCost: values.estimatedCost ?? undefined,
        priority: values.priority,
      });
      toast({ title: 'Item added', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to add item',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemMutation.mutateAsync(itemId);
      toast({ title: 'Item removed', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to remove item',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleNotesChange = async (html: string) => {
    if (!planId) return;
    try {
      await updatePlanMutation.mutateAsync({ clinicalNotes: html });
    } catch {
      toast({ title: 'Failed to save notes', status: 'error' });
    }
  };

  const handleStatusChange = async (status: 'Planned' | 'In Progress' | 'Completed') => {
    if (!planId) return;
    try {
      await updatePlanMutation.mutateAsync({ status });
      toast({ title: 'Status updated', status: 'success', duration: 2000 });
    } catch {
      toast({ title: 'Failed to update status', status: 'error' });
    }
  };

  if (!patientId || !planId) {
    return (
      <Box>
        <Text color="red.500">Missing patient or plan ID</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to patients
        </Button>
      </Box>
    );
  }

  if (isLoading || !plan) {
    return (
      <Box>
        <Skeleton height="32px" w="200px" mb={4} />
        <Skeleton height="200px" mb={4} />
        <Skeleton height="120px" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Text color="red.500">Treatment plan not found</Text>
        <Button mt={2} onClick={() => navigate(`/patients/${patientId}/treatments`)}>
          Back to plans
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={6} gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/patients/${patientId}/treatments`)}
        >
          Back
        </Button>
        <Box flex={1}>
          <Heading size="lg">Treatment plan</Heading>
          <Text fontSize="sm" color="gray.600">
            {patientName}
          </Text>
        </Box>
        <Select
          size="sm"
          w="140px"
          value={plan.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as 'Planned' | 'In Progress' | 'Completed')
          }
        >
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </Select>
        <Badge colorScheme="teal">{plan.status}</Badge>
      </HStack>

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>Chart &amp; items</Tab>
          <Tab>Clinical notes</Tab>
          <Tab>Prescriptions</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="sm" mb={2}>
                  Dental chart (FDI)
                </Heading>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Click a tooth to select, then add a treatment item for it.
                </Text>
                <DentalChart
                  toothStates={toothStates}
                  selectedTooth={selectedTooth}
                  onToothClick={setSelectedTooth}
                />
                {/* <Wrap mt={2} spacing={2}>
                  {TOOTH_CONDITIONS.map((c) => (
                    <WrapItem key={c.value}>
                      <HStack spacing={1}>
                        <Box w="3" h="3" borderRadius="sm" bg={c.color} />
                        <Text fontSize="xs">{c.label}</Text>
                      </HStack>
                    </WrapItem>
                  ))}
                </Wrap> */}
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm">Plan items</Heading>
                  <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      setAddItemOpen(true);
                    }}
                  >
                    Add item
                  </Button>
                </HStack>
                <AddPlanItemModal
                  isOpen={addItemOpen}
                  onClose={() => setAddItemOpen(false)}
                  procedures={procedures ?? []}
                  defaultTooth={selectedTooth}
                  onSubmit={handleAddItem}
                  isSubmitting={addItemMutation.isPending}
                />
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Tooth</Th>
                        <Th>Procedure</Th>
                        <Th>Condition</Th>
                        <Th>Est. cost</Th>
                        <Th>Priority</Th>
                        <Th w="40px" />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(plan.items ?? [])
                        .sort((a, b) => a.priority - b.priority || a.toothNumber - b.toothNumber)
                        .map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.toothNumber}</Td>
                            <Td>
                              {item.procedure
                                ? `${item.procedure.code} — ${item.procedure.name}`
                                : item.procedureId}
                            </Td>
                            <Td>{item.conditionTag ?? '—'}</Td>
                            <Td>{item.estimatedCost ?? '—'}</Td>
                            <Td>{item.priority}</Td>
                            <Td>
                              <IconButton
                                aria-label="Remove"
                                size="xs"
                                variant="ghost"
                                icon={<DeleteIcon />}
                                onClick={() => handleRemoveItem(item.id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </Box>
                {(!plan.items || plan.items.length === 0) && (
                  <Text fontSize="sm" color="gray.500" py={4}>
                    No items yet. Add one from the dental chart or &quot;Add item&quot;.
                  </Text>
                )}
              </Box>
            </VStack>
          </TabPanel>
          <TabPanel>
            <Box>
              <Heading size="sm" mb={2}>
                Clinical notes
              </Heading>
              <ClinicalNotesEditor
                value={plan.clinicalNotes ?? ''}
                onChange={handleNotesChange}
                minHeight="200px"
              />
            </Box>
          </TabPanel>
          <TabPanel>
            <PrescriptionPad
              patientId={patientId}
              patientName={patientName}
              treatmentPlanId={plan.id}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
