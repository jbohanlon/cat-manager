import { BaseUserDto } from './base-user.dto';
import { itBehavesLikeABaseUserDto } from './base-user.dto.shared-specs';

describe('BaseUserDto', () => {
  class BaseUserDtoSubclass extends BaseUserDto {}

  let dto: BaseUserDtoSubclass;

  beforeEach(() => {
    dto = new BaseUserDtoSubclass();
  });

  describe('a new instance', () => {
    it('can be created successfully', () => {
      expect(dto).toBeInstanceOf(BaseUserDtoSubclass);
    });
  });

  itBehavesLikeABaseUserDto(BaseUserDtoSubclass);
});
