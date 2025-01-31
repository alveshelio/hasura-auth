import { Router } from 'express';
import { createValidator } from 'express-joi-validation';

import { asyncWrapper as aw } from '@/helpers';
import { signUpEmailPasswordHandler } from './email-password';
import { signUpEmailPasswordSchema } from '@/validation';

const router = Router();

/**
 * POST /signup/email-password
 * @summary Signup with email and password
 * @param {SignUpEmailPasswordSchema} request.body.required
 * @return {SessionPayload} 200 - Successfully registered. Null session means email verification is pending - application/json
 * @return {string} 400 - The payload is invalid - text/plain
 * @return {EmailAlreadyInUseError} 409 - Email is already present in the database
 * @tags Registration
 */
router.post(
  '/signup/email-password',
  createValidator().body(signUpEmailPasswordSchema),
  aw(signUpEmailPasswordHandler)
);

// WARNING: alias route for `/signin/magic-link`
// router.post(
//   '/signup/magic-link',
//   createValidator().body(signInMagicLinkSchema),
//   aw(signInMagicLinkHandler)
// );

const signUpRouter = router;
export { signUpRouter };
