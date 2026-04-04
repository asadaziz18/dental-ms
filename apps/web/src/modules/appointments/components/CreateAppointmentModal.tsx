import { useState, useEffect, useMemo, useRef } from 'react';
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Appointment, AppointmentType } from '@dental-ms/shared-types';
import { useCreateAppointmentMutation, useDoctorsQuery } from '../hooks/use-appointments';
import { usePatientsQuery } from '@/modules/patients/hooks/use-patients';
import { useBranchId } from '@/core/branch';
import { APPOINTMENT_TYPES } from '@dental-ms/shared-types';
import { useBranchDetail } from '@/modules/branches/hooks/use-branches';
import { useBookingSlipPlatformSettingsQuery } from '@/modules/platform-settings';
import { downloadAppointmentBookingSlip } from '../utils/download-booking-slip';

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
  const [slipAppointment, setSlipAppointment] = useState<Appointment | null>(null);
  const slipCancelRef = useRef<HTMLButtonElement>(null);

  const branchId = useBranchId();
  const { data: branch } = useBranchDetail(
    branchId,
    !!branchId && (isOpen || !!slipAppointment),
  );
  const { data: slipSettings } = useBookingSlipPlatformSettingsQuery(
    isOpen || !!slipAppointment,
  );

  const clinic = useMemo(() => {
    if (!branch) {
      return { name: 'Clinic' as const };
    }
    return {
      name: branch.name,
      address: branch.address || null,
      city: branch.city || null,
      phone: branch.phone || null,
      email: branch.email || null,
      code: branch.code || null,
      openingTime: branch.openingTime || null,
      closingTime: branch.closingTime || null,
    };
  }, [branch]);
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

  const onSubmit = async (data: FormData) => {
    try {
      const created = await createMutation.mutateAsync({
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
      reset();
      setSelectedPatientId(null);
      setPatientSearch('');
      onClose();
      toast({
        title: 'Appointment created',
        description: 'When the slip dialog appears, pick Standard (A4) or Thermal (80mm).',
        status: 'success',
        duration: 5000,
      });
      // Open after the create modal finishes closing so the slip dialog is not hidden under its overlay.
      window.setTimeout(() => setSlipAppointment(created), 380);
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

  const handleSlipDownload = async (variant: 'standard' | 'thermal') => {
    if (!slipAppointment) return;
    try {
      await downloadAppointmentBookingSlip({
        variant,
        appointment: slipAppointment,
        clinic,
        productOwnerFooter: slipSettings?.productOwnerFooter,
      });
      toast({
        title: 'PDF saved',
        description:
          variant === 'thermal'
            ? 'Thermal (80mm) slip saved to your downloads.'
            : 'Standard (A4) slip saved to your downloads.',
        status: 'success',
        duration: 2500,
      });
    } catch (pdfErr: unknown) {
      toast({
        title: 'Could not create PDF',
        description:
          pdfErr instanceof Error ? pdfErr.message : 'Unexpected error.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
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

    <AlertDialog
      isOpen={!!slipAppointment}
      leastDestructiveRef={slipCancelRef}
      onClose={() => setSlipAppointment(null)}
    >
      <AlertDialogOverlay bg="blackAlpha.600" zIndex={2000}>
        <AlertDialogContent zIndex={2001}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Download booking slip
          </AlertDialogHeader>
          <AlertDialogBody>
            Nothing extra to enable in Settings: pick a format here after each create. Standard (A4) is
            full letter size; Thermal (80mm) is a narrow receipt page (different layout and font). Filenames
            contain &quot;a4&quot; or &quot;thermal-80mm&quot;. If both look similar on screen, open File →
            Properties (or similar) to confirm page width.
          </AlertDialogBody>
          <AlertDialogFooter flexWrap="wrap" gap={2}>
            <Button ref={slipCancelRef} onClick={() => setSlipAppointment(null)}>
              Skip
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void handleSlipDownload('thermal');
              }}
            >
              Thermal (80mm)
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                void handleSlipDownload('standard');
              }}
            >
              Standard (A4)
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
    </>
  );
}
