import z from 'zod';

export default class AuthValidators {
  accessSecret = 'def';
  refreshSecret = 'deffe';
  passwordSchema = z
    .string()
    .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/);
  phoneNumberSchema = z
    .string()
    .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,7}$/);
  firstnameSchema = z.string().trim().min(1).max(25);
  lastnameSchema = z.string().trim().min(1).max(25);
  emailSchema = z.string().email();

  isEmailValid = (email: string) => this.emailSchema.safeParse(email).success;
  isPasswordValid = (password: string) =>
    this.passwordSchema.safeParse(password).success;
  isPhoneNumberValid = (phoneNumber: string) =>
    this.phoneNumberSchema.safeParse(phoneNumber).success;
  isFirstnameValid = (firstname: string) =>
    this.firstnameSchema.safeParse(firstname).success;
  isLastnameValid = (lastname: string) =>
    this.lastnameSchema.safeParse(lastname).success;
}
