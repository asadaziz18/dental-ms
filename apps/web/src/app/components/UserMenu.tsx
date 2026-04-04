import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  useColorMode,
  Box,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import { ChevronDownIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="ghost"
        size="sm"
      >
        <Box textAlign="left">
          <Text fontSize="sm" fontWeight="600" lineHeight="tight">
            {user?.fullName ?? 'User'}
          </Text>
          <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
            {user?.role}
          </Text>
        </Box>
      </MenuButton>
      <MenuList>
        {user?.role === 'SuperAdmin' && (
          <>
            <MenuItem as={RouterLink} to="/superadmin">
              Super Admin portal
            </MenuItem>
            <MenuDivider />
          </>
        )}
        <MenuItem as={RouterLink} to="/help/user-manual">
          User manual (PDF)
        </MenuItem>
        <MenuItem
          onClick={toggleColorMode}
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        >
          {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => logout()}>Sign out</MenuItem>
      </MenuList>
    </Menu>
  );
}
