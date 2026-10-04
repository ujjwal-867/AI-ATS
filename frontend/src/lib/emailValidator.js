/**
 * Client-side email validation and smart typo detection.
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const COMMON_TYPOS = {
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cpm": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gemail.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "ymail.con": "ymail.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outklook.com": "outlook.com",
  "outlook.con": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "iclod.com": "icloud.com",
  "iclou.com": "icloud.com",
  "icloud.con": "icloud.com",
  "protonmai.com": "protonmail.com",
  "protonmial.com": "protonmail.com",
};

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "throwawaymail.com",
  "getairmail.com",
  "mohmal.com",
  "burnermail.io",
  "fakeinbox.com",
  "temp-mail.org",
  "tempmailaddress.com",
  "mytemp.email",
  "generator.email",
  "crazymailing.com",
]);

const PLACEHOLDER_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "sample.com",
  "domain.com",
  "placeholder.com",
  "fake.com",
  "yourdomain.com",
  "mycompany.com",
]);

export function validateEmail(rawEmail) {
  if (!rawEmail || typeof rawEmail !== "string") {
    return {
      isValid: false,
      reason: "Email is required.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  let email = rawEmail.trim().toLowerCase();
  email = email.replace(/^mailto:/i, "").replace(/[;,.]+$/, "");

  if (email.length > 254) {
    return {
      isValid: false,
      reason: "Email address exceeds maximum length of 254 characters.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    return {
      isValid: false,
      reason: "Email must contain exactly one '@' symbol.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  const [localPart, domain] = email.split("@");

  if (!localPart || localPart.length > 64) {
    return {
      isValid: false,
      reason: "Username part of email must be between 1 and 64 characters.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return {
      isValid: false,
      reason: "Username cannot start/end with a period or have consecutive periods.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  if (!domain || !domain.includes(".")) {
    return {
      isValid: false,
      reason: "Domain must contain a valid extension (e.g. .com).",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || /\d/.test(tld)) {
    return {
      isValid: false,
      reason: "Domain extension must be at least 2 letters without numbers.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      reason: "Invalid email address format.",
      suggestion: null,
      isDisposable: false,
      isPlaceholder: false,
    };
  }

  let suggestion = null;
  if (COMMON_TYPOS[domain]) {
    suggestion = `${localPart}@${COMMON_TYPOS[domain]}`;
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      reason: `Disposable temporary email from '${domain}' is not allowed.`,
      suggestion: null,
      isDisposable: true,
      isPlaceholder: false,
    };
  }

  if (PLACEHOLDER_DOMAINS.has(domain)) {
    return {
      isValid: false,
      reason: `Placeholder domain '${domain}' detected. Please provide an active email.`,
      suggestion: null,
      isDisposable: false,
      isPlaceholder: true,
    };
  }

  return {
    isValid: true,
    email,
    reason: null,
    suggestion,
    isDisposable: false,
    isPlaceholder: false,
  };
}
