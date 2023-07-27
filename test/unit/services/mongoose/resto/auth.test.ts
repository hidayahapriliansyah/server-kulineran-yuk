import { signupForm } from '../../../../../src/services/mongoose/resto/auth';
import { Request } from 'express';
import { ZodError } from 'zod';

describe('signupForm Resto', () => {
  describe('username field', () => {
    // should return validation error if username field is undefined
    it('should return validation error if username field is undefined', async () => {
      const req = { body: {} } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Required');
      }
    });
    // should return validation error if username field is empty
    it('should return validation error if username field is empty', async () => {
      const req = { body: { username: '' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if username has invalid character
    it('should return validation error if username has invalid character', async () => {
      const req = {
        body: {
          username: 'werrt-',
        },
      } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if username has less than 3 character
    it('should return validation error if username has invalid character', async () => {
      const req = {
        body: {
          username: 'us',
        },
      } as unknown as Request;

      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe(
          'String must contain at least 3 character(s)'
        );
      }
    });
    // should return validation error if username has more than 30 character
    it('should return validation error if username has invalid character', async () => {
      const req = {
        body: {
          username:
            'usrererhdjfh0000000000000000dddddQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ',
        },
      } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe(
          'String must contain at most 30 character(s)'
        );
      }
    });
  });

  describe('name field', () => {
    // should return validation error if name field is undefined
    it('should return validation error if name field is undefined', async () => {
      const req = { body: {} } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe('Required');
      }
    });
    // should return validation error if name field is empty
    it('should return validation error if name field is empty', async () => {
      const req = { body: { name: '' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if name has invalid character
    it('should return validation error if name has invalid character', async () => {
      const req = { body: { name: ')(=+}{' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if name has less than 3 character
    it('should return validation error if name has less than 3 character', async () => {
      const req = { body: { name: 's' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe(
          'String must contain at least 3 character(s)'
        );
      }
    });
    // should return validation error if name has more than 50 character
    it('should return validation error if name has more than 50 character', async () => {
      const req = {
        body: {
          name: 'sdfjgkdfgdfhgkjdfhgkjdfkghdfjkgkdjfhgkjdfhgjkdfguerty968934534593499938475347534587345739457394857394589347593845938475345734957394573498573945734985734573949.-_,',
        },
      } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe(
          'String must contain at most 50 character(s)'
        );
      }
    });
  });

  describe('password field', () => {
    // should return validation error if password field is undefined
    it('should return validation error if password field is undefined', async () => {
      const req = { body: {} } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe('Required');
      }
    });

    // should return validation error if password field is empty
    it('should return validation error if password field is empty', async () => {
      const req = { body: { password: '' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe(
          'String must contain at least 6 character(s)'
        );
      }
    });

    // should return validation error if password has less than 6 character
    it('should return validation error if password has less than 6 character', async () => {
      const req = { body: { password: '7894f' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe(
          'String must contain at least 6 character(s)'
        );
      }
    });
  });

  describe('email field', () => {
    // should return validation error if email field is undefined
    it('should return validation error if email field is undefined', async () => {
      const req = { body: {} } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('email');
        const emailValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'email'
        )[0];
        expect(emailValidationError.message).toBe('Required');
      }
    });
    // should return validation error if email field is empty
    it('should return validation error if email field is empty', async () => {
      const req = { body: { email: '' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('email');
        const emailValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'email'
        )[0];
        expect(emailValidationError.message).toBe('Invalid email');
      }
    });
    // should return validation error if email has invalid character
    it('should return validation error if email has invalid character', async () => {
      const req = { body: { email: '/dfdf&^' } } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('email');
        const emailValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'email'
        )[0];
        expect(emailValidationError.message).toBe('Invalid email');
      }
    });
    // should return validation error if email has more than 254 character
    it('should return validation error if email has  more than 254 character', async () => {
      const req = {
        body: {
          email:
            'jdfhgjghdfjghjdfgdfhgjdfhgjhdfghdjfgjdfhgjfdhgjdfhgjdfhgjdhfgdfjghdjfgdfhgjfdgjdfhgjdfhgjdfhgdfjgjdfhgjdfhgjdhfghdfjgdfgdfhgjdgdfhghdfjghjdfgjdfgjdfhgjdfhgjdfhjfjfghfjgjdfhgjdfhdfhghdfjgjdfgjdfgdfhgjgdfhgjhdfghdfjghdjfgdjfghjdfgdfjghdjfghjdfhghdfjdufhduhfdufhdufhdufhudfhdufhudhfudhfudhfudhfsdgfuysgdfusgdfuysgdfuysgdfusdfgusdyfgsudfgusdygfusygfusdgfusgdfusgfusgdfuysdgfuydgsfuysdgfusdgfusdyfgusdygfusdgfusydfgusdygfusydfgusydgfuydfgusdyfgusdyfguysdfgusydfuysdgfudyfguydfuydsfgusdyfgsudgfusdfgsuyg@gmail.com',
        },
      } as unknown as Request;
      try {
        await signupForm(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('email');
        const emailValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'email'
        )[0];
        expect(emailValidationError.message).toBe(
          'String must contain at most 254 character(s)'
        );
      }
    });
  });
});
