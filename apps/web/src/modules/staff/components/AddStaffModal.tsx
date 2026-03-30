import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { StaffRole } from '@dental-ms/shared-types';
import type { CreateStaffInput } from '@dental-ms/shared-types';
import { useCreateStaffMutation } from '../hooks/use-staff';
import { ROLE_LABELS } from '../constants';

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required').max(100),
    role: z.enum(['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse']),
    branchId: z.string().uuid().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'SuperAdmin') return true;
      return !!data.branchId;
    },
    { message: 'Branch is required for this role', path: ['branchId'] },
  );

type FormValues = z.infer<typeof schema>;

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBranchId?: string | null;
  currentUserRole: StaffRole;
}

async function fetchBranches(): Promise<{ id: string; name: string }[]> {
  const { data } = await api.get<{ id: string; name: string }[]>('/branches');
  return data;
}

export function AddStaffModal({
  isOpen,
  onClose,
  defaultBranchId,
  currentUserRole,
}: AddStaffModalProps) {
  const toast = useToast();
  const createMutation = useCreateStaffMutation();
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    enabled: isOpen && (currentUserRole === 'SuperAdmin' || !defaultBranchId),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'Receptionist',
      branchId: defaultBranchId ?? '',
      isActive: true,
    },
  });

  const role = watch('role');
  const isSuperAdmin = currentUserRole === 'SuperAdmin';
  const branchRequired = role !== 'SuperAdmin';

  const onSubmit = async (values: FormValues) => {
    try {
      const body: CreateStaffInput = {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role as StaffRole,
        isActive: values.isActive ?? true,
      };
      if (isSuperAdmin && values.branchId) {
        body.branchId = values.branchId;
      } else if (!isSuperAdmin && defaultBranchId) {
        body.branchId = defaultBranchId;
      } else if (values.branchId) {
        body.branchId = values.branchId;
      }
      await createMutation.mutateAsync(body);
      toast({ title: 'Staff member added', status: 'success', isClosable: true });
      reset();
      onClose();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : 'Failed to add staff';
      toast({
        title: Array.isArray(msg) ? msg[0] : String(msg),
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add staff member</ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.fullName}>
                <FormLabel>Full name</FormLabel>
                <Input {...register('fullName')} placeholder="Full name" />
                <FormErrorMessage>{errors.fullName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" {...register('email')} placeholder="email@clinic.com" />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input type="password" {...register('password')} placeholder="Min 6 characters" />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.role}>
                <FormLabel>Role</FormLabel>
                <Select {...register('role')}>
                  {(Object.keys(ROLE_LABELS) as StaffRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
              </FormControl>
              {(isSuperAdmin || !defaultBranchId) && (
                <FormControl isInvalid={!!errors.branchId}>
                  <FormLabel>Branch {branchRequired ? '(required for this role)' : ''}</FormLabel>
                  <Select
                    {...register('branchId')}
                    placeholder="Select branch"
                    defaultValue={defaultBranchId ?? ''}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.branchId?.message}</FormErrorMessage>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={createMutation.isPending}
              loadingText="Adding..."
            >
              Add staff
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
