import fs from "node:fs/promises";
import path from "node:path";
import type {
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
} from "@playwright/test/reporter";

interface FailureSummary {
  name: string;
  url: string;
  screenshotPath: string;
  errorMessage: string;
  suggestedFix: string;
}

function normalizeAttachmentBody(body: string | Buffer | undefined) {
  if (!body) return "";
  return typeof body === "string" ? body : body.toString("utf-8");
}

function getPrimaryError(errors: TestError[]) {
  return errors.find((error) => error.message)?.message ?? "Sin mensaje de error disponible.";
}

function buildSuggestedFix(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();

  if (normalized.includes("timeout")) {
    return "Revisá selectores frágiles, estados de carga y esperas explícitas antes de interactuar.";
  }

  if (normalized.includes("strict mode violation")) {
    return "El selector está resolviendo más de un elemento; hacelo más específico o scopealo dentro del contenedor correcto.";
  }

  if (normalized.includes("net::") || normalized.includes("failed to fetch")) {
    return "Validá conectividad, CORS y disponibilidad del backend/Supabase para ese flujo.";
  }

  if (normalized.includes("/login") || normalized.includes("auth") || normalized.includes("contraseña")) {
    return "Comprobá las credenciales de prueba y que el usuario tenga una sesión Supabase válida antes del escenario.";
  }

  if (normalized.includes("expect(received).to") || normalized.includes("expected")) {
    return "Compará el contrato esperado con el UI actual; puede haber drift entre el brief y la implementación desplegada.";
  }

  return "Inspeccioná la captura y el log del test para ajustar el selector, el dato semilla o la precondición del flujo.";
}

class MarkdownErrorReporter implements Reporter {
  private total = 0;
  private passed = 0;
  private failed = 0;
  private failures: FailureSummary[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.total += 1;

    if (result.status === "passed") {
      this.passed += 1;
      return;
    }

    if (result.status === "failed" || result.status === "timedOut" || result.status === "interrupted") {
      this.failed += 1;

      const screenshotAttachment = result.attachments.find(
        (attachment) =>
          attachment.contentType?.startsWith("image/") ||
          attachment.path?.toLowerCase().endsWith(".png"),
      );
      const urlAttachment = result.attachments.find((attachment) => attachment.name === "current-url");
      const url =
        normalizeAttachmentBody(urlAttachment?.body) ||
        (urlAttachment?.path ? urlAttachment.path : "URL no capturada");
      const errorMessage = getPrimaryError(result.errors);

      this.failures.push({
        name: test.titlePath().join(" › "),
        url,
        screenshotPath: screenshotAttachment?.path ?? "Sin captura",
        errorMessage,
        suggestedFix: buildSuggestedFix(errorMessage),
      });
    }
  }

  async onEnd(_result: FullResult) {
    const outputDir = path.resolve(process.cwd(), "test-results");
    const outputPath = path.join(outputDir, "REPORT.md");
    const generatedAt = new Date().toISOString();
    const baseUrl = process.env.BASE_URL ?? "https://changa-three.vercel.app";

    const failedTestsSection =
      this.failures.length === 0
        ? "No hubo tests fallidos.\n"
        : this.failures
            .map(
              (failure) => `### ❌ ${failure.name}
- **URL:** ${failure.url}
- **Error:** ${failure.errorMessage.replace(/\n+/g, " ").trim()}
- **Screenshot:** ${failure.screenshotPath}
- **Suggested Fix:** ${failure.suggestedFix}
`,
            )
            .join("\n");

    const markdown = `# Changa - Test Report
Generated: ${generatedAt}
BASE_URL: ${baseUrl}

## Summary
- Total: ${this.total}
- Passed: ${this.passed} ✅
- Failed: ${this.failed} ❌

## Failed Tests

${failedTestsSection}`;

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, markdown, "utf-8");
  }
}

export default MarkdownErrorReporter;
