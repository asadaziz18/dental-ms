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
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { usePatientQuery } from '@/modules/patients/hooks/use-patients';
import {
  useTreatmentPlansByPatientQuery,
  useCreateTreatmentPlanMutation,
  useDeleteTreatmentPlanMutation,
} from '../hooks/use-treatments';

export function PatientTreatmentsPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = useState<'Planned' | 'In Progress' | 'Completed'>('Planned');

  const { data: patient, isLoading: patientLoading } = usePatientQuery(patientId);
  const { data: plans, isLoading: plansLoading } = useTreatmentPlansByPatientQuery(patientId);
  const createMutation = useCreateTreatmentPlanMutation(patientId ?? '');
  const deleteMutation = useDeleteTreatmentPlanMutation(patientId ?? '');

  const handleCreate = async () => {
    if (!patientId) return;
    try {
      const plan = await createMutation.mutateAsync({ status });
      onClose();
      toast({ title: 'Treatment plan created', status: 'success', duration: 2000 });
      navigate(`/patients/${patientId}/treatments/${plan.id}`);
    } catch (e) {
      toast({
        title: 'Failed to create plan',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this treatment plan?')) return;
    try {
      await deleteMutation.mutateAsync(planId);
      toast({ title: 'Plan deleted', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to delete plan',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  if (!patientId) {
    return (
      <Box>
        <Text color="red.500">Missing patient ID</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to patients
        </Button>
      </Box>
    );
  }

  const patientName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Patient'
    : 'Patient';

  return (
    <Box>
      <HStack mb={6} gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          Back
        </Button>
        <Box flex={1}>
          <Heading size="lg">Treatment plans</Heading>
          <Text fontSize="sm" color="gray.600">
            {patientName}
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          size="sm"
          colorScheme="teal"
          onClick={onOpen}
        >
          New plan
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New treatment plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel size="sm">Initial status</FormLabel>
              <Select
                size="sm"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Planned' | 'In Progress' | 'Completed')
                }
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleCreate} isLoading={createMutation.isPending}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {patientLoading || plansLoading ? (
        <Skeleton height="120px" />
      ) : (
        <VStack align="stretch" spacing={3}>
          {(plans?.length ?? 0) === 0 ? (
            <Text color="gray.500">No treatment plans yet. Create one to get started.</Text>
          ) : (
            plans!.map((plan) => (
              <Box
                key={plan.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                _hover={{ shadow: 'md' }}
              >
                <HStack justify="space-between">
                  <HStack>
                    <Badge colorScheme="teal">{plan.status}</Badge>
                    <Text fontSize="sm" color="gray.600">
                      {plan.items?.length ?? 0} items
                      {plan.doctor ? ` · ${plan.doctor.fullName}` : ''}
                    </Text>
                  </HStack>
                  <HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="teal"
                      onClick={() =>
                        navigate(`/patients/${patientId}/treatments/${plan.id}`)
                      }
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(plan.id)}
                      isLoading={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </HStack>
                </HStack>
                {plan.clinicalNotes && (
                  <Text fontSize="xs" color="gray.500" mt={2} noOfLines={2}>
                    {plan.clinicalNotes.replace(/<[^>]*>/g, '')}
                  </Text>
                )}
              </Box>
            ))
          )}
        </VStack>
      )}
    </Box>
  );
}
