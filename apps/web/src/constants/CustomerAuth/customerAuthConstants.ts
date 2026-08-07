export const customerAuthQueryKey = ['customer-auth', 'me'] as const;
export const customerCsrfQueryKey = ['customer-auth', 'csrf'] as const;

export const customerLoginInitialValues = {
  email: '',
  password: ''
};

export const customerSignupInitialValues = {
  name: '',
  email: '',
  phone: '',
  password: ''
};
