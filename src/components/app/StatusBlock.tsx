import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusBlockProps {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

const StatusBlock = ({
  title,
  description,
  retryLabel = "Tentar novamente",
  onRetry,
  isLoading = false,
}: StatusBlockProps) => {
  return (
    <div className="rounded-lg border border-border p-6 bg-card text-center space-y-3">
      <div className="flex justify-center">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : (
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default StatusBlock;
