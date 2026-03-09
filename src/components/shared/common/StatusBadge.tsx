import { cn } from "@/lib/utils";

export type StatusType = "active" | "inactive" | "pending" | "error" | "warning" | "success" | "archived";

interface StatusBadgeProps {
    status: StatusType | string;
    label?: string;
    dot?: boolean;
    className?: string;
}

const statusMap: Record<string, { class: string; label: string }> = {
    active: { class: "label-green", label: "Đang hoạt động" },
    success: { class: "label-green", label: "Thành công" },
    completed: { class: "label-green", label: "Hoàn tất" },
    inactive: { class: "label-red", label: "Tạm dừng" },
    error: { class: "label-red", label: "Lỗi" },
    archived: { class: "label-red", label: "Đã lưu trữ" },
    pending: { class: "label-orange", label: "Chờ xử lý" },
    warning: { class: "label-orange", label: "Cảnh báo" },
    processing: { class: "label-purple", label: "Đang xử lý" },
};

export function StatusBadge({ status, label, dot = true, className }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase();
    const config = statusMap[normalizedStatus] || {
        class: "label-gray",
        label: status
    };

    return (
        <div className={cn(config.class, className)}>
            {dot && (
                <span className="relative flex size-1.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                    <span className="relative inline-flex rounded-full size-1.5 bg-current"></span>
                </span>
            )}
            {label || config.label}
        </div>
    );
}
