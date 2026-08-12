-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "branding_config" JSONB,
    "review_period_months" INTEGER
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sso_subject_id" TEXT,
    CONSTRAINT "users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" DATETIME NOT NULL,
    "next_review_date" DATETIME,
    CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "passports_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passport_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passport_id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    CONSTRAINT "passport_responses_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passport_consent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passport_id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "passport_consent_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_passport_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_log_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_log_target_passport_id_fkey" FOREIGN KEY ("target_passport_id") REFERENCES "passports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_organisation_id_email_key" ON "users"("organisation_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "passport_responses_passport_id_field_key_key" ON "passport_responses"("passport_id", "field_key");

-- CreateIndex
CREATE UNIQUE INDEX "passport_consent_passport_id_section_recipient_key" ON "passport_consent"("passport_id", "section", "recipient");
