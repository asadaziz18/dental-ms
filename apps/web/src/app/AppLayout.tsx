import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  VStack,
  useColorModeValue,
  IconButton,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import { pathnameToScreenKey, canAccessScreen } from '@/core/permissions';
import type { ScreenKey } from '@dental-ms/shared-types';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { BranchSwitcher } from './components/BranchSwitcher';
import { UserMenu } from './components/UserMenu';

const navItems: { to: string; label: string; screenKey: ScreenKey }[] = [
  { to: '/dashboard', label: 'Dashboard', screenKey: 'dashboard' },
  { to: '/patients', label: 'Patients', screenKey: 'patients' },
  { to: '/appointments', label: 'Appointments', screenKey: 'appointments' },
  { to: '/treatments', label: 'Treatments', screenKey: 'treatments' },
  { to: '/labs', label: 'Lab Management', screenKey: 'labs' },
  { to: '/billing', label: 'Billing', screenKey: 'billing' },
  { to: '/inventory', label: 'Inventory', screenKey: 'inventory' },
  { to: '/staff', label: 'Staff', screenKey: 'staff' },
  { to: '/imaging', label: 'Imaging', screenKey: 'imaging' },
  { to: '/reports', label: 'Reports', screenKey: 'reports' },
  { to: '/settings', label: 'Settings', screenKey: 'settings' },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navHoverBg = useColorModeValue('gray.100', 'gray.700');
  const navActiveBg = useColorModeValue('teal.50', 'whiteAlpha.200');
  const navActiveColor = useColorModeValue('teal.700', 'teal.200');

  const visibleNavItems = useMemo(() => {
    const perms = user?.screenPermissions;
    return navItems.filter((item) => canAccessScreen(perms, item.screenKey));
  }, [user?.screenPermissions]);

  const currentScreenKey = pathnameToScreenKey(location.pathname);
  const canAccessCurrentScreen = canAccessScreen(user?.screenPermissions, currentScreenKey);
  const fallbackPath = visibleNavItems[0]?.to ?? '/dashboard';

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        w={sidebarCollapsed ? 12 : 56}
        borderRightWidth="1px"
        borderColor={borderColor}
        bg={sidebarBg}
        py={4}
        px={sidebarCollapsed ? 2 : 3}
        transition="width 0.2s"
        flexShrink={0}
      >
        <Flex align="center" justify="space-between" mb={4} px={sidebarCollapsed ? 0 : 2}>
          {!sidebarCollapsed && (
            <Heading size="md" color="teal.600" _dark={{ color: 'teal.400' }}>
              Dental MS
            </Heading>
          )}
          <Tooltip label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              size="sm"
              variant="ghost"
              icon={sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              onClick={() => setSidebarCollapsed((c) => !c)}
            />
          </Tooltip>
        </Flex>
        <VStack align="stretch" gap={1}>
          {visibleNavItems.map(({ to, label }) => {
            const isActive =
              location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Box
                key={to}
                as="button"
                type="button"
                textAlign="left"
                w="full"
                px={sidebarCollapsed ? 2 : 3}
                py={2}
                borderRadius="md"
                fontWeight={isActive ? '600' : 'normal'}
                bg={isActive ? navActiveBg : 'transparent'}
                color={isActive ? navActiveColor : undefined}
                _hover={{ bg: isActive ? navActiveBg : navHoverBg }}
                onClick={() => navigate(to)}
                title={sidebarCollapsed ? label : undefined}
              >
                {sidebarCollapsed ? (
                  <Box as="span" fontSize="lg" aria-label={label}>
                    {label.charAt(0)}
                  </Box>
                ) : (
                  label
                )}
              </Box>
            );
          })}
        </VStack>
      </Box>

      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Flex
          align="center"
          justify="space-between"
          px={4}
          py={3}
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={sidebarBg}
          flexShrink={0}
        >
          <HStack spacing={4}>
            <BranchSwitcher />
            <SyncStatusBanner />
          </HStack>
          <UserMenu />
        </Flex>

        <Box flex={1} overflow="auto" p={6} maxW="7xl" mx="auto" w="full">
          {!canAccessCurrentScreen ? (
            <Navigate to={fallbackPath} replace />
          ) : (
            <Outlet />
          )}
        </Box>
      </Box>
    </Flex>
  );
}
