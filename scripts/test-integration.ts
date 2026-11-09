import "dotenv/config";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

function databaseName(value: URL): string {
  return decodeURIComponent(value.pathname.replace(/^\/+/, ""));
}

function schemaName(value: URL): string {
  return value.searchParams.get("schema") ?? "public";
}

function isLoopback(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

function assertSafeTestDatabase() {
  const developmentUrl = process.env.DATABASE_URL;
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!developmentUrl || !testDatabaseUrl) {
    throw new Error(
      "Renseignez DATABASE_URL et TEST_DATABASE_URL. Les tests refusent de sélectionner une base implicitement.",
    );
  }

  const development = new URL(developmentUrl);
  const test = new URL(testDatabaseUrl);
  const developmentName = databaseName(development);
  const testName = databaseName(test);
  const developmentSchema = schemaName(development);
  const testSchema = schemaName(test);
  const sameDatabase = developmentName === testName;
  if (
    !["postgres:", "postgresql:"].includes(development.protocol) ||
    !["postgres:", "postgresql:"].includes(test.protocol) ||
    !isLoopback(test.hostname) ||
    !isLoopback(development.hostname) ||
    development.hostname !== test.hostname ||
    (development.port || "5432") !== (test.port || "5432") ||
    (sameDatabase
      ? developmentSchema === testSchema ||
        !/(?:^|_)(?:test|tests)$/i.test(testSchema)
      : !/(?:^|_)(?:test|tests)$/i.test(testName))
  ) {
    throw new Error(
      "TEST_DATABASE_URL doit viser PostgreSQL en local, avec une base distincte terminant par _test(s), ou un schéma distinct terminant par _test(s) dans la base de développement.",
    );
  }

  return {
    developmentUrl,
    testUrl: test.toString(),
    testName,
    testSchema,
    sameDatabase,
  };
}

async function assertDatabaseTarget({
  developmentUrl,
  testUrl,
  testName,
  testSchema,
  sameDatabase,
}: ReturnType<typeof assertSafeTestDatabase>) {
  if (!/^[a-z][a-z0-9_]{0,62}$/i.test(testSchema)) {
    throw new Error("Le nom du schéma PostgreSQL de test est invalide.");
  }

  if (sameDatabase) {
    const developmentClient = new PrismaClient({ datasourceUrl: developmentUrl });
    try {
      const [target] = await developmentClient.$queryRaw<
        Array<{ database: string; canCreateSchema: boolean; schemaExists: boolean }>
      >`SELECT current_database() AS database,
          has_database_privilege(current_user, current_database(), 'CREATE') AS "canCreateSchema",
          to_regnamespace(${testSchema}) IS NOT NULL AS "schemaExists"`;
      if (target.database !== testName || !target.canCreateSchema) {
        throw new Error(
          "Le rôle PostgreSQL ne peut pas créer un schéma isolé dans la base sélectionnée.",
        );
      }
      if (target.schemaExists) {
        throw new Error(
          `Le schéma de test "${testSchema}" existe déjà; choisissez un schéma de test neuf pour éviter de modifier des données existantes.`,
        );
      }
      await developmentClient.$executeRawUnsafe(`CREATE SCHEMA "${testSchema}"`);
    } finally {
      await developmentClient.$disconnect();
    }
  }

  const testClient = new PrismaClient({ datasourceUrl: testUrl });
  try {
    const [target] = await testClient.$queryRaw<
      Array<{ database: string; schema: string; canCreateObjects: boolean }>
    >`SELECT current_database() AS database,
          current_schema() AS schema,
          has_database_privilege(current_user, current_database(), 'CREATE') AS "canCreateObjects"`;
    if (
      target.database !== testName ||
      target.schema !== testSchema ||
      !target.canCreateObjects
    ) {
      throw new Error(
        "La cible PostgreSQL n’est pas le schéma isolé attendu ou le rôle ne peut pas y appliquer ses migrations.",
      );
    }
  } finally {
    await testClient.$disconnect();
  }
}

async function removeIsolatedSchema(databaseUrl: string, testSchema: string) {
  const client = new PrismaClient({ datasourceUrl: databaseUrl });
  try {
    await client.$executeRawUnsafe(`DROP SCHEMA "${testSchema}" CASCADE`);
  } finally {
    await client.$disconnect();
  }
}

function runNpm(args: string[], environment: NodeJS.ProcessEnv) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error("Lancez cette commande depuis npm run test:integration.");
  }
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    stdio: "inherit",
    env: environment,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`La commande npm ${args.join(" ")} a échoué.`);
  }
}

async function main() {
  const target = assertSafeTestDatabase();
  await assertDatabaseTarget(target);

  const environment = {
    ...process.env,
    DATABASE_URL: target.testUrl,
    TEST_DATABASE_URL: target.testUrl,
    SEED_ADMIN_EMAIL: "",
    MEMOORIA_RUN_PG_INTEGRATION: "1",
  };
  try {
    runNpm(["exec", "--", "prisma", "migrate", "deploy"], environment);
    runNpm(["exec", "--", "tsx", "prisma/seed.ts"], environment);
    runNpm(["exec", "--", "vitest", "run", "tests/integration"], environment);
  } finally {
    if (target.sameDatabase) {
      await removeIsolatedSchema(target.developmentUrl, target.testSchema);
    }
  }
}

main().catch((error: unknown) => {
  console.error("Échec des tests PostgreSQL isolés :", error);
  process.exitCode = 1;
});
