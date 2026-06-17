import { z } from "zod";
import { nfeTypeOptions } from "@/lib/fiscal-options";

const enumValues = <T extends string>(options: Array<{ value: T }>) =>
  options.map((option) => option.value) as [T, ...T[]];

const requiredString = (message: string) => z.string().trim().min(1, message);

export const cartaCorrecaoSchema = z.object({
  correcao: requiredString("Informe a correção.")
    .min(15, "A correção deve ter ao menos 15 caracteres.")
    .max(1000, "A correção deve ter no máximo 1000 caracteres."),
});

export const importarNFeSchema = z
  .object({
    chaveAcesso: z.string().trim().optional(),
    xmlFile: z.any().optional(),
    tipo: z.enum(enumValues(nfeTypeOptions)),
    valorProdutos: z.coerce.number().min(0, "Informe um valor válido.").optional(),
    freteId: z.string().optional(),
  })
  .refine(
    (value) => {
      const hasKey = Boolean(value.chaveAcesso?.trim());
      const hasXml =
        typeof FileList !== "undefined" &&
        value.xmlFile instanceof FileList &&
        value.xmlFile.length > 0;

      return hasKey || hasXml;
    },
    {
      message: "Informe a chave de acesso ou envie o XML.",
      path: ["chaveAcesso"],
    }
  )
  .refine((value) => !value.chaveAcesso || /^\d{44}$/.test(value.chaveAcesso), {
    message: "A chave de acesso deve conter 44 dígitos.",
    path: ["chaveAcesso"],
  });

export const fiscalLinkSchema = z.object({
  freteId: requiredString("Selecione o frete."),
  cteId: z.string().optional(),
  mdfeId: z.string().optional(),
  nfeIds: z.array(z.string()),
});

export type CartaCorrecaoFormValues = z.infer<typeof cartaCorrecaoSchema>;
export type ImportarNFeFormValues = z.infer<typeof importarNFeSchema>;
export type FiscalLinkFormValues = z.infer<typeof fiscalLinkSchema>;
