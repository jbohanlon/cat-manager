/* eslint-disable max-classes-per-file */

export class CatManagerError extends Error {
  constructor(...args: any) {
    super(...args);
    this.name = this.constructor.name;
  }
}

export class EntityCreationError extends CatManagerError {}
export class EntityUpdateError extends CatManagerError {}
