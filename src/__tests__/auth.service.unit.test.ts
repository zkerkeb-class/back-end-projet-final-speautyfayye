import {describe, expect} from '@jest/globals';
import AuthService from '../services/auth.service';
import AuthValidators from '../validators/auth.validators';

const authService = new AuthService();
const authValidators = new AuthValidators();

//#region Crypt service

describe('Hash service', () => {
  it('should not return the same string', async () => {
    const password = 'Test1234!';
    const hash = await authService.hashPassword(password);

    expect(password).not.toEqual(hash);
  });
});

//#endregion

//#region Email validator

describe('Email validator', () => {
  it('should accept a valid email', () => {
    const isValid = authValidators.isEmailValid('sven.dockx@gmail.com');
    expect(isValid).toBeTruthy();
  });

  it('should not accept an email without @', () => {
    const isValid = authValidators.isEmailValid('sven.dockxgmail.com');
    expect(isValid).toBeFalsy();
  });

  it('should not accept an email without .', () => {
    const isValid = authValidators.isEmailValid('svendockx@gmailcom');
    expect(isValid).toBeFalsy();
  });

  it('should not accept an email with less than 5 characters', () => {
    const isValid = authValidators.isEmailValid('sven');
    expect(isValid).toBeFalsy();
  });

  it('should not accept an email with whitespaces', () => {
    const isValid = authValidators.isEmailValid('sven dockx@gmail.com');
    expect(isValid).toBeFalsy();
  });
});

//#endregion

//#region Password validator

describe('Password validator', () => {
  it('should accept a valid password', () => {
    const isValid = authValidators.isPasswordValid('Test12345!');
    expect(isValid).toBeTruthy();
  });

  it('should not accept a password without special character', () => {
    const isValid = authValidators.isPasswordValid('Test12345a');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password without majuscule', () => {
    const isValid = authValidators.isPasswordValid('test12345!');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password without minuscule', () => {
    const isValid = authValidators.isPasswordValid('TEST12345!');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password without numbers', () => {
    const isValid = authValidators.isPasswordValid('Testabcde!');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password less than 8 characters', () => {
    const isValid = authValidators.isPasswordValid('Test12!');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password less than 16 characters', () => {
    const isValid = authValidators.isPasswordValid('Teeeest123456789!');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a password with white spaces', () => {
    const isValid = authValidators.isPasswordValid('Test 12345!');
    expect(isValid).toBeFalsy();
  });
});

//#endregion

//#region Firstname validator

describe('Firstname validator', () => {
  it('should accept a valid firstname', () => {
    const isValid = authValidators.isFirstnameValid('sven');
    expect(isValid).toBeTruthy();
  });

  it('should not accept a firstname less than 1 character', () => {
    const isValid = authValidators.isFirstnameValid('');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a firstname with only whitespaces', () => {
    const isValid = authValidators.isFirstnameValid('    ');
    expect(isValid).toBeFalsy();
  });
});

//#endregion

//#region Lastname validator

describe('Lastname validator', () => {
  it('should accept a valid lastname', () => {
    const isValid = authValidators.isLastnameValid('dockx');
    expect(isValid).toBeTruthy();
  });

  it('should not accept a lastname less than 1 character', () => {
    const isValid = authValidators.isLastnameValid('');
    expect(isValid).toBeFalsy();
  });

  it('should not accept a lastname with only whitespaces', () => {
    const isValid = authValidators.isLastnameValid('    ');
    expect(isValid).toBeFalsy();
  });
});

//#endregion

//#region phoneNumber validator

describe('phoneNumber validator', () => {
  it('should accept a french number starting with 06', () => {
    const isValid = authValidators.isPhoneNumberValid('0666751243');
    expect(isValid).toBeTruthy();
  });
  it('should accept a french number starting with +336', () => {
    const isValid = authValidators.isPhoneNumberValid('+33666751243');
    expect(isValid).toBeTruthy();
  });
  it('should accept a french number starting with 00336', () => {
    const isValid = authValidators.isPhoneNumberValid('0033666751243');
    expect(isValid).toBeTruthy();
  });

  it('should accept a lux number starting with +352', () => {
    const isValid = authValidators.isPhoneNumberValid('+352691234381');
    expect(isValid).toBeTruthy();
  });

  it('should not accept a lux number starting with +352 with whitespaces', () => {
    const isValid = authValidators.isPhoneNumberValid('+352 691 234 380');
    expect(isValid).toBeFalsy();
  });
  it('should not accept a number with characters', () => {
    const isValid = authValidators.isPhoneNumberValid('066675124B');
    expect(isValid).toBeFalsy();
  });
  it('should not accept a number with a plus not in first place', () => {
    const isValid = authValidators.isPhoneNumberValid('066+751243');
    expect(isValid).toBeFalsy();
  });
});

//#endregion
