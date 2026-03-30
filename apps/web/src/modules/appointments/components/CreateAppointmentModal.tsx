import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Switch,
  useToast,
  VStack,
  List,
  ListItem,
  Box,
  Text,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AppointmentType } from '@dental-ms/shared-types';
import { useCreateAppointmentMutation, useDoctorsQuery } from '../hooks/use-appointments';
import { usePatientsQuery } from '@/modules/patients/hooks/use-patients';
import { useBranchId } from '@/core/branch';
import { APPOINTMENT_TYPES } from '@dental-ms/shared-types';

const schema = z.object({
  patientId: z.string().min(1, 'Select a patient'),
  doctorId: z.string().optional().nullable(),
  chair: z.string().optional().nullable(),
  start: z.string().min(1, 'Start is required'),
  end: z.string().min(1, 'End is required'),
  type: z.enum(APPOINTMENT_TYPES),
  sendReminder: z.boolean(),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStart?: string;
  initialEnd?: string;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  initialStart,
  initialEnd,
}: CreateAppointmentModalProps) {
  const toast = useToast();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const branchId = useBranchId();
  const createMutation = useCreateAppointmentMutation();
  const { data: doctors = [] } = useDoctorsQuery(branchId);
  const { data: patientsData } = usePatientsQuery({
    search: patientSearch || undefined,
    branchId: branchId ?? undefined,
    page: 1,
    limit: 10,
  });

  const patients = patientsData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: '',
      doctorId: null,
      chair: null,
      start: initialStart ?? '',
      end: initialEnd ?? '',
      type: 'consultation',
      sendReminder: true,
      notes: null,
    },
  });

  const start = watch('start');
  const end = watch('end');

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        patientId: data.patientId,
        doctorId: data.doctorId || null,
        chair: data.chair || null,
        start: data.start,
        end: data.end,
        type: data.type as AppointmentType,
        status: 'Scheduled',
        sendReminder: data.sendReminder,
        notes: data.notes || null,
      });
      toast({ title: 'Appointment created', status: 'success', duration: 2000 });
      reset();
      setSelectedPatientId(null);
      setPatientSearch('');
      onClose();
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : e instanceof Error ? e.message : 'Failed to create';
      toast({ title: 'Error', description: String(message), status: 'error' });
    }
  };

  useEffect(() => {
    if (isOpen && initialStart) setValue('start', initialStart);
    if (isOpen && initialEnd) setValue('end', initialEnd);
  }, [isOpen, initialStart, initialEnd, setValue]);

  const handleClose = () => {
    reset();
    setSelectedPatientId(null);
    setPatientSearch('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New appointment</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" id="create-appointment-form" onSubmit={handleSubmit(onSubmit)}>
          <VStack align="stretch" spacing={4}>
            <FormControl isInvalid={!!errors.patientId}>
              <FormLabel>Patient</FormLabel>
              <Input
                placeholder="Search patient by name, phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                mb={2}
              />
              <input type="hidden" {...register('patientId')} />
              {selectedPatientId ? (
                <Box
                  p={2}
                  bg="teal.50"
                  borderRadius="md"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text>
                    {patients.find((p) => p.id === selectedPatientId)?.firstName}{' '}
                    {patients.find((p) => p.id === selectedPatientId)?.lastName}
                  </Text>
                  <Button size="xs" onClick={() => { setSelectedPatientId(null); setValue('patientId', ''); }}>
                    Clear
                  </Button>
                </Box>
              ) : (
                <List borderWidth="1px" borderRadius="md" maxH="120px" overflowY="auto">
                  {patients.map((p) => (
                    <ListItem
                      key={p.id}
                      px={3}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setValue('patientId', p.id);
                      }}
                    >
                      {p.firstName} {p.lastName} {p.phone && `· ${p.phone}`}
                    </ListItem>
                  ))}
                  {patientSearch && patients.length === 0 && (
                    <ListItem px={3} py={2} color="gray.500">
                      No patients found
                    </ListItem>
                  )}
                </List>
              )}
              <FormErrorMessage>{errors.patientId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Doctor</FormLabel>
              <Select {...register('doctorId')} placeholder="Select doctor">
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Chair / Room</FormLabel>
              <Input {...register('chair')} placeholder="e.g. Chair 1" />
            </FormControl>

            <FormControl isInvalid={!!errors.start}>
              <FormLabel>Start</FormLabel>
              <Input type="datetime-local" {...register('start')} />
              <FormErrorMessage>{errors.start?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.end}>
              <FormLabel>End</FormLabel>
              <Input type="datetime-local" {...register('end')} />
              <FormErrorMessage>{errors.end?.message}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select {...register('type')}>
                <option value="consultation">Consultation</option>
                <option value="procedure">Procedure</option>
                <option value="follow-up">Follow-up</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Send reminder</FormLabel>
              <Controller
                name="sendReminder"
                control={control}
                render={({ field }) => (
                  <Switch
                    isChecked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea {...register('notes')} rows={2} placeholder="Notes" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            type="submit"
            form="create-appointment-form"
            isLoading={createMutation.isPending}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
