-- CreateEnum
CREATE TYPE "StoryCategory" AS ENUM ('LOVE_FAMILY', 'HEROISM', 'WORK_PROFESSION', 'LIFE_WISDOM', 'MEMORY');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PENDING_PAYMENT', 'ON_MODERATION', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL DEFAULT 'Аноним',
    "author_birth_date" TIMESTAMP(3),
    "author_bio" VARCHAR(200),
    "author_photo_url" TEXT,
    "email" TEXT NOT NULL,
    "category" "StoryCategory" NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "region_id" TEXT,
    "region_name" TEXT,
    "settlement_name" TEXT,
    "address" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "rejection_reason" TEXT,
    "moderated_at" TIMESTAMP(3),
    "moderated_by" TEXT,
    "cabinet_token" TEXT NOT NULL,
    "hearts_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_images" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "yookassa_id" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 990,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payer_ip" TEXT,
    "payer_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "story_id" TEXT,
    "admin_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stories_cabinet_token_key" ON "stories"("cabinet_token");

-- CreateIndex
CREATE INDEX "stories_status_idx" ON "stories"("status");

-- CreateIndex
CREATE INDEX "stories_latitude_longitude_idx" ON "stories"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "stories_region_id_idx" ON "stories"("region_id");

-- CreateIndex
CREATE INDEX "stories_cabinet_token_idx" ON "stories"("cabinet_token");

-- CreateIndex
CREATE INDEX "story_images_story_id_idx" ON "story_images"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_story_id_key" ON "payments"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_yookassa_id_key" ON "payments"("yookassa_id");

-- CreateIndex
CREATE INDEX "payments_yookassa_id_idx" ON "payments"("yookassa_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "activity_logs_story_id_idx" ON "activity_logs"("story_id");

-- CreateIndex
CREATE INDEX "activity_logs_admin_id_idx" ON "activity_logs"("admin_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "story_images" ADD CONSTRAINT "story_images_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
