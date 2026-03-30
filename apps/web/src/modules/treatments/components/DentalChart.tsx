import { Box, HStack, Wrap, WrapItem, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import type { ToothCondition } from '@dental-ms/shared-types';
import {
  FDI_UPPER_RIGHT,
  FDI_UPPER_LEFT,
  FDI_LOWER_LEFT,
  FDI_LOWER_RIGHT,
  getConditionColor,
  TOOTH_CONDITIONS,
} from '../constants';

const TOOTH_WIDTH = 34;
const TOOTH_HEIGHT = 28;
const GAP = 6;
const TOOTH_RX = 6;

export interface ToothState {
  toothNumber: number;
  conditionTag: ToothCondition | null;
}

interface DentalChartProps {
  toothStates?: Map<number, ToothState> | Record<number, ToothState>;
  selectedTooth?: number | null;
  onToothClick?: (toothNumber: number) => void;
  readOnly?: boolean;
  /** Show condition legend below chart */
  showLegend?: boolean;
}

function getState(
  toothStates: Map<number, ToothState> | Record<number, ToothState> | undefined,
  toothNumber: number,
): ToothCondition | null {
  if (!toothStates) return null;
  const state =
    toothStates instanceof Map
      ? toothStates.get(toothNumber)
      : (toothStates as Record<number, ToothState>)[toothNumber];
  return state?.conditionTag ?? null;
}

function ToothRect({
  toothNumber,
  x,
  y,
  fill,
  selected,
  hovered,
  onClick,
  readOnly,
  onHoverChange,
}: {
  toothNumber: number;
  x: number;
  y: number;
  fill: string;
  selected: boolean;
  hovered: boolean;
  onClick?: () => void;
  readOnly?: boolean;
  onHoverChange?: (hover: boolean) => void;
}) {
  const borderColor = useColorModeValue('#718096', '#A0AEC0');
  const selectedRing = useColorModeValue('#0D9488', '#2DD4BF');
  const textColor = useColorModeValue('#1A202C', '#E2E8F0');
  const isInteractive = !readOnly && !!onClick;

  // Slight brighten on hover/selected for depth
  const isHighlight = selected || hovered;
  const strokeWidth = selected ? 2.5 : hovered ? 1.5 : 1;
  const stroke = selected ? selectedRing : hovered ? selectedRing : borderColor;

  return (
    <g
      onClick={isInteractive ? onClick : undefined}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        filter: selected ? 'drop-shadow(0 0 4px rgba(13, 148, 136, 0.4))' : undefined,
      }}
    >
      <rect
        x={x}
        y={y}
        width={TOOTH_WIDTH}
        height={TOOTH_HEIGHT}
        rx={TOOTH_RX}
        ry={TOOTH_RX}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={hovered && !selected ? 0.92 : 1}
        transition="fill 0.15s, stroke 0.15s, opacity 0.15s"
      />
      {/* Subtle top-edge shine (only on light fills) */}
      <rect
        x={x + 2}
        y={y + 2}
        width={TOOTH_WIDTH - 4}
        height={Math.min(8, TOOTH_HEIGHT / 3)}
        rx={3}
        fill="rgba(255,255,255,0.25)"
        pointerEvents="none"
      />
      <text
        x={x + TOOTH_WIDTH / 2}
        y={y + TOOTH_HEIGHT / 2 + 5}
        textAnchor="middle"
        fontSize="12"
        fill={textColor}
        fontWeight={selected ? 700 : 600}
        pointerEvents="none"
      >
        {toothNumber}
      </text>
    </g>
  );
}

function Row({
  teeth,
  startX,
  y,
  toothStates,
  selectedTooth,
  hoveredTooth,
  onToothClick,
  onHoverChange,
  readOnly,
}: {
  teeth: readonly number[];
  startX: number;
  y: number;
  toothStates?: Map<number, ToothState> | Record<number, ToothState>;
  selectedTooth?: number | null;
  hoveredTooth?: number | null;
  onToothClick?: (n: number) => void;
  onHoverChange?: (n: number | null) => void;
  readOnly?: boolean;
}) {
  return (
    <>
      {teeth.map((num, i) => {
        const x = startX + i * (TOOTH_WIDTH + GAP);
        const fill = getConditionColor(getState(toothStates, num));
        return (
          <ToothRect
            key={num}
            toothNumber={num}
            x={x}
            y={y}
            fill={fill}
            selected={selectedTooth === num}
            hovered={hoveredTooth === num}
            onClick={onToothClick ? () => onToothClick(num) : undefined}
            onHoverChange={onHoverChange ? (h) => onHoverChange(h ? num : null) : undefined}
            readOnly={readOnly}
          />
        );
      })}
    </>
  );
}

