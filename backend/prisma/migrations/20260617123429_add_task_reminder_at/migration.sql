-- AlterTable
ALTER TABLE "task" ADD COLUMN     "nextRecurrenceAt" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "reminderAt" TIMESTAMP(3),
ADD COLUMN     "reminderNotifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "task_nextRecurrenceAt_idx" ON "task"("nextRecurrenceAt");
