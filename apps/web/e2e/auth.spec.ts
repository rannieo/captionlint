import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// ─────────────────────────────────────────────────────────────────────────────
// Sign In
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Sign In — happy path", () => {
  test("sign-in page loads with heading", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("email input is present", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("#email")).toBeVisible();
  });

  test("password input is present", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("#password")).toBeVisible();
  });

  test("Sign In button is present", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  });

  test("GitHub OAuth button is present with correct label", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /sign in with github/i })).toBeVisible();
  });

  test("Google OAuth button is present with correct label", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
  });

  test("'Forgot password?' link is visible", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("'Create one' link navigates to /create-account", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /create one/i }).click();
    await expect(page).toHaveURL(/\/create-account/);
  });

  test("'Or continue with' divider text is visible", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText("Or continue with")).toBeVisible();
  });
});

test.describe("Sign In — validation (negative path)", () => {
  test("submitting with no email shows 'Enter a valid email' error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test("submitting email without @ shows validation error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill("notanemail");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test("password shorter than 8 chars shows 'Password must be at least 8' error", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("short");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible();
  });

  test("after fixing email validation error, the error disappears on re-submit", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill("bademail");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();

    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("validpassword");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/enter a valid email/i)).not.toBeVisible();
  });

  test("both OAuth buttons are disabled while email form is submitting", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("validpassword");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    // During the async submit the OAuth buttons should be disabled
    await expect(page.getByRole("button", { name: /sign in with github/i })).toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Create Account
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Create Account — happy path", () => {
  test("create-account page loads with heading", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
  });

  test("Full Name input is present", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.locator("#full-name")).toBeVisible();
  });

  test("Email and Password inputs are present", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("Create Account submit button is present", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByRole("button", { name: /^create account$/i })).toBeVisible();
  });

  test("GitHub OAuth button is present with 'Continue with GitHub' label", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByRole("button", { name: /continue with github/i })).toBeVisible();
  });

  test("Google OAuth button is present with 'Continue with Google' label", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });

  test("'Sign in' link navigates to /sign-in", async ({ page }) => {
    await page.goto("/create-account");
    await page.getByRole("link", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("'Or continue with' divider text is visible", async ({ page }) => {
    await page.goto("/create-account");
    await expect(page.getByText("Or continue with")).toBeVisible();
  });
});

test.describe("Create Account — validation (negative path)", () => {
  test("submitting without full name shows 'Enter your full name' error", async ({ page }) => {
    await page.goto("/create-account");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /^create account$/i }).click();
    await expect(page.getByText(/enter your full name/i)).toBeVisible();
  });

  test("single-character name shows validation error", async ({ page }) => {
    await page.goto("/create-account");
    await page.locator("#full-name").fill("A");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /^create account$/i }).click();
    await expect(page.getByText(/enter your full name/i)).toBeVisible();
  });

  test("email without @ shows 'Enter a valid email' error", async ({ page }) => {
    await page.goto("/create-account");
    await page.locator("#full-name").fill("Jane Doe");
    await page.locator("#email").fill("notanemail");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /^create account$/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test("password shorter than 8 chars shows 'Password must be at least 8' error", async ({
    page,
  }) => {
    await page.goto("/create-account");
    await page.locator("#full-name").fill("Jane Doe");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("short");
    await page.getByRole("button", { name: /^create account$/i }).click();
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible();
  });

  test("OAuth buttons are disabled while the form is submitting", async ({ page }) => {
    await page.goto("/create-account");
    await page.locator("#full-name").fill("Jane Doe");
    await page.locator("#email").fill("user@example.com");
    await page.locator("#password").fill("validpassword");
    await page.getByRole("button", { name: /^create account$/i }).click();
    await expect(page.getByRole("button", { name: /continue with github/i })).toBeDisabled();
  });
});
