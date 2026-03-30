import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
} from '@chakra-ui/react';
import { useAuth } from '@/core/auth';

/** Seeded dev users (match apps/api/src/database/seeds/seed.ts) — shown only in development */
const DEV_USERS = [
  { email: 'superadmin@dentalms.com', password: 'Admin@1234', role: 'SuperAdmin' },
  { email: 'branchadmin@citysmile.com', password: 'Admin@1234', role: 'BranchAdmin' },
  { email: 'dr.ahmed@citysmile.com', password: 'Doctor@1234', role: 'Doctor' },
  { email: 'dr.sara@citysmile.com', password: 'Doctor@1234', role: 'Doctor' },
  { email: 'receptionist@citysmile.com', password: 'Staff@1234', role: 'Receptionist' },
  { email: 'nurse@citysmile.com', password: 'Staff@1234', role: 'Nurse' },
];
const isDev = import.meta.env.DEV;

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  if (user) {
    navigate(from, { replace: true });
    return null;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const doLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast({ title: 'Signed in successfully', status: 'success', isClosable: true });
      navigate(from, { replace: true });
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Invalid email or password';
      toast({
        title: Array.isArray(message) ? message[0] : message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  const onSubmit = (values: LoginFormValues) => doLogin(values.email, values.password);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      px={4}
    >
      <Box
        w="full"
        maxW="md"
        p={8}
        bg="white"
        _dark={{ bg: 'gray.800' }}
        borderRadius="xl"
        shadow="lg"
      >
        <Heading size="lg" color="teal.600" _dark={{ color: 'teal.400' }} mb={6} textAlign="center">
          Dental MS
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} align="stretch">
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="you@clinic.com"
                autoComplete="email"
                {...register('email')}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign in
            </Button>
          </VStack>
        </form>

        {isDev && (
          <Box mt={8} pt={6} borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: 'whiteAlpha.300' }}>
            <Text fontSize="sm" fontWeight="600" color="gray.500" _dark={{ color: 'gray.400' }} mb={3}>
              Development logins (seed data)
            </Text>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Role</Th>
                    <Th>Email</Th>
                    <Th>Password</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {DEV_USERS.map((cred) => (
                    <Tr key={cred.email}>
                      <Td fontSize="xs">{cred.role}</Td>
                      <Td><Code fontSize="xs">{cred.email}</Code></Td>
                      <Td><Code fontSize="xs">{cred.password}</Code></Td>
                      <Td>
                        <Button
                          size="xs"
                          colorScheme="teal"
                          variant="outline"
                          isLoading={isLoading}
                          onClick={() => doLogin(cred.email, cred.password)}
                        >
                          Use
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
