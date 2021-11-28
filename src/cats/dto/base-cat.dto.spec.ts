import { BaseCatDto } from './base-cat.dto';
import { itBehavesLikeABaseCatDto } from './base-cat.dto.shared-specs';

describe('BaseCatDto', () => {
  class BaseCatDtoSubclass extends BaseCatDto {}

  let dto: BaseCatDtoSubclass;

  beforeEach(() => {
    dto = new BaseCatDtoSubclass();
  });

  describe('a new instance', () => {
    it('can be created successfully', () => {
      expect(dto).toBeInstanceOf(BaseCatDtoSubclass);
    });
  });

  itBehavesLikeABaseCatDto(BaseCatDtoSubclass);
});
