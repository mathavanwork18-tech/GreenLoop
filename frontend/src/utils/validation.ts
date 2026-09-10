export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function isValidUsername(username: string): boolean {
  return /^@?[a-zA-Z0-9_]{3,30}$/.test(username)
}
