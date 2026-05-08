type CreateAccountInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function errorText(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

export function validateCreateAccountInput(input: CreateAccountInput): string | null {
  if (input.fullName.trim().length < 2) {
    return "Enter your full name.";
  }

  if (!isValidEmail(input.email)) {
    return "Enter a valid email address.";
  }

  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

export function validateSignInInput(input: SignInInput): string | null {
  if (!isValidEmail(input.email)) {
    return "Enter a valid email address.";
  }

  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

export function getAuthErrorMessage(error: unknown): string {
  const message = errorText(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("already") || lowerMessage.includes("exists") || lowerMessage.includes("duplicate")) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (lowerMessage.includes("invalid") && (lowerMessage.includes("password") || lowerMessage.includes("credential"))) {
    return "Email or password is incorrect.";
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch failed")
  ) {
    return "Could not reach the authentication service. Check the API URL and try again.";
  }

  return message || "Authentication failed. Please try again.";
}
