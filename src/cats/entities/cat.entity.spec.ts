import { Cat } from './cat.entity';

describe('Cat', () => {
  describe('#toPojo', () => {
    it('returns an object that only contains non-undefined properties from the source Cat', () => {
      const cat = new Cat();
      cat.name = 'Jojo the Pojo';

      expect(cat.toPojo()).toEqual({ name: 'Jojo the Pojo' });
    });
  });
});
