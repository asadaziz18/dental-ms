import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setBranchId } from '@/core/api/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useCreateLabOrderMutation } from '../hooks/use-labs';
import { useLabVendorsQuery } from '../hooks/use-labs';
import { usePatientsQuery } from '@/modules/patients/hooks/use-patients';
import { staffApi } from '@/modules/staff/api';
import { useQuery } from '@tanstack/react-query';
import { useBranchId } from '@/core/branch';

const schema = z.object({
  patientId: z.string().min(1, 'Select patient'),
  doctorId: z.string().min(1, 'Select doctor'),
  vendorId: z.string().min(1, 'Select vendor'),
  treatmentId: z.string().optional(),
  workType: z.enum(['crown_bridge', 'denture', 'orthodontic', 'veneer_laminate', 'implant', 'custom']),
  customWorkType: z.string().optional(),
  toothNumbers: z.string().min(1, 'Enter at least one tooth'),
  shade: z.string().optional(),
  material: z.string().optional(),
  instructions: z.string().optional(),
  priority: z.enum(['normal', 'urgent']),
  sentToLabAt: z.string().optional(),
  expectedTrialDate: z.string().optional(),
  finalDeliveryDate: z.string().optional(),
  labFee: z.number().optional(),
  isPaid: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const WORK_TYPES = [
  { value: 'crown_bridge', label: 'Crown & Bridge' },
  { value: 'denture', label: 'Denture' },
  { value: 'orthodontic', label: 'Orthodontic Appliance' },
  { value: 'veneer_laminate', label: 'Veneer & Laminate' },
  { value: 'implant', label: 'Implant Component' },
  { value: 'custom', label: 'Custom' },
];

const SHADES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'];
const MATERIALS = ['Zirconia', 'PFM', 'Acrylic', 'E-max', 'Other'];

export function CreateLabOrderPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const branchId = useBranchId();
  const createMutation = useCreateLabOrderMutation();

  // Ensure API client has branchId so X-Branch-Id header is sent with requests
  useEffect(() => {
    setBranchId(branchId);
  }, [branchId]);

  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatientsQuery({
    branchId: branchId ?? undefined,
    limit: 100,
  });
  const patients = patientsData?.data ?? [];
  const { data: vendors = [] } = useLabVendorsQuery({});
  const { data: staffList = [] } = useQuery({
    queryKey: ['staff', 'branch', branchId],
    queryFn: () => staffApi.list(branchId ?? undefined),
    enabled: !!branchId,
  });
  const doctors = staffList.filter((s) => s.role === 'Doctor');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      workType: 'crown_bridge',
      priority: 'normal',
      isPaid: false,
      sentToLabAt: new Date().toISOString().slice(0, 10),
    },
  });

  const workType = watch('workType');

  const onSubmit = async (values: FormValues) => {
    try {
      const toothNumbers = values.toothNumbers.split(/[\s,]+/).filter(Boolean);
      const created = await createMutation.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId,
        vendorId: values.vendorId,
        treatmentId: values.treatmentId || null,
        workType: values.workType as any,
        customWorkType: values.workType === 'custom' ? values.customWorkType || null : null,
        toothNumbers,
        shade: values.shade || null,
        material: values.material || null,
        instructions: values.instructions || null,
        priority: values.priority as any,
        sentToLabAt: values.sentToLabAt || null,
        expectedTrialDate: values.expectedTrialDate || null,
        finalDeliveryDate: values.finalDeliveryDate || null,
        labFee: values.labFee ?? null,
        isPaid: values.isPaid,
      });
      toast({ title: 'Lab order created', status: 'success', duration: 2000 });
      navigate(`/labs/orders/${created.id}`);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  return (
    <Box>
      <Button leftIcon={<ArrowBackIcon />} variant="ghost" size="sm" mb={4} onClick={() => navigate('/labs/orders')}>
        Back to orders
      </Button>
      <Heading size="lg" mb={6}>New Lab Order</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={8} maxW="2xl">
          <Box>
            <Heading size="sm" mb={4}>Patient & Doctor</Heading>
            <VStack align="stretch" spacing={4}>
              <FormControl isInvalid={!!errors.patientId}>
                <FormLabel>Patient *</FormLabel>
                <Select
                  placeholder={
                    !branchId
                      ? 'Select a branch (top bar) to load patients'
                      : patientsLoading
                        ? 'Loading patients...'
                        : 'Select patient'
                  }
                  isDisabled={!branchId}
                  {...register('patientId')}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.phone ? ` — ${p.phone}` : ''}
                    </option>
                  ))}
                </Select>
                {!branchId && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Use the branch switcher in the top bar to select a branch, then patients will load here.
                  </Text>
                )}
                {branchId && patientsError && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Could not load patients. Check you are logged in and the API is running (e.g. 401 = session expired).
                  </Text>
                )}
              </FormControl>
              <FormControl isInvalid={!!errors.doctorId}>
                <FormLabel>Doctor *</FormLabel>
                <Select placeholder="Select doctor" {...register('doctorId')}>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.fullName}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </Box>

          <Box>
            <Heading size="sm" mb={4}>Lab & Work Details</Heading>
            <VStack align="stretch" spacing={4}>
              <FormControl isInvalid={!!errors.vendorId}>
                <FormLabel>Vendor *</FormLabel>
                <Select placeholder="Select vendor" {...register('vendorId')}>
                  {vendors.filter((v) => v.isActive).map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.city}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isInvalid={!!errors.workType}>
                <FormLabel>Work Type *</FormLabel>
                <Select {...register('workType')}>
                  {WORK_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormControl>
              {workType === 'custom' && (
                <FormControl>
                  <FormLabel>Custom Work Type</FormLabel>
                  <Input {...register('customWorkType')} placeholder="Describe work type" />
                </FormControl>
              )}
              <FormControl isInvalid={!!errors.toothNumbers}>
                <FormLabel>Tooth Numbers * (FDI e.g. 11, 12, 21)</FormLabel>
                <Input {...register('toothNumbers')} placeholder="11, 12, 21" />
              </FormControl>
              <FormControl>
                <FormLabel>Shade</FormLabel>
                <Select placeholder="Select or type" {...register('shade')}>
                  {SHADES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Material</FormLabel>
                <Select placeholder="Select or type" {...register('material')}>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select {...register('priority')}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Instructions</FormLabel>
                <Textarea {...register('instructions')} rows={3} placeholder="Lab instructions..." />
              </FormControl>
            </VStack>
          </Box>

          <Box>
            <Heading size="sm" mb={4}>Dates</Heading>
            <SimpleGrid columns={3} spacing={4}>
              <FormControl>
                <FormLabel>Sent to Lab *</FormLabel>
                <Input type="date" {...register('sentToLabAt')} />
              </FormControl>
              <FormControl>
                <FormLabel>Expected Trial</FormLabel>
                <Input type="date" {...register('expectedTrialDate')} />
              </FormControl>
              <FormControl>
                <FormLabel>Final Delivery</FormLabel>
                <Input type="date" {...register('finalDeliveryDate')} placeholder="Leave blank if unknown" />
              </FormControl>
            </SimpleGrid>
          </Box>

          <Box>
            <Heading size="sm" mb={4}>Financials</Heading>
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Lab Fee (PKR)</FormLabel>
                <Input type="number" {...register('labFee', { valueAsNumber: true })} />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Paid</FormLabel>
                <input type="checkbox" {...register('isPaid')} style={{ marginLeft: 8 }} />
              </FormControl>
            </SimpleGrid>
          </Box>

          <HStack>
            <Button type="submit" colorScheme="teal" isLoading={createMutation.isPending}>
              Create Order
            </Button>
            <Button variant="outline" onClick={() => navigate('/labs/orders')}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
