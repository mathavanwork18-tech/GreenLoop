/**
 * Phone Number Normalization & Formatting Utility for Green Loop
 * Handles Indian (+91) standard E.164 normalization, validation, and masked display.
 */

export interface NormalizedPhone {
  /** Canonical E.164 format, e.g. "+919876543210" */
  e164: string
  /** 10-digit national format without country code, e.g. "9876543210" */
  national: string
  /** Whether the phone number is a valid 10-digit Indian mobile number */
  isValid: boolean
  /** Masked representation for display in OTP screens, e.g. "+91 98*** **210" */
  masked: string
  /** Clean international display format, e.g. "+91 98765 43210" */
  display: string
}

/**
 * Normalizes any raw phone input string to consistent Green Loop format.
 * Automatically handles:
 * - "+919876543210"
 * - "+91 98765 43210"
 * - "919876543210"
 * - "09876543210"
 * - "9876543210"
 */
export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  if (!raw) {
    return {
      e164: '',
      national: '',
      isValid: false,
      masked: '+91 ******',
      display: '',
    }
  }

  // Extract digits only
  const digits = raw.toString().replace(/\D/g, '')

  let national = ''
  if (digits.length === 10) {
    national = digits
  } else if (digits.length === 11 && digits.startsWith('0')) {
    national = digits.slice(1)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    national = digits.slice(2)
  } else if (digits.length > 10) {
    // If user typed extra digits, extract the last 10
    national = digits.slice(-10)
  } else {
    national = digits
  }

  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  const isValid = /^[6-9]\d{9}$/.test(national)
  const e164 = isValid ? `+91${national}` : ''
  const display = isValid ? `+91 ${national.slice(0, 5)} ${national.slice(5)}` : national
  const masked = isValid
    ? `+91 ${national.slice(0, 2)}*** **${national.slice(-2)}`
    : '+91 ******'

  return {
    e164,
    national,
    isValid,
    masked,
    display,
  }
}
