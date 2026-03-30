import { useParams, useNavigate } from 'react-router-dom';
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
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useLabOrderQuery, useUpdateLabOrderMutation } from '../hooks/use-labs';
import { useLabVendorsQuery } from '../hooks/use-labs';
import { usePatientsQuery } from '@/modules/patients/hooks/use-patients';
import { staffApi } from '@/modules/staff/api';
import { useQuery } from '@tanstack/react-query';
import { useBranchId } from '@/core/branch';

const schema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  vendorId: z.string().min(1),
  workType: z.enum(['crown_bridge', 'denture', 'orthodontic', 'veneer_laminate', 'implant', 'custom']),
  customWorkType: z.string().optional(),
  toothNumbers: z.string().min(1),
  shade: z.string().optional(),
  material: z.string().optional(),
  instructions: z.string().optional(),
  priority: z.enum(['normal', 'urgent']),
  sentToLabAt: z.string().optional().nullable(),
  expectedTrialDate: z.string().optional().nullable(),
  finalDeliveryDate: z.string().optional().nullable(),
  labFee: z.number().optional().nullable(),
  isPaid: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const WORK_TYPES = [
  { value: 'crown_bridge', label: 'Crown & Bridge' },
  { value: 'denture', label: 'Denture' },
  { value: 'orthodontic', label: 'Orthodontic' },
  { value: 'veneer_laminate', label: 'Veneer & Laminate' },
  { value: 'implant', label: 'Implant' },
  { value: 'custom', label: 'Custom' },
];

export function EditLabOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const branchId = useBranchId();
  const { data: order, isLoading } = useLabOrderQuery(id);
  const updateMutation = useUpdateLabOrderMutation(id ?? '');
  const { data: patientsData } = usePatientsQuery({ branchId: branchId ?? undefined, limit: 100 });
  const patients = patientsData?.data ?? [];
  const { data: vendors = [] } = useLabVendorsQuery({});
  const { data: staffList = [] } = useQuery({
    queryKey: ['staff', 'branch', branchId],
    queryFn: () => staffApi.list(branchId ?? undefined),
    enabled: !!branchId,
  });
  const doctors = staffList.filter((s) => s.role === 'Doctor');

  const { register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: order
      ? {
          patientId: order.patientId,
          doctorId: order.doctorId,
          vendorId: order.vendorId,
          workType: (order.workType as any) ?? 'crown_bridge',
          customWorkType: order.customWorkType ?? '',
          toothNumbers: (order.toothNumbers || []).join(', '),
          shade: order.shade ?? '',
          material: order.material ?? '',
          instructions: order.instructions ?? '',
          priority: (order.priority as any) ?? 'normal',
          sentToLabAt: order.sentToLabAt ? order.sentToLabAt.slice(0, 10) : null,
          expectedTrialDate: order.expectedTrialDate ? order.expectedTrialDate.slice(0, 10) : null,
          finalDeliveryDate: order.finalDeliveryDate ? order.finalDeliveryDate.slice(0, 10) : null,
          labFee: order.labFee != null ? parseFloat(order.labFee) : null,
          isPaid: order.isPaid,
        }
      : undefined,
  });

  const workType = watch('workType');

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    try {
      const toothNumbers = values.toothNumbers.split(/[\s,]+/).filter(Boolean);
      await updateMutation.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId,
        vendorId: values.vendorId,
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
      toast({ title: 'Order updated', status: 'success', duration: 2000 });
      navigate(`/labs/orders/${id}`);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  if (isLoading || !order) {
    return <Skeleton height="400px" />;
  }

  return (
    <Box>
      <Button leftIcon={<ArrowBackIcon />} variant="ghost" size="sm" mb={4} onClick={() => navigate(`/labs/orders/${id}`)}>
        Back to order
      </Button>
      <Heading size="lg" mb={6}>Edit Lab Order</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={6} maxW="2xl">
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel>Patient *</FormLabel>
              <Select {...register('patientId')}>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Doctor *</FormLabel>
              <Select {...register('doctorId')}>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Vendor *</FormLabel>
            <Select {...register('vendorId')}>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Work Type</FormLabel>
            <Select {...register('workType')}>
              {WORK_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>
          {workType === 'custom' && (
            <FormControl>
              <FormLabel>Custom Work Type</FormLabel>
              <Input {...register('customWorkType')} />
            </FormControl>
          )}
          <FormControl>
            <FormLabel>Tooth Numbers</FormLabel>
            <Input {...register('toothNumbers')} placeholder="11, 12, 21" />
          </FormControl>
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel>Shade</FormLabel>
              <Input {...register('shade')} />
            </FormControl>
            <FormControl>
              <FormLabel>Material</FormLabel>
              <Input {...register('material')} />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Instructions</FormLabel>
            <Textarea {...register('instructions')} rows={3} />
          </FormControl>
          <FormControl>
            <FormLabel>Priority</FormLabel>
            <Select {...register('priority')}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormControl>
          <SimpleGrid columns={3} spacing={4}>
            <FormControl>
              <FormLabel>Sent to Lab</FormLabel>
              <Input type="date" {...register('sentToLabAt')} />
            </FormControl>
            <FormControl>
              <FormLabel>Expected Trial</FormLabel>
              <Input type="date" {...register('expectedTrialDate')} />
            </FormControl>
            <FormControl>
              <FormLabel>Final Delivery</FormLabel>
              <Input type="date" {...register('finalDeliveryDate')} />
            </FormControl>
          </SimpleGrid>
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
          <HStack>
            <Button type="submit" colorScheme="teal" isLoading={updateMutation.isPending}>
              Save
            </Button>
            <Button variant="outline" onClick={() => navigate(`/labs/orders/${id}`)}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
