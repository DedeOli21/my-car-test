import { ApiError } from "@/lib/http-client";

export const toAppError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Erro inesperado.",
  };
};
