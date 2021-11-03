import { User } from '../../src/users/entities/user.entity';
import { UsersService } from '../../src/users/providers/users.service';

export const testUserEmail = 'user@example.com';
export const testUserPassword = 'userpassword';

export const testAdminEmail = 'admin@example.com';
export const testAdminPassword = 'adminpassword';

export const createTestUser = async (usersService: UsersService) => {
  const user = new User({ email: testUserEmail, isAdmin: false });
  user.setPassword(testUserPassword, testUserPassword);
  return usersService.create(user);
};

export const createTestAdmin = async (usersService: UsersService) => {
  const user = new User({ email: testAdminEmail, isAdmin: true });
  user.setPassword(testAdminPassword, testAdminPassword);
  return usersService.create(user);
};
