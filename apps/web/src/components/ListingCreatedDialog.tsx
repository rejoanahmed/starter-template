import { Button } from "@web/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@web/components/ui/dialog";
import type { Room } from "@web/services/rooms";
import { CheckCircle2, ExternalLink } from "lucide-react";

type ListingCreatedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  onStripeConnect: () => void;
};

export function ListingCreatedDialog({
  open,
  onOpenChange,
  room,
  onStripeConnect,
}: ListingCreatedDialogProps) {
  const handleClose = () => {
    setTimeout(() => {
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Listing submitted successfully!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your room listing "{room.title}" has been submitted for
                approval. We will review your listing and notify you once it's
                approved.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-2xl">ⓘ</div>
              <div className="flex-1">
                <div className="font-semibold text-blue-900 mb-1">
                  Your listing is currently pending approval
                </div>
                <p className="text-sm text-blue-800">
                  We manually review all listings to ensure quality and
                  compliance. This typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 text-2xl">💰</div>
              <div className="flex-1">
                <div className="font-semibold text-amber-900 mb-1">
                  Set up Stripe Connect to receive payments
                </div>
                <p className="text-sm text-amber-800 mb-3">
                  To accept payments for your room listing, you need to connect
                  your Stripe account. This allows you to receive payouts
                  directly to your bank account.
                </p>
                <Button
                  className="w-full"
                  onClick={onStripeConnect}
                  variant="default"
                >
                  <ExternalLink className="mr-2 size-4" />
                  Start Stripe Connect onboarding
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span>We've sent an email notification to our team</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span>You can manage your listings from your host dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span>
                Edit or update your listing anytime from the listings page
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
