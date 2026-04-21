#!/bin/bash
set -e

MIGRATION_NAME="$1"
PRISMA_VERSION="7.3.0"

if [ -z "$MIGRATION_NAME" ]; then
    echo "❌ Lỗi: Thiếu tên migration"
    exit 1
fi

echo "🚀 Bắt đầu quy trình Migration (Prisma v${PRISMA_VERSION})"

# 1. Tạo migration Up (chưa apply)
echo "📝 Bước 1: Tạo migration file..."
pnpm dlx prisma@${PRISMA_VERSION} migrate dev --create-only --name "${MIGRATION_NAME}"

# 2. Lấy thư mục migration mới nhất
LATEST_MIGRATION=$(ls -td prisma/migrations/*/ | head -1)
echo "✅ Đã xác định thư mục: ${LATEST_MIGRATION}"

# 3. Tạo Down migration (Rollback)
echo "📝 Bước 2: Tạo down.sql..."
DOWN_MIGRATION_FILE="${LATEST_MIGRATION}down.sql"

# SỬA LỖI THEO YÊU CẦU PRISMA 7.3.0:
# --from-schema: Trạng thái mới (schema file)
# --to-config-datasource: Trạng thái cũ (đọc từ database thật dựa trên prisma.config.ts)
pnpm dlx prisma@${PRISMA_VERSION} migrate diff \
    --from-schema prisma/schema.prisma \
    --to-config-datasource \
    --script > "${DOWN_MIGRATION_FILE}"

if [ -s "${DOWN_MIGRATION_FILE}" ]; then
    echo "✅ Down migration tạo thành công."
else
    echo "⚠️  Down migration trống."
    rm -f "${DOWN_MIGRATION_FILE}"
fi

# 4. Áp dụng migration vào DB và Regenerate Client
echo "🚀 Bước 3: Áp dụng migration và cập nhật Client..."
pnpm dlx prisma@${PRISMA_VERSION} migrate dev

echo "---"
echo "🎉 Chúc mừng! Mọi thứ đã hoạt động với Prisma 7.3.0."