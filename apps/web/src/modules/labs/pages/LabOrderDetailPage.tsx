import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import type { LabTrial, LabNotification } from '@dental-ms/shared-types';

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

import {
  useLabOrderQuery,
  useUpdateLabOrderStatusMutation,
  useUpdateLabOrderPaymentMutation,
  useCreateLabTrialMutation,
  useCompleteLabTrialMutation,
} from '../hooks/use-labs';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  sent_to_lab: 'blue',
  trial_scheduled: 'purple',
  trial_in_progress: 'yellow',
  approved: 'teal',
  delivered: 'green',
  cancelled: 'red',
  rejected: 'orange',
};

export function LabOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: order, isLoading } = useLabOrderQuery(id);
  const updateStatusMutation = useUpdateLabOrderStatusMutation(id ?? '');
  const updatePaymentMutation = useUpdateLabOrderPaymentMutation(id ?? '');
  const createTrialMutation = useCreateLabTrialMutation(id ?? '');
  const addTrialModal = useDisclosure();
  const completeTrialModal = useDisclosure();
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  type CompleteForm = { completedAt: string; outcome: 'approved' | 'adjustments_needed' | 'rejected'; doctorNotes: string; labInstructions: string };
  const [completeForm, setCompleteForm] = useState<CompleteForm>({
    completedAt: new Date().toISOString().slice(0, 10),
    outcome: 'adjustments_needed',
    doctorNotes: '',
    labInstructions: '',
  });

  const handleMarkDelivered = async () => {
    try {
      await updateStatusMutation.mutateAsync({ status: 'delivered' });
      toast({ title: 'Order marked delivered', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Cancel this lab order?')) return;
    try {
      await updateStatusMutation.mutateAsync({ status: 'cancelled' });
      toast({ title: 'Order cancelled', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  const handleMarkPaid = async () => {
    try {
      await updatePaymentMutation.mutateAsync({ isPaid: true, labFee: order?.labFee ? parseFloat(order.labFee) : undefined });
      toast({ title: 'Marked as paid', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  if (isLoading || !order) {
    return <Skeleton height="400px" />;
  }

  const patientName = order.patient
    ? `${order.patient.firstName ?? ''} ${order.patient.lastName ?? ''}`.trim()
    : '—';
  const trials = (order.trials ?? []).sort((a: LabTrial, b: LabTrial) => a.trialNumber - b.trialNumber);
  const sentDays = order.sentToLabAt
    ? Math.floor((Date.now() - new Date(order.sentToLabAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <Box>
      <Button variant="ghost" size="sm" mb={4} onClick={() => navigate('/labs/orders')}>
        ← Back to orders
      </Button>

      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <HStack gap={2} mb={1}>
            <Heading size="lg">{order.orderNumber}</Heading>
            <Badge colorScheme={STATUS_COLORS[order.status] ?? 'gray'}>{order.status?.replace(/_/g, ' ')}</Badge>
            <Badge colorScheme={order.priority === 'urgent' ? 'red' : 'gray'}>{order.priority}</Badge>
          </HStack>
          <Text color="gray.500">{order.customWorkType || order.workType?.replace(/_/g, ' ')} · Tooth(s): {(order.toothNumbers || []).join(', ')}</Text>
        </Box>
        <HStack>
          <Button size="sm" leftIcon={<EditIcon />} variant="outline" onClick={() => navigate(`/labs/orders/${id}/edit`)}>
            Edit Order
          </Button>
          <Button size="sm" leftIcon={<AddIcon />} colorScheme="teal" onClick={addTrialModal.onOpen}>
            Add Trial
          </Button>
          {!['delivered', 'cancelled', 'rejected'].includes(order.status) && (
            <>
              <Button size="sm" colorScheme="green" onClick={handleMarkDelivered}>
                Mark Delivered
              </Button>
              <Button size="sm" colorScheme="red" variant="outline" onClick={handleCancelOrder}>
                Cancel Order
              </Button>
            </>
          )}
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        <Box gridColumn={{ lg: '1 / 3' }}>
          <Card mb={6}>
            <CardHeader>
              <Heading size="sm">Order Info</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={2}>
                <Text><strong>Patient:</strong> <Button variant="link" size="sm" onClick={() => navigate(`/patients/${order.patientId}`)}>{patientName}</Button></Text>
                <Text><strong>Doctor:</strong> {order.doctor?.fullName ?? '—'}</Text>
                <Text><strong>Vendor:</strong> {order.vendor?.name ?? '—'} {order.vendor?.phone && ` · ${order.vendor.phone}`}</Text>
                <Text><strong>Work Type:</strong> {order.customWorkType || order.workType?.replace(/_/g, ' ')}</Text>
                <Text><strong>Tooth Numbers:</strong> {(order.toothNumbers || []).join(', ') || '—'}</Text>
                <Text><strong>Shade:</strong> {order.shade ?? '—'} <strong>Material:</strong> {order.material ?? '—'}</Text>
                {order.instructions && <Text><strong>Instructions:</strong> {order.instructions}</Text>}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="sm">Trial Timeline</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={4}>
                {trials.map((trial: LabTrial) => (
                  <Box key={trial.id} p={4} borderWidth="1px" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Badge>Trial #{trial.trialNumber}</Badge>
                      <Text fontSize="sm">{fmtDate(trial.trialDate)}</Text>
                      <Badge colorScheme={trial.status === 'completed' ? 'green' : 'blue'}>{trial.status}</Badge>
                      {trial.outcome && <Badge>{trial.outcome.replace(/_/g, ' ')}</Badge>}
                    </HStack>
                    {trial.doctorNotes && <Text fontSize="sm">{trial.doctorNotes}</Text>}
                    {trial.labInstructions && <Text fontSize="sm" color="gray.500">Lab: {trial.labInstructions}</Text>}
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {trial.patientNotified ? `Patient notified via ${trial.patientNotificationChannel ?? '—'} ✓` : 'Not notified'}
                    </Text>
                    {trial.status === 'scheduled' && (
                      <Button
                        size="sm"
                        mt={2}
                        colorScheme="teal"
                        onClick={() => {
                          setSelectedTrialId(trial.id);
                          setCompleteForm({
                            completedAt: new Date().toISOString().slice(0, 10),
                            outcome: 'adjustments_needed',
                            doctorNotes: '',
                            labInstructions: '',
                          });
                          completeTrialModal.onOpen();
                        }}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </Box>
                ))}
                <Button size="sm" variant="outline" leftIcon={<AddIcon />} onClick={addTrialModal.onOpen}>
                  Schedule Next Trial
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box>
          <Card mb={4}>
            <CardHeader>
              <Heading size="sm">Status</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={1} fontSize="sm">
                {['draft', 'sent_to_lab', 'trial_scheduled', 'trial_in_progress', 'approved', 'delivered'].map((s) => (
                  <Text key={s} fontWeight={order.status === s ? 'bold' : 'normal'} color={order.status === s ? 'teal.600' : undefined}>
                    {s.replace(/_/g, ' ')} {order.status === s ? '←' : ''}
                  </Text>
                ))}
              </VStack>
            </CardBody>
          </Card>
          <Card mb={4}>
            <CardHeader>
              <Heading size="sm">Dates</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={1} fontSize="sm">
                <Text>Sent to Lab: {order.sentToLabAt ? fmtDate(order.sentToLabAt) : '—'}</Text>
                <Text>Expected Trial: {order.expectedTrialDate ? fmtDate(order.expectedTrialDate) : 'Not set'}</Text>
                <Text>Final Delivery: {order.finalDeliveryDate ? fmtDate(order.finalDeliveryDate) : 'TBD'}</Text>
                {sentDays != null && <Text color={sentDays > 30 ? 'red.500' : undefined}>Days since sent: {sentDays}</Text>}
              </VStack>
            </CardBody>
          </Card>
          <Card mb={4}>
            <CardHeader>
              <Heading size="sm">Payment</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={1}>
                <Text>Lab Fee: {order.labFee ? `PKR ${order.labFee}` : 'Not set'}</Text>
                <Text>{order.isPaid ? '✓ Paid' : '⚠ Unpaid'}</Text>
                {!order.isPaid && (
                  <Button size="sm" colorScheme="teal" onClick={handleMarkPaid}>
                    Mark as Paid
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
          {(order.notifications?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <Heading size="sm">Notifications Log</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <List spacing={2} fontSize="sm">
                  {order.notifications?.slice(0, 10).map((n: LabNotification) => (
                    <ListItem key={n.id}>
                      <ListIcon as="span" />
                      {n.channel} · {n.type} · {fmtDate(n.createdAt)} · <Badge size="sm" colorScheme={n.status === 'sent' ? 'green' : 'red'}>{n.status}</Badge>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          )}
        </Box>
      </SimpleGrid>

      <AddTrialModal
        isOpen={addTrialModal.isOpen}
        onClose={addTrialModal.onClose}
        orderId={id ?? ''}
        createMutation={createTrialMutation}
        toast={toast}
        onSuccess={() => { addTrialModal.onClose(); }}
      />

      {selectedTrialId && (
        <CompleteTrialModal
          isOpen={completeTrialModal.isOpen}
          onClose={() => { completeTrialModal.onClose(); setSelectedTrialId(null); }}
          orderId={id ?? ''}
          trialId={selectedTrialId}
          form={completeForm}
          setForm={setCompleteForm}
          toast={toast}
          onSuccess={() => {
            completeTrialModal.onClose();
            setSelectedTrialId(null);
          }}
        />
      )}
    </Box>
  );
}

function AddTrialModal({
  isOpen,
  onClose,
  orderId: _orderId,
  createMutation,
  toast,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  createMutation: ReturnType<typeof useCreateLabTrialMutation>;
  toast: ReturnType<typeof useToast>;
  onSuccess: () => void;
}) {
  const [trialDate, setTrialDate] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [labInstructions, setLabInstructions] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('both');

  const handleSubmit = async () => {
    if (!trialDate) {
      toast({ title: 'Enter trial date', status: 'warning' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        trialDate,
        doctorNotes: doctorNotes || undefined,
        labInstructions: labInstructions || undefined,
        notifyPatient,
        channel,
      });
      toast({ title: 'Trial scheduled', status: 'success', duration: 2000 });
      onSuccess();
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Schedule Trial</ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Trial Date *</FormLabel>
              <Input type="date" value={trialDate} onChange={(e) => setTrialDate(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Doctor Notes</FormLabel>
              <Textarea value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} rows={2} />
            </FormControl>
            <FormControl>
              <FormLabel>Lab Instructions</FormLabel>
              <Textarea value={labInstructions} onChange={(e) => setLabInstructions(e.target.value)} rows={2} />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Notify Patient</FormLabel>
              <Switch isChecked={notifyPatient} onChange={(e) => setNotifyPatient(e.target.checked)} />
            </FormControl>
            {notifyPatient && (
              <FormControl>
                <FormLabel>Channel</FormLabel>
                <Select value={channel} onChange={(e) => setChannel(e.target.value as any)}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="both">Both</option>
                </Select>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={createMutation.isPending}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function CompleteTrialModal({
  isOpen,
  onClose,
  orderId,
  trialId,
  form,
  setForm,
  toast,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  trialId: string;
  form: { completedAt: string; outcome: 'approved' | 'adjustments_needed' | 'rejected'; doctorNotes: string; labInstructions: string };
  setForm: React.Dispatch<React.SetStateAction<{ completedAt: string; outcome: 'approved' | 'adjustments_needed' | 'rejected'; doctorNotes: string; labInstructions: string }>>;
  toast: ReturnType<typeof useToast>;
  onSuccess: () => void;
}) {
  const completeMutation = useCompleteLabTrialMutation(orderId, trialId);

  const handleSubmit = async () => {
    if (!form.doctorNotes.trim()) {
      toast({ title: 'Doctor notes required', status: 'warning' });
      return;
    }
    try {
      await completeMutation.mutateAsync({
        completedAt: form.completedAt,
        outcome: form.outcome as any,
        doctorNotes: form.doctorNotes,
        labInstructions: form.labInstructions || null,
      });
      toast({ title: 'Trial completed', status: 'success', duration: 2000 });
      onSuccess();
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Trial</ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Completion Date *</FormLabel>
              <Input
                type="date"
                value={form.completedAt}
                onChange={(e) => setForm({ ...form, completedAt: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Outcome *</FormLabel>
              <Select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value as 'approved' | 'adjustments_needed' | 'rejected' })}
              >
                <option value="approved">Approved</option>
                <option value="adjustments_needed">Adjustments Needed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Doctor Notes *</FormLabel>
              <Textarea
                value={form.doctorNotes}
                onChange={(e) => setForm({ ...form, doctorNotes: e.target.value })}
                rows={3}
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Lab Instructions</FormLabel>
              <Textarea
                value={form.labInstructions}
                onChange={(e) => setForm({ ...form, labInstructions: e.target.value })}
                rows={2}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={completeMutation.isPending}>
            Complete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
