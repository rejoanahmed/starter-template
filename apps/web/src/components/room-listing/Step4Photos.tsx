"use client";

import { useStore } from "@tanstack/react-form";
import { withFieldGroup } from "@web/components/form";
import { Button } from "@web/components/ui/button";
import { Label } from "@web/components/ui/label";
import { Upload, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

type Step4Fields = {
  photos: Array<{
    file: File;
    preview: string;
    id: string;
  }>;
  coverId: string;
};

const defaultValues: Step4Fields = {
  photos: [],
  coverId: "",
};

const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

export const Step4Photos = withFieldGroup({
  defaultValues,
  props: {
    onNext: () => {},
    onBack: () => {},
  },
  render({ group, onNext, onBack }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photos = useStore(group.store, (state) => state.values.photos || []);
    const coverId = useStore(group.store, (state) => state.values.coverId);

    const canProceed = photos.length >= 5 && coverId;

    const handleFileSelect = useCallback(
      async (files: FileList | null) => {
        if (!files) return;

        const validFiles = Array.from(files).filter(
          (file) =>
            file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== files.length) {
          toast.error("Some files were invalid or too large (max 5MB)");
        }

        const newPhotos = [];

        for (const file of validFiles) {
          const preview = await createImagePreview(file);
          newPhotos.push({
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview,
          });
        }

        const currentPhotos = photos;
        group.setFieldValue("photos", [...currentPhotos, ...newPhotos]);
      },
      [photos, group]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleFileSelect(files);
      },
      [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
    }, []);

    const removePhoto = (photoId: string) => {
      const updatedPhotos = photos.filter((p) => p.id !== photoId);
      group.setFieldValue("photos", updatedPhotos);

      if (coverId === photoId) {
        group.setFieldValue("coverId", updatedPhotos[0]?.id || "");
      }
    };

    const setCover = (photoId: string) => {
      group.setFieldValue("coverId", photoId);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-500 mb-2">Step 4</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Photos
          </h1>
          <p className="text-lg text-gray-600">
            Upload at least 5 high-quality photos of your space. The first photo
            you select as cover will be the main image.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Photos (Minimum 5)</Label>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop or click to select. Maximum file size: 5MB.
              Supported formats: JPG, PNG, WebP.
            </p>

            <button
              className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              type="button"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP up to 5MB each
              </p>
              <input
                accept="image/*"
                className="hidden"
                data-testid="photo-upload"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                ref={fileInputRef}
                type="file"
              />
            </button>

            {photos.length < 5 && (
              <p
                className="text-sm text-amber-600 mt-2"
                data-testid="photo-error"
              >
                Add {5 - photos.length} more photo
                {5 - photos.length !== 1 ? "s" : ""} to continue
              </p>
            )}
          </div>

          {photos.length > 0 && (
            <div>
              <Label>Uploaded Photos ({photos.length}/10)</Label>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div className="relative group" key={photo.id}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <div
                        aria-label="Room preview"
                        className="w-full h-full"
                        role="img"
                        style={{
                          backgroundImage: `url(${photo.preview})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        className="p-1 h-8 w-8"
                        onClick={() => removePhoto(photo.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="absolute bottom-2 left-2">
                      <Button
                        className="text-xs"
                        onClick={() => setCover(photo.id)}
                        size="sm"
                        variant={photo.id === coverId ? "default" : "outline"}
                      >
                        {photo.id === coverId ? "Cover" : "Set Cover"}
                      </Button>
                    </div>

                    {photo.id === coverId && (
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button disabled={!canProceed} onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  },
});
