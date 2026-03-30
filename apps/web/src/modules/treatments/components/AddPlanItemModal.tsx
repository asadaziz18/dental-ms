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
  NumberInput,
  NumberInputField,
  HStack,
} from '@chakra-ui/react';
import type { Procedure } from '@dental-ms/shared-types';
import { TOOTH_CONDITIONS, ALL_FDI } from '../constants';

export interface AddPlanItemFormValues {
  toothNumber: number;
  procedureId: string;
  conditionTag: string | null;
  estimatedCost: number | null;
  priority: number;
}

interface AddPlanItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedures: Procedure[];
  defaultTooth?: number | null;
  onSubmit: (values: AddPlanItemFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddPlanItemModal({
  isOpen,
  onClose,
  procedures,
  defaultTooth = null,
  onSubmit,
  isSubmitting = false,
}: AddPlanItemModalProps) {
  const [toothNumber, setToothNumber] = useState(defaultTooth ?? 11);
  const [procedureId, setProcedureId] = useState(procedures[0]?.id ?? '');
  const [conditionTag, setConditionTag] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string>('');
  const [priority, setPriority] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setToothNumber(defaultTooth ?? 11);
      setProcedureId(procedures[0]?.id ?? '');
      setConditionTag(null);
      setEstimatedCost('');
      setPriority(0);
    }
  }, [isOpen, defaultTooth, procedures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      toothNumber,
      procedureId,
      conditionTag: conditionTag || null,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      priority,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add treatment item</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <HStack spacing={4} flexWrap="wrap">
              <FormControl isRequired>
                <FormLabel size="sm">Tooth (FDI)</FormLabel>
                <Select
                  size="sm"
                  value={toothNumber}
                  onChange={(e) => setToothNumber(parseInt(e.target.value, 10))}
                >
                  {ALL_FDI.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel size="sm">Procedure</FormLabel>
                <Select
                  size="sm"
                  value={procedureId}
                  onChange={(e) => setProcedureId(e.target.value)}
                >
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
            <HStack spacing={4} mt={4}>
              <FormControl>
                <FormLabel size="sm">Condition</FormLabel>
                <Select
                  size="sm"
                  value={conditionTag ?? ''}
                  onChange={(e) => setConditionTag(e.target.value || null)}
                >
                  <option value="">—</option>
                  {TOOTH_CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel size="sm">Est. cost</FormLabel>
                <NumberInput size="sm" value={estimatedCost} onChange={(s) => setEstimatedCost(s)}>
                  <NumberInputField placeholder="0" />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel size="sm">Priority</FormLabel>
                <NumberInput size="sm" min={0} value={priority} onChange={(_, n) => setPriority(n)}>
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
