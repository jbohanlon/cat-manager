import { User } from '../../src/users/entities/user.entity';

interface SampleUserOptions {
  email: string,
  password: string,
  passwordVerification: string,
  isAdmin: boolean,
}

const sourceUserData = [
  {
    email: 'user1@example.com', password: 'greatpassword1', passwordVerification: 'greatpassword1', isAdmin: false,
  },
  {
    email: 'user2@example.com', password: 'greatpassword2', passwordVerification: 'greatpassword2', isAdmin: false,
  },
  {
    email: 'admin1@example.com', password: 'greatpassword3', passwordVerification: 'greatpassword3', isAdmin: true,
  },
];

export const buildUser = (userData: SampleUserOptions) => {
  const { password, passwordVerification, ...otherUserFields } = userData;
  const user = new User(otherUserFields);
  user.setPassword(password, passwordVerification);
  return user;
};

export const buildSampleUsers = () => {
  return sourceUserData.map(buildUser);
};

export const buildSampleUser = () => {
  return buildUser(sourceUserData[0]);
};

export const userToPojoWithoutPassword = (user: User) => {
  const pojoUser = { ...user };
  delete pojoUser.encryptedPassword;
  return pojoUser;
};
