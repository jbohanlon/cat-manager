# Cat Manager
## Description

An app for managing a vast collection of cats!

## Installation and first-time setup

Clone the repository, enter the repository directory, and then create a new ormconfig.yml file from the template source:

```bash
$ cp config/ormconfig.template.yml config/ormconfig.yml
```

Then run:

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Local scripts

There's a top level `scripts/local` directory for creating custom scripts for testing, generating reports, or running manual data transformations.  These scripts aren't committed to the repository. Here's an example script, which you could place at `scripts/local/testing.ts`:

```typescript
import { createApp } from '../createApp';
import { UsersService } from '../../src/users/providers/users.service';

(async () => {
  const app = await createApp();
  const usersService = await app.get<UsersService>(UsersService);
  console.log(`How many users are there? ${(await usersService.findAll()).length}`);
})();
```

And here's how you would run that script:
```
NODE_ENV=development npx ts-node ./scripts/local/testing.ts
```