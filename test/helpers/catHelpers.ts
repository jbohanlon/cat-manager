import { Cat } from '../../src/cats/entities/cat.entity';
import { User } from '../../src/users/entities/user.entity';

export const sampleCatOptions = [
  {
    name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
  },
  {
    name: 'Falafel', weight: 10, breed: 'British Shorthair', isFriendly: true,
  },
  {
    name: 'Garfield', weight: 30, breed: 'Tabby', isFriendly: false,
  },
];

export const buildSampleCats = (user: User = null) => {
  return sampleCatOptions.map((catData) => {
    const cat = new Cat(catData);
    if (user) { cat.user = user; }
    return cat;
  });
};

export const buildSampleCat = (user: User = null) => {
  const cat = new Cat(sampleCatOptions[0]);
  if (user) { cat.user = user; }
  return cat;
};

export const catToPojoWithoutUser = (cat: Cat) => {
  const pojoCat = { ...cat };
  delete pojoCat.user;
  return pojoCat;
};
