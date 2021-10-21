import { User } from '../../src/users/entities/user.entity';

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

export const generateSampleUsers = () => {
  return sourceUserData.map((userData) => {
    const { password, passwordVerification, ...otherUserFields } = userData;
    const user = new User(otherUserFields);
    user.setPassword(password, passwordVerification);
    return user;
  });
};

export const userToPojoWithoutPassword = (user: User) => {
  const pojoUser = { ...user };
  delete pojoUser.encryptedPassword;
  return pojoUser;
};
