import { Select, Box } from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import { useBranchId, useSetBranchId } from '@/core/branch';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchTree } from '@/modules/branches/hooks/use-branches';
import type { BranchTreeItem } from '@/modules/branches/api';

function flattenForSwitcher(items: BranchTreeItem[]): { id: string; name: string; isSub?: boolean }[] {
  const out: { id: string; name: string; isSub?: boolean }[] = [];
  for (const b of items) {
    out.push({ id: b.id, name: b.name, isSub: false });
    if (b.subBranches?.length) {
      for (const s of b.subBranches) {
        out.push({ id: s.id, name: `  ${s.name}`, isSub: true });
      }
    }
  }
  return out;
}

export function BranchSwitcher() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const selectedBranchId = useBranchId();
  const setSelectedBranchId = useSetBranchId();
  const { data: tree = [] } = useBranchTree();
  const flat = flattenForSwitcher(tree);

  if (!user || flat.length <= 1) {
    const current = flat.find((b) => b.id === selectedBranchId);
    return (
      <Box fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
        {current?.name ?? (flat.length === 1 ? flat[0]?.name : null) ?? 'Branch'}
      </Box>
    );
  }

  return (
    <Select
      size="sm"
      maxW="56"
      value={selectedBranchId ?? ''}
      onChange={(e) => {
        const id = e.target.value || null;
        setSelectedBranchId(id);
        queryClient.invalidateQueries();
      }}
    >
      {tree.map((main) => (
        <optgroup key={main.id} label={main.name}>
          <option value={main.id}>{main.name}</option>
          {main.subBranches?.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {'\u00A0\u00A0'} {sub.name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
