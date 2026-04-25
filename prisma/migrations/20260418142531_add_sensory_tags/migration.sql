-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "aromaTag" TEXT,
ADD COLUMN     "crowdTag" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lightTag" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "soundTag" TEXT;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
