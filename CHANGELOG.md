

## [0.4.2](https://github.com/nhost/hasura-auth/compare/v0.4.1...v0.4.2) (2022-03-15)


### Bug Fixes

* check if photo item exists ([#115](https://github.com/nhost/hasura-auth/issues/115)) ([aab9637](https://github.com/nhost/hasura-auth/commit/aab963758652bf7ee045db7bf3691b6bc5766d17))## [0.4.1](https://github.com/nhost/hasura-auth/compare/v0.4.0...v0.4.1) (2022-03-15)


### Bug Fixes

* 0.4.0 bugs ([#114](https://github.com/nhost/hasura-auth/issues/114)) ([0024aa1](https://github.com/nhost/hasura-auth/commit/0024aa16f7e3a98bbcb7232512c82080a5f464a9))
* correct redirect url generation ([02e75cf](https://github.com/nhost/hasura-auth/commit/02e75cfd935926d235291eb7c5b9e82a6d929fe5))# [0.4.0](https://github.com/nhost/hasura-auth/compare/v0.3.2...v0.4.0) (2022-03-14)


### Bug Fixes

* provider requests signup data and redirectTo ([#108](https://github.com/nhost/hasura-auth/issues/108)) ([068f9c0](https://github.com/nhost/hasura-auth/commit/068f9c0d650b655656d78af4b719dc2289be0e67))


### Features

* error redirects ([#109](https://github.com/nhost/hasura-auth/issues/109)) ([0dcb370](https://github.com/nhost/hasura-auth/commit/0dcb37028ec19cfd546a5c847a7e13f8ea9a5195))undefined

## [0.3.2](https://github.com/nhost/hasura-auth/compare/v0.3.1...v0.3.2) (2022-03-09)


### Bug Fixes

* patch twitch Oauth provider ([1cd9926](https://github.com/nhost/hasura-auth/commit/1cd992602b22cbd40cd5dbf44947a67ba303ef5f))undefined

## [0.3.1](https://github.com/nhost/hasura-auth/compare/v0.3.0...v0.3.1) (2022-03-04)


### Bug Fixes

* use process.env.npm_package_version instead of import 'package.json' ([ab23184](https://github.com/nhost/hasura-auth/commit/ab23184e7c9638e6ae15cd0fe14232cf3c77dd67))# [0.3.0](https://github.com/nhost/hasura-auth/compare/v0.2.1...v0.3.0) (2022-03-02)

### Features

- add openapi/swagger endpoint ([6b92546](https://github.com/nhost/hasura-auth/commit/6b9254692810fda654c50483439c4eccc05dc7f7))
- add Twitch and Discord Oauth providers

## [0.2.1](https://github.com/nhost/hasura-auth/compare/v0.2.0...v0.2.1) (2022-02-18)

### Bug Fixes

- reload metadata after applying metadata changes ([26fb2ff](https://github.com/nhost/hasura-auth/commit/26fb2ffdef3cb5baba97a7bce8b5f0b62e58a0a3))

# [0.2.0](https://github.com/nhost/hasura-auth/compare/v0.1.0...v0.2.0) (2022-02-03)

## What's new

### Custom JWT claims

Hasura comes with a [powerful authorisation system](https://hasura.io/docs/latest/graphql/core/auth/authorization/index.html). Hasura Auth is already configured to add `x-hasura-user-id`, `x-hasura-allowed-roles`, and `x-hasura-user-isAnonymous` to the JSON Web Tokens it generates.

This release introduces the ability to define custom claims to add to the JWT, so they can be used by Hasura to determine the permissions of the received GraphQL operation.

Each custom claim is defined by a pair of a key and a value:

- The key determines the name of the claim, prefixed by `x-hasura`. For instance, `organisation-id`will become `x-hasura-organisation-id`.
- The value is a representation of the path to look at to determine the value of the claim. For instance `[profile.organisation.id](http://profile.organisation.id)` will look for the `user.profile` Hasura relationship, and the `profile.organisation` Hasura relationship. Array values are transformed into Postgres syntax so Hasura can interpret them. See the official Hasura documentation to understand the [session variables format](https://hasura.io/docs/latest/graphql/core/auth/authorization/roles-variables.html#format-of-session-variables).

```bash
AUTH_JWT_CUSTOM_CLAIMS={"organisation-id":"profile.organisation.id", "project-ids":"profile.contributesTo.project.id"}
```

Will automatically generate and fetch the following GraphQL query:

```graphql
{
  user(id: "<user-id>") {
    profile {
      organisation {
        id
      }
      contributesTo {
        project {
          id
        }
      }
    }
  }
}
```

It will then use the same expressions e.g. `profile.contributesTo.project.id` to evaluate the result with [JSONata](https://jsonata.org/), and possibly transform arrays into Hasura-readable, PostgreSQL arrays.Finally, it adds the custom claims to the JWT in the `https://hasura.io/jwt/claims` namespace:

```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-organisation-id": "8bdc4f57-7d64-4146-a663-6bcb05ea2ac1",
    "x-hasura-project-ids": "{\"3af1b33f-fd0f-425e-92e2-0db09c8b2e29\",\"979cb94c-d873-4d5b-8ee0-74527428f58f\"}",
    "x-hasura-allowed-roles": [ "me", "user" ],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "121bbea4-908e-4540-ac5d-52c7f6f93bec",
    "x-hasura-user-isAnonymous": "false"
  }
  "sub": "f8776768-4bbd-46f8-bae1-3c40da4a89ff",
  "iss": "hasura-auth",
  "iat": 1643040189,
  "exp": 1643041089
}
```

### `metadata` user field

A basic JSONB column in the `auth.users` table, that is passed on as an option on registration:

```json
{
  "email": "bob@bob.com",
  "passord": "12345678",
  "options": {
    "metadata": {
      "first_name": "Bob"
    }
  }
}
```

### Remote custom email templates

When running Hasura Auth in its own infrastructure, it is possible to mount a volume with custom `email-templates` directory. However, in some cases, we may want to fetch templates from an external HTTP endpoint. Hence the introduction of a new `AUTH_EMAIL_TEMPLATE_FETCH_URL` environment variable:

```bash
AUTH_EMAIL_TEMPLATE_FETCH_URL=https://github.com/nhost/nhost/tree/custom-email-templates-example/examples/custom-email-templates
```

In the above example, on every email creation, the server will use this URL to fetch its templates, depending on the locale, email type and field.

For instance, the template for english verification email body will the fetched in [https://raw.githubusercontent.com/nhost/nhost/custom-email-templates-example/examples/custom-email-templates/en/email-verify/body.html](https://raw.githubusercontent.com/nhost/nhost/custom-email-templates-example/examples/custom-email-templates/en/email-verify/body.html).

See the [example in the main nhost/nhost repository](https://github.com/nhost/nhost/tree/main/examples/custom-email-templates).

The context variables in email templates have been simplified: the `${link}` variable contains the entire redirection url the recipient needs to follow.

## Changelog

### Bug Fixes

- allow redirect urls in Oauth that starts with the one defined in the server ([c00bff8](https://github.com/nhost/hasura-auth/commit/c00bff8283a657c38fce3b5cbfb7c56cb17f82ab))
- **email-templates:** fallback to the default template when the requested template doesn't exist ([6a70c10](https://github.com/nhost/hasura-auth/commit/6a70c103dff19b6c3f6e9e93b0cbfa0dabbdc01a))
- **email-templates:** use the locale given as an option, then the existing user locale, then default ([31d4a89](https://github.com/nhost/hasura-auth/commit/31d4a89d58d5571c920d93839638daa07ec018ff))
- **metadata:** show column values when the column name is the same as the graphql field name ([a595941](https://github.com/nhost/hasura-auth/commit/a5959413322415a23012d67773ca65387235503d)), closes [#76](https://github.com/nhost/hasura-auth/issues/76)
- **passwordless:** don't send passwordless email when the user is disabled ([3ec9c76](https://github.com/nhost/hasura-auth/commit/3ec9c763f1b1abbda62a5b9d4c01b475a62c460b))
- remove email-templates endpoint ([5c6dbf5](https://github.com/nhost/hasura-auth/commit/5c6dbf503ff729ef928f9df105998d740c5c75e8)), closes [#75](https://github.com/nhost/hasura-auth/issues/75)

### Features

- custom claims ([01c0207](https://github.com/nhost/hasura-auth/commit/01c0207fd13446d37375e261772ee4a5ca27d108)), closes [#49](https://github.com/nhost/hasura-auth/issues/49)
- implement remote email templates with AUTH_EMAIL_TEMPLATE_FETCH_URL ([2458651](https://github.com/nhost/hasura-auth/commit/2458651a415f43e01a8917f0f8aaa75bdae11897))
- simplify email templates context ([b94cdf2](https://github.com/nhost/hasura-auth/commit/b94cdf20973b22601705a0ed0395bfc9e2699309)), closes [#64](https://github.com/nhost/hasura-auth/issues/64)
- use array custom JWT claims ([53a286a](https://github.com/nhost/hasura-auth/commit/53a286a74f74d315282c6a92b679f490a3d7336e))

### BREAKING CHANGES

- deactivate the `/email-templates` endpoint

# [0.1.0](https://github.com/nhost/hasura-auth/compare/v0.0.1-canary.0...v0.1.0) (2022-01-18)

### Bug Fixes

- Update README.md ([#27](https://github.com/nhost/hasura-auth/issues/27)) ([f51bb26](https://github.com/nhost/hasura-auth/commit/f51bb26490273215543e0905e19eeab96a7fb50c))
- better error message for redirectTo ([#59](https://github.com/nhost/hasura-auth/issues/59)) ([0b76425](https://github.com/nhost/hasura-auth/commit/0b764255e02f0f0c3a72f19863f947403dbef56d))
- everything ([da8c954](https://github.com/nhost/hasura-auth/commit/da8c954ffd4990d599b6db5b7e77d604450225fd))
- keep .env for dev in repo and updated hasura version to m1 supported image ([#60](https://github.com/nhost/hasura-auth/issues/60)) ([394d4ae](https://github.com/nhost/hasura-auth/commit/394d4ae5e2fd9d4d87575f168ea15da675f9743a))
- **password:** validate password on change ([#58](https://github.com/nhost/hasura-auth/issues/58)) ([994af31](https://github.com/nhost/hasura-auth/commit/994af3193511a594f6d659b80e92ec568b6d63b0))
- **user:** fix user schemas ([#52](https://github.com/nhost/hasura-auth/issues/52)) ([c7eb721](https://github.com/nhost/hasura-auth/commit/c7eb721f1193f487ae094e5b29aa5f4c97b0ff69))

### Features

- **emails:** translate email templates to french ([#63](https://github.com/nhost/hasura-auth/issues/63)) ([109695f](https://github.com/nhost/hasura-auth/commit/109695f0da65d9af3ad913a56300bd7ed6df5496))

### Performance Improvements

- reduce docker image from 477MB to 176MB ([5f4d2b2](https://github.com/nhost/hasura-auth/commit/5f4d2b2415e83ad4e589d3c12a23df4938ea0c14))