import { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Checkbox,
  CheckboxGroup,
  Switch,
  useToast,
  Alert,
  AlertIcon,
  HStack,
  Wrap,
  Select,
} from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import { useCreateMainBranchMutation } from '../hooks/use-branches';
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

export function CreateBranchPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateMainBranchMutation();

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff', 'branch-admins'],
    queryFn: () => staffApi.list(),
    enabled: isSuperAdmin,
  });
  const branchAdmins = staffList.filter((s) => s.role === 'BranchAdmin');

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/settings/branches', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
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
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isActive: true,
    },
  });

  const workingDays = watch('workingDays');

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        code: values.code.toUpperCase(),
        address: values.address,
        city: values.city,
        phone: values.phone,
        email: values.email || null,
        managerUserId: values.managerUserId || null,
        openingTime: values.openingTime,
        closingTime: values.closingTime,
        workingDays: values.workingDays,
        isActive: values.isActive,
      });
      toast({ title: 'Branch created successfully', status: 'success', isClosable: true });
      navigate('/settings/branches');
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message : 'Failed to create branch';
      toast({ title: Array.isArray(msg) ? msg[0] : String(msg), status: 'error', isClosable: true });
    }
  };

  if (!isSuperAdmin) {
    return (
      <Box>
        <Alert status="error">
          <AlertIcon />
          You do not have permission to create branches. Contact your Super Admin.
        </Alert>
        <Button as={RouterLink} to="/settings/branches" mt={4}>
          Back to Branch Management
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={4}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Branch Name *</FormLabel>
            <Input {...register('name')} placeholder="e.g. Main Branch" />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.code}>
            <FormLabel>Branch Code *</FormLabel>
            <Input
              {...register('code')}
              placeholder="e.g. KHI-01"
              onChange={(e) => setValue('code', e.target.value.toUpperCase())}
            />
            <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
          </FormControl>
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
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Phone *</FormLabel>
            <Input {...register('phone')} type="tel" />
            <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input {...register('email')} type="email" />
          </FormControl>
          {isSuperAdmin && branchAdmins.length > 0 && (
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
            <CheckboxGroup
              value={workingDays}
              onChange={(v) => setValue('workingDays', v as string[])}
            >
              <Wrap>
                {WORKING_DAYS.map((d) => (
                  <Checkbox key={d} value={d}>
                    {d}
                  </Checkbox>
                ))}
              </Wrap>
            </CheckboxGroup>
            <FormErrorMessage>{errors.workingDays?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Active Status</FormLabel>
            <Switch
              isChecked={watch('isActive')}
              onChange={(e) => setValue('isActive', e.target.checked)}
            />
          </FormControl>
          <HStack>
            <Button type="submit" colorScheme="teal" isLoading={createMutation.isPending}>
              Create Branch
            </Button>
            <Button as={RouterLink} to="/settings/branches" variant="outline">
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
