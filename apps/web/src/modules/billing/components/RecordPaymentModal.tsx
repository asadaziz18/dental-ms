import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import type { PaymentMethod } from '@dental-ms/shared-types';

const METHODS: PaymentMethod[] = ['Cash', 'Card', 'Insurance', 'Partial', 'Other'];

export interface RecordPaymentFormValues {
  amount: number;
  method: PaymentMethod;
  reference: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceTotal: number;
  alreadyPaid: number;
  onSubmit: (values: RecordPaymentFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoiceTotal,
  alreadyPaid,
  onSubmit,
  isSubmitting = false,
}: RecordPaymentModalProps) {
  const outstanding = Math.max(0, invoiceTotal - alreadyPaid);
  const [amount, setAmount] = useState(outstanding);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(outstanding);
      setReference('');
    }
  }, [isOpen, outstanding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ amount, method, reference: reference.trim() || undefined });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Record payment</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel size="sm">Amount</FormLabel>
              <NumberInput size="sm" min={0.01} value={amount} onChange={(_, n) => setAmount(n)}>
                <NumberInputField />
              </NumberInput>
              <Button
                size="xs"
                variant="link"
                mt={1}
                onClick={() => setAmount(outstanding)}
              >
                Use outstanding ({outstanding.toFixed(2)})
              </Button>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel size="sm">Method</FormLabel>
              <Select size="sm" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel size="sm">Reference (optional)</FormLabel>
              <Input
                size="sm"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Check no., last 4 digits, etc."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Record
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
