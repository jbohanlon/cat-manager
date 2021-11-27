import { itBehavesLikeABaseCatDto } from './base-cat.dto.shared-specs';
import { CreateCatDto } from './create-cat.dto';

describe('CreateCatDto', () => {
  let dto: CreateCatDto;

  beforeEach(() => {
    dto = new CreateCatDto();
  });

  describe('a new instance', () => {
    it('can be created successfully', () => {
      expect(dto).toBeInstanceOf(CreateCatDto);
    });
  });

  itBehavesLikeABaseCatDto(CreateCatDto);
});
