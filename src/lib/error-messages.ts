interface ErrorLike {
  message?: string;
  status?: number;
}

const defaultByStatus: Record<number, string> = {
  400: "Dados inválidos. Revise os campos e tente novamente.",
  401: "Sua sessão expirou. Faça login novamente.",
  403: "Você não tem permissão para essa ação.",
  404: "Recurso não encontrado.",
  429: "Muitas tentativas. Aguarde um momento e tente de novo.",
  500: "Erro interno no servidor. Tente novamente em instantes.",
};

export const getFriendlyErrorMessage = (error: ErrorLike) => {
  if (error.status && defaultByStatus[error.status]) {
    return defaultByStatus[error.status];
  }

  if (error.message && !/^Request failed/i.test(error.message)) {
    return error.message;
  }

  return "Não foi possível concluir a operação. Tente novamente.";
};