const ROW_WIDTH = 8 * TOOTH_WIDTH + 7 * GAP;
const ROW_HEIGHT = TOOTH_HEIGHT + GAP;
const LABEL_OFFSET = 28;
const CHART_PADDING = 20;

export function DentalChart({
  toothStates,
  selectedTooth = null,
  onToothClick,
  readOnly = false,
  showLegend = true,
}: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const dividerColor = useColorModeValue('gray.200', 'whiteAlpha.300');

  const w = ROW_WIDTH * 2 + 24 + CHART_PADDING * 2;
  const h = ROW_HEIGHT * 2 + LABEL_OFFSET * 2 + 20;

  return (
    <Box width="100%" maxW="640px" mx="auto">
      <Box
        as="svg"
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        sx={{ userSelect: 'none', display: 'block' }}
      >
        {/* Quadrant labels */}
        <text
          x={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH / 2 - 24}
          y={16}
          fontSize="11"
          fontWeight="600"
          fill={labelColor}
        >
          Upper right
        </text>
        <text
          x={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH + 14 + ROW_WIDTH / 2 - 24}
          y={16}
          fontSize="11"
          fontWeight="600"
          fill={labelColor}
        >
          Upper left
        </text>

        <Row
          teeth={FDI_UPPER_RIGHT}
          startX={CHART_PADDING + LABEL_OFFSET}
          y={LABEL_OFFSET}
          toothStates={toothStates}
          selectedTooth={selectedTooth}
          hoveredTooth={hoveredTooth}
          onToothClick={onToothClick}
          onHoverChange={setHoveredTooth}
          readOnly={readOnly}
        />
        <Row
          teeth={FDI_UPPER_LEFT}
          startX={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH + 14}
          y={LABEL_OFFSET}
          toothStates={toothStates}
          selectedTooth={selectedTooth}
          hoveredTooth={hoveredTooth}
          onToothClick={onToothClick}
          onHoverChange={setHoveredTooth}
          readOnly={readOnly}
        />

        {/* Divider between upper and lower */}
        <line
          x1={CHART_PADDING + LABEL_OFFSET}
          y1={LABEL_OFFSET + ROW_HEIGHT + 4}
          x2={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH * 2 + 14}
          y2={LABEL_OFFSET + ROW_HEIGHT + 4}
          stroke={dividerColor}
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        <text
          x={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH / 2 - 26}
          y={LABEL_OFFSET + ROW_HEIGHT + 20}
          fontSize="11"
          fontWeight="600"
          fill={labelColor}
        >
          Lower left
        </text>
        <text
          x={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH + 14 + ROW_WIDTH / 2 - 26}
          y={LABEL_OFFSET + ROW_HEIGHT + 20}
          fontSize="11"
          fontWeight="600"
          fill={labelColor}
        >
          Lower right
        </text>

        <Row
          teeth={FDI_LOWER_LEFT}
          startX={CHART_PADDING + LABEL_OFFSET}
          y={LABEL_OFFSET + ROW_HEIGHT + 8}
          toothStates={toothStates}
          selectedTooth={selectedTooth}
          hoveredTooth={hoveredTooth}
          onToothClick={onToothClick}
          onHoverChange={setHoveredTooth}
          readOnly={readOnly}
        />
        <Row
          teeth={FDI_LOWER_RIGHT}
          startX={CHART_PADDING + LABEL_OFFSET + ROW_WIDTH + 14}
          y={LABEL_OFFSET + ROW_HEIGHT + 8}
          toothStates={toothStates}
          selectedTooth={selectedTooth}
          hoveredTooth={hoveredTooth}
          onToothClick={onToothClick}
          onHoverChange={setHoveredTooth}
          readOnly={readOnly}
        />
      </Box>

      {showLegend && (
        <Wrap spacing={2} mt={4} justify="center">
          {TOOTH_CONDITIONS.map(({ value, label, color }) => (
            <WrapItem key={value}>
              <HStack spacing={1.5} role="listitem">
                <Box
                  w="14px"
                  h="14px"
                  borderRadius="md"
                  bg={color}
                  borderWidth="1px"
                  borderColor="gray.300"
                  flexShrink={0}
                />
                <Box as="span" fontSize="xs" color={labelColor}>
                  {label}
                </Box>
              </HStack>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
}
