import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Heading, VStack, useColorModeValue, Link } from '@chakra-ui/react';
import { UserMenu } from '@/app/components/UserMenu';

const navItems = [
  { to: '/superadmin', label: 'Tenants' },
  { to: '/superadmin/plans', label: 'Plans' },
  { to: '/superadmin/invoices', label: 'Invoices' },
];

export function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navActiveBg = useColorModeValue('teal.50', 'whiteAlpha.200');

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        w="56"
        borderRightWidth="1px"
        borderColor={borderColor}
        bg={useColorModeValue('white', 'gray.800')}
        py={4}
        px={3}
        flexShrink={0}
      >
        <Heading size="md" color="teal.600" _dark={{ color: 'teal.400' }} mb={4} px={2}>
          Super Admin
        </Heading>
        <VStack align="stretch" gap={1}>
          {navItems.map(({ to, label }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Box
                key={to}
                as="button"
                type="button"
                textAlign="left"
                w="full"
                px={3}
                py={2}
                borderRadius="md"
                fontWeight={isActive ? '600' : 'normal'}
                bg={isActive ? navActiveBg : 'transparent'}
                _hover={{ bg: isActive ? navActiveBg : useColorModeValue('gray.100', 'gray.700') }}
                onClick={() => navigate(to)}
              >
                {label}
              </Box>
            );
          })}
          <Link
            mt={4}
            px={3}
            py={2}
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            color="gray.600"
            _dark={{ color: 'gray.400' }}
          >
            ← Back to app
          </Link>
        </VStack>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        <Flex
          align="center"
          justify="flex-end"
          px={4}
          py={3}
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={useColorModeValue('white', 'gray.800')}
          flexShrink={0}
        >
          <UserMenu />
        </Flex>
        <Box flex={1} overflow="auto" p={6} maxW="6xl" mx="auto" w="full">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
