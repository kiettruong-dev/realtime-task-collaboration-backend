-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_workspaceId_fkey";

-- DropTable
DROP TABLE "public"."Task";

-- DropEnum
DROP TYPE "public"."TaskStatus";

