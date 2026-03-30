import { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Switch,
  NumberInput,
  NumberInputField,
  useDisclosure,
} from '@chakra-ui/react';
import { usePlansQuery, useRefreshSubscription } from '../hooks/use-subscription';
import { subscriptionApi } from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionKeys } from '../hooks/use-subscription';
import type { SubscriptionPlan } from '@dental-ms/shared-types';

export function SuperAdminPlansPage() {
  const { data: plans = [], isLoading } = usePlansQuery(false);
  const qc = useQueryClient();
  const toast = useToast();
  const refresh = useRefreshSubscription();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    billingInterval: 'month' as 'month' | 'year',
    isActive: true,
    maxPatients: 1000,
    maxStaff: 50,
    imaging: true,
    reports: true,
    inventory: true,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      priceMonthly: 0,
      priceYearly: 0,
      billingInterval: 'month',
      isActive: true,
      maxPatients: 1000,
      maxStaff: 50,
      imaging: true,
      reports: true,
      inventory: true,
    });
    onOpen();
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    const features = (plan.features ?? {}) as Record<string, unknown>;
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? '',
      priceMonthly: Number(plan.priceMonthly) || 0,
      priceYearly: Number(plan.priceYearly) || 0,
      billingInterval: (plan.billingInterval as 'month' | 'year') ?? 'month',
      isActive: plan.isActive,
      maxPatients: (features.maxPatients as number) ?? 1000,
      maxStaff: (features.maxStaff as number) ?? 50,
      imaging: (features.imaging as boolean) ?? true,
      reports: (features.reports as boolean) ?? true,
      inventory: (features.inventory as boolean) ?? true,
    });
    onOpen();
  };

  const createMutation = useMutation({
    mutationFn: () =>
      subscriptionApi.createPlan({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        priceMonthly: form.priceMonthly,
        priceYearly: form.priceYearly,
        billingInterval: form.billingInterval,
        isActive: form.isActive,
        features: {
          maxPatients: form.maxPatients,
          maxStaff: form.maxStaff,
          imaging: form.imaging,
          reports: form.reports,
          inventory: form.inventory,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      onClose();
      toast({ title: 'Plan created', status: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, status: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      editing
        ? subscriptionApi.updatePlan(editing.id, {
            name: form.name,
            slug: form.slug,
            description: form.description || undefined,
            priceMonthly: form.priceMonthly,
            priceYearly: form.priceYearly,
            billingInterval: form.billingInterval,
            isActive: form.isActive,
            features: {
              maxPatients: form.maxPatients,
              maxStaff: form.maxStaff,
              imaging: form.imaging,
              reports: form.reports,
              inventory: form.inventory,
            },
          })
        : Promise.reject(new Error('No plan')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      onClose();
      toast({ title: 'Plan updated', status: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, status: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      toast({ title: 'Plan deleted', status: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, status: 'error' }),
  });

  const submit = () => {
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Plans
      </Heading>
      <Button size="sm" colorScheme="teal" mb={4} onClick={openCreate}>
        Create plan
      </Button>
      {isLoading ? (
        <Skeleton height="200px" />
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Price (month)</Th>
              <Th>Price (year)</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {plans.map((p) => (
              <Tr key={p.id}>
                <Td fontWeight="medium">{p.name}</Td>
                <Td>{p.slug}</Td>
                <Td>${Number(p.priceMonthly).toFixed(2)}</Td>
                <Td>${Number(p.priceYearly).toFixed(2)}</Td>
                <Td>
                  <Badge colorScheme={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'Yes' : 'No'}</Badge>
                </Td>
                <Td>
                  <Button size="xs" mr={2} onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(p.id)}
                    isDisabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Edit plan' : 'Create plan'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Pro"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Slug</FormLabel>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="pro"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Price (monthly)</FormLabel>
              <NumberInput
                value={form.priceMonthly}
                onChange={(_, v) => setForm((f) => ({ ...f, priceMonthly: v }))}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Price (yearly)</FormLabel>
              <NumberInput
                value={form.priceYearly}
                onChange={(_, v) => setForm((f) => ({ ...f, priceYearly: v }))}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={3} display="flex" alignItems="center">
              <FormLabel mb={0}>Active</FormLabel>
              <Switch
                isChecked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
            </FormControl>
            <Heading size="sm" mt={4} mb={2}>
              Features / limits
            </Heading>
            <FormControl mb={3}>
              <FormLabel>Max patients</FormLabel>
              <NumberInput
                value={form.maxPatients}
                onChange={(_, v) => setForm((f) => ({ ...f, maxPatients: v }))}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Max staff</FormLabel>
              <NumberInput
                value={form.maxStaff}
                onChange={(_, v) => setForm((f) => ({ ...f, maxStaff: v }))}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={3} display="flex" alignItems="center">
              <FormLabel mb={0}>Imaging</FormLabel>
              <Switch
                isChecked={form.imaging}
                onChange={(e) => setForm((f) => ({ ...f, imaging: e.target.checked }))}
              />
            </FormControl>
            <FormControl mb={3} display="flex" alignItems="center">
              <FormLabel mb={0}>Reports</FormLabel>
              <Switch
                isChecked={form.reports}
                onChange={(e) => setForm((f) => ({ ...f, reports: e.target.checked }))}
              />
            </FormControl>
            <FormControl mb={3} display="flex" alignItems="center">
              <FormLabel mb={0}>Inventory</FormLabel>
              <Switch
                isChecked={form.inventory}
                onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.checked }))}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={submit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
