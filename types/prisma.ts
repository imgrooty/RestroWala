export { UserRole, OrderStatus, PaymentStatus, TableStatus } from "@prisma/client";

// Re-export model types if needed, but prefer importing from @prisma/client directly
export type {
    Order,
    OrderItem,
    Table,
    Restaurant,
    User,
    Category,
    MenuItem
} from "@prisma/client";
