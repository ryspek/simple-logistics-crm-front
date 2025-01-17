export const sleep = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Validation */
export const validators = {
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Please enter a valid email address'
  },
  inn: (v: string) => {
    const pattern = /^\d{14}$/
    return pattern.test(v) || 'Введите верный формат ИНН'
  },
  documentID: (v: string) => {
    const pattern = /^[A-Z]{2}\d{7}$/
    return pattern.test(v) || 'Введите верный формат ID'
  },
  required: (v: any) => !!v || 'Необходимо заполнить',
}
