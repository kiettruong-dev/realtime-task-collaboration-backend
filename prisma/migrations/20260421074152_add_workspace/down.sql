-- DropForeignKey
ALTER TABLE "public"."Workspace" DROP CONSTRAINT "Workspace_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_userId_fkey";

-- DropTable
DROP TABLE "public"."Workspace";

-- DropTable
DROP TABLE "public"."WorkspaceMember";

-- DropEnum
DROP TYPE "public"."Role";

