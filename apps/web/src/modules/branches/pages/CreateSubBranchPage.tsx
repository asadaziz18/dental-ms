import { useEffect, useMemo, useState } from 'react';
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
  Alert,
  AlertIcon,
  HStack,
  Wrap,
  Select,
  Checkbox,
} from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import { useCreateSubBranchMutation, useBranchTree } from '../hooks/use-branches';
import { staffApi } from '@/modules/staff/api';
import { useQuery } from '@tanstack/react-query';
import type { BranchTreeItem } from '../api';

function flattenBranches(items: BranchTreeItem[]): BranchTreeItem[] {
  const out: BranchTreeItem[] = [];
  for (const b of items) {
    out.push(b);
    if (b.subBranches?.length) out.push(...flattenBranches(b.subBranches));
  }
  return out;
}

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

export function CreateSubBranchPage() {
  const { id: parentIdFromUrl } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentIdFromUrl ?? null);
  const [customCode, setCustomCode] = useState('');
  const [customName, setCustomName] = useState('');
  const [nameFromList, setNameFromList] = useState(true);
  const [codeFromList, setCodeFromList] = useState(true);
  const { data: branchTree = [] } = useBranchTree();
  const allBranches = useMemo(() => flattenBranches(branchTree), [branchTree]);
  const branchCodes = useMemo(() => [...new Set(allBranches.map((b) => b.code))].sort(), [allBranches]);
  const branchNames = useMemo(() => [...new Set(allBranches.map((b) => b.name))].sort(), [allBranches]);
  const createMutation = useCreateSubBranchMutation(selectedParentId ?? '');
  const ENTER_NEW = '__enter_new__';
  const showCustomNameInput = !nameFromList;
  const showCustomCodeInput = !codeFromList;

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

  useEffect(() => {
    if (parentIdFromUrl && allBranches.some((b) => b.id === parentIdFromUrl)) {
      setSelectedParentId(parentIdFromUrl);
    }
  }, [parentIdFromUrl, allBranches]);

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
      openingTime: '10:00',
      closingTime: '19:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      isActive: true,
    },
  });

  const workingDays = watch('workingDays');

  const onSubmit = async (values: FormValues) => {
    if (!selectedParentId) {
      toast({ title: 'Please select a parent branch', status: 'warning', isClosable: true });
      return;
    }
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
      toast({ title: 'Sub-branch created successfully', status: 'success', isClosable: true });
      navigate('/settings/branches');
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message : 'Failed to create sub-branch';
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
          <FormControl isInvalid={!selectedParentId}>
            <FormLabel>Parent Branch *</FormLabel>
            <Select
              placeholder="Select parent branch (code – name)"
              value={selectedParentId ?? ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
            >
              {allBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} – {b.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>Select a parent branch</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Branch Name *</FormLabel>
            <Select
              placeholder="Select branch name"
              value={nameFromList && branchNames.includes(watch('name')) ? watch('name') : ENTER_NEW}
              onChange={(e) => {
                const v = e.target.value;
                if (v === ENTER_NEW) {
                  setNameFromList(false);
                  setValue('name', customName, { shouldValidate: true });
                } else {
                  setNameFromList(true);
                  setValue('name', v, { shouldValidate: true });
                }
              }}
            >
              {branchNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={ENTER_NEW}>— Enter new name —</option>
            </Select>
            {showCustomNameInput && (
              <Input
                mt={2}
                placeholder="e.g. North Campus Clinic"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setValue('name', e.target.value, { shouldValidate: true });
                }}
              />
            )}
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.code}>
            <FormLabel>Branch Code *</FormLabel>
            <Select
              placeholder="Select branch code"
              value={codeFromList && branchCodes.includes(watch('code')) ? watch('code') : ENTER_NEW}
              onChange={(e) => {
                const v = e.target.value;
                if (v === ENTER_NEW) {
                  setCodeFromList(false);
                  setValue('code', customCode, { shouldValidate: true });
                } else {
                  setCodeFromList(true);
                  setValue('code', v.toUpperCase(), { shouldValidate: true });
                }
              }}
            >
              {branchCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={ENTER_NEW}>— Enter new code —</option>
            </Select>
            {showCustomCodeInput && (
              <Input
                mt={2}
                placeholder="e.g. KHI-02"
                value={customCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setCustomCode(val);
                  setValue('code', val, { shouldValidate: true });
                }}
              />
            )}
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
            <Button type="submit" colorScheme="teal" isLoading={createMutation.isPending} isDisabled={!selectedParentId}>
              Create Sub-branch
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
