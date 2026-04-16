export function getEnv(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function hasClientCredentials() {
  return Boolean(getEnv("TEST_EMAIL") && getEnv("TEST_PASSWORD"));
}

export function hasProviderCredentials() {
  return Boolean(
    (getEnv("TEST_PROVIDER_EMAIL") && getEnv("TEST_PROVIDER_PASSWORD")) ||
      (getEnv("TEST_EMAIL") && getEnv("TEST_PASSWORD")),
  );
}
