import { useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  CheckboxGroup,
  Switch,
  useToast,
  HStack,
  Wrap,
  Select,
  Checkbox,
} from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import { useBranchDetail, useUpdateBranchMutation } from '../hooks/use-branches';
import { staffApi } from '@/modules/staff/api';
import { useQuery } from '@tanstack/react-query';

const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const schema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  code: z.string().min(1, 'Code is required').regex(/^[A-Z0-9\-]+$/i, 'Uppercase letters, numbers and dashes only'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().optional().nullable(),
  managerUserId: z.string().uuid().optional().nullable(),
  openingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:mm'),
  closingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:mm'),
  workingDays: z.array(z.string()).min(1, 'Select at least one working day'),
  isActive: z.boolean(),
}).refine((d) => d.openingTime < d.closingTime, { message: 'Opening time must be before closing time', path: ['closingTime'] });

type FormValues = z.infer<typeof schema>;

export function EditBranchPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isBranchAdmin = user?.role === 'BranchAdmin';
  const canEditSensitive = isSuperAdmin;
  const navigate = useNavigate();
  const toast = useToast();
  const { data: branch, isLoading } = useBranchDetail(id ?? null, !!id);
  const updateMutation = useUpdateBranchMutation(id ?? '');

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff', 'branch-admins'],
    queryFn: () => staffApi.list(),
    enabled: isSuperAdmin && !!id,
  });
  const branchAdmins = staffList.filter((s) => s.role === 'BranchAdmin');

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      managerUserId: null,
      openingTime: '09:00',
      closingTime: '18:00',
      workingDays: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        code: branch.code,
        address: branch.address,
        city: branch.city,
        phone: branch.phone,
        email: branch.email ?? '',
        managerUserId: branch.managerUserId ?? null,
        openingTime: branch.openingTime,
        closingTime: branch.closingTime,
        workingDays: branch.workingDays ?? [],
        isActive: branch.isActive,
      });
    }
  }, [branch, reset]);

  const workingDays = watch('workingDays');

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    try {
      const payload: any = {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        openingTime: values.openingTime,
        closingTime: values.closingTime,
        workingDays: values.workingDays,
        isActive: values.isActive,
      };
      if (canEditSensitive) {
        payload.code = values.code.toUpperCase();
        payload.address = values.address;
        payload.city = values.city;
        payload.managerUserId = values.managerUserId || null;
      }
      await updateMutation.mutateAsync(payload);
      toast({ title: 'Branch updated', status: 'success', isClosable: true });
      navigate(`/settings/branches/${id}`);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message : 'Failed to update';
      toast({ title: Array.isArray(msg) ? msg[0] : String(msg), status: 'error', isClosable: true });
    }
  };

  if (isLoading || !branch) return <Box>Loading...</Box>;

  return (
    <Box maxW="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={4}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Branch Name *</FormLabel>
            <Input {...register('name')} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          {canEditSensitive && (
            <FormControl isInvalid={!!errors.code}>
              <FormLabel>Branch Code *</FormLabel>
              <Input {...register('code')} onChange={(e) => setValue('code', e.target.value.toUpperCase())} />
              <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
            </FormControl>
          )}
          {canEditSensitive && (
            <>
              <FormControl isInvalid={!!errors.address}>
                <FormLabel>Address *</FormLabel>
                <Textarea {...register('address')} rows={2} />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.city}>
                <FormLabel>City *</FormLabel>
                <Input {...register('city')} />
                <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
              </FormControl>
            </>
          )}
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Phone *</FormLabel>
            <Input {...register('phone')} type="tel" />
            <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input {...register('email')} type="email" />
          </FormControl>
          {canEditSensitive && branchAdmins.length > 0 && (
            <FormControl>
              <FormLabel>Assign Manager</FormLabel>
              <Select
                placeholder="Select Branch Admin"
                value={watch('managerUserId') ?? ''}
                onChange={(e) => setValue('managerUserId', e.target.value || null)}
              >
                {branchAdmins.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.email})
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl isInvalid={!!errors.openingTime}>
            <FormLabel>Opening Time *</FormLabel>
            <Input {...register('openingTime')} type="time" />
            <FormErrorMessage>{errors.openingTime?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.closingTime}>
            <FormLabel>Closing Time *</FormLabel>
            <Input {...register('closingTime')} type="time" />
            <FormErrorMessage>{errors.closingTime?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.workingDays}>
            <FormLabel>Working Days *</FormLabel>
            <CheckboxGroup value={workingDays} onChange={(v) => setValue('workingDays', v as string[])}>
              <Wrap>
                {WORKING_DAYS.map((d) => (
                  <Checkbox key={d} value={d}>{d}</Checkbox>
                ))}
              </Wrap>
            </CheckboxGroup>
            <FormErrorMessage>{errors.workingDays?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Active Status</FormLabel>
            <Switch isChecked={watch('isActive')} onChange={(e) => setValue('isActive', e.target.checked)} />
          </FormControl>
          <HStack>
            <Button type="submit" colorScheme="teal" isLoading={updateMutation.isPending}>
              Save
            </Button>
            <Button as={RouterLink} to={`/settings/branches/${id}`} variant="outline">
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
