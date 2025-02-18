-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Ticket" AS ENUM ('PAID', 'FREE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "image_url" TEXT,
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "referral_code" TEXT NOT NULL,
    "referrer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organizer_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizers" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "user_id" TEXT NOT NULL,
    "organizer_name" TEXT NOT NULL,
    "about_organizer" TEXT,
    "website" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ORGANIZER',
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "registration_start_date" TIMESTAMP(3) NOT NULL,
    "registration_end_date" TIMESTAMP(3) NOT NULL,
    "event_start_date" TIMESTAMP(3) NOT NULL,
    "event_end_date" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "attended_event" INTEGER NOT NULL,
    "total_ticket" INTEGER NOT NULL,
    "ticket_type" "Ticket" NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "status" "TransactionStatus" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "paymentProof" TEXT,
    "userId" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_slug_key" ON "organizers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_user_id_key" ON "organizers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizers_organizer_name_key" ON "organizers"("organizer_name");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "_CategoryToEvents_B_index" ON "_CategoryToEvents"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvents" ADD CONSTRAINT "_CategoryToEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvents" ADD CONSTRAINT "_CategoryToEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
