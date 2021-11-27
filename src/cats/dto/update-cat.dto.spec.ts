import { itBehavesLikeABaseCatDto } from './base-cat.dto.shared-specs';
import { UpdateCatDto } from './update-cat.dto';

describe('UpdateCatDto', () => {
  let dto: UpdateCatDto;

  beforeEach(() => {
    dto = new UpdateCatDto();
  });

  describe('a new instance', () => {
    it('can be created successfully', () => {
      expect(dto).toBeInstanceOf(UpdateCatDto);
    });
  });

  itBehavesLikeABaseCatDto(UpdateCatDto);
});
