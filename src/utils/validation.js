import * as Yup from 'yup';

export const quantitySchema = Yup.object({
  quantity: Yup.number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity too large')
    .integer('Must be whole number')
    .required('Quantity is required'),
});

export const serialSchema = Yup.object({
  serialNumber: Yup.string()
    .matches(/^[A-Z0-9-]+$/, 'Invalid serial format')
    .min(5, 'Serial too short')
    .max(50, 'Serial too long')
    .required('Serial number required'),
});

export const binCodeSchema = Yup.object({
  binCode: Yup.string()
    .matches(/^[A-Z0-9-]+$/, 'Invalid bin code')
    .required('Bin code required'),
});

export const validateField = async (schema, value) => {
  try {
    await schema.validate(value);
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};
