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
  HStack,
} from '@chakra-ui/react';
import type { Procedure } from '@dental-ms/shared-types';

export interface AddLineItemFormValues {
  procedureId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

interface AddLineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedures: Procedure[];
  defaultDescription?: string;
  defaultUnitPrice?: number;
  onSubmit: (values: AddLineItemFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddLineItemModal({
  isOpen,
  onClose,
  procedures,
  defaultDescription = '',
  defaultUnitPrice = 0,
  onSubmit,
  isSubmitting = false,
}: AddLineItemModalProps) {
  const [procedureId, setProcedureId] = useState(procedures[0]?.id ?? '');
  const [description, setDescription] = useState(defaultDescription);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(defaultUnitPrice);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProcedureId(procedures[0]?.id ?? '');
      setDescription(defaultDescription);
      setQuantity(1);
      setUnitPrice(defaultUnitPrice);
      setDiscountAmount(0);
    }
  }, [isOpen, defaultDescription, defaultUnitPrice, procedures]);

  useEffect(() => {
    const p = procedures.find((x) => x.id === procedureId);
    if (p) {
      setDescription(p.name);
      if (unitPrice === 0 || unitPrice === defaultUnitPrice) {
        setUnitPrice(parseFloat(p.defaultFee) || 0);
      }
    }
  }, [procedureId, procedures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      procedureId: procedureId || undefined,
      description,
      quantity,
      unitPrice,
      discountAmount,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add line item</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel size="sm">Procedure (optional)</FormLabel>
              <Select
                size="sm"
                value={procedureId}
                onChange={(e) => setProcedureId(e.target.value)}
              >
                <option value="">— Custom —</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel size="sm">Description</FormLabel>
              <Input
                size="sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item description"
              />
            </FormControl>
            <HStack spacing={3}>
              <FormControl>
                <FormLabel size="sm">Quantity</FormLabel>
                <NumberInput size="sm" min={0.01} value={quantity} onChange={(_, n) => setQuantity(n)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel size="sm">Unit price</FormLabel>
                <NumberInput size="sm" min={0} value={unitPrice} onChange={(_, n) => setUnitPrice(n)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel size="sm">Discount</FormLabel>
                <NumberInput size="sm" min={0} value={discountAmount} onChange={(_, n) => setDiscountAmount(n)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Add
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
