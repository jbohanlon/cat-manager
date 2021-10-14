import { Repository } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';

export const testUserEmail = 'user@example.com';
export const testUserPassword = 'userpassword';

export const testAdminEmail = 'admin@example.com';
export const testAdminPassword = 'adminpassword';

export const createTestUser = async (userRespository: Repository<User>) => {
  const user = new User({ email: testUserEmail, isAdmin: false });
  user.setPassword(testUserPassword, testUserPassword);
  return userRespository.save(user);
};

export const createTestAdmin = async (userRespository: Repository<User>) => {
  const user = new User({ email: testAdminEmail, isAdmin: true });
  user.setPassword(testAdminPassword, testAdminPassword);
  return userRespository.save(user);
};
