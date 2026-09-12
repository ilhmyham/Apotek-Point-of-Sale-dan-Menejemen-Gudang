import { AppError } from "./AppError";

export class ForbiddenError extends AppError{
    constructor(message = "Anda tidak memiliki akses untuk aksi ini!"){
        super(message, 403);
        this.name = "ForbiddenError"
    }
}