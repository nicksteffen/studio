"use client";

import { useState, ChangeEvent, useEffect } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import { deleteListFile, uploadListFile } from "@/app/my-list/actions";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileType: "photo" | "video";
  itemId: string;
  currentUrl?: string;
}

export function FileUploadDialog({
  isOpen,
  onClose,
  fileType,
  itemId,
  currentUrl,
}: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMessage(null);
    }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    let bucket: string;
    let field: string;
    if (fileType === "photo") {
      bucket = "list-photos";
      field = "photo_url";
    } else {
      bucket = "list-videos";
      field = "video_url";
    }

    formData.append("bucket", bucket);
    formData.append("field", field);

    try {
      const result = await uploadListFile(formData);
      if (result.error) {
        setMessage(result.message);
      } else {
        setMessage(result.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage("An unexpected error occurred.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const result = await deleteListFile(itemId, fileType);
      if (result.error) {
        setMessage(result.message);
      } else {
        setMessage(result.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage("An unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload {fileType}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {currentUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium">Current Media:</p>
              {fileType === "photo" ? (
                <Image
                  src={currentUrl}
                  alt={`Current ${fileType}`}
                  width={200}
                  height={200}
                  className="mt-2 rounded-md object-cover"
                />
              ) : (
                <video
                  src={currentUrl}
                  controls
                  className="mt-2 rounded-md w-full"
                />
              )}
            </div>
          )}
          <Input type="file" onChange={handleFileChange} />
          {message && (
            <p
              className={`text-sm ${message.includes("successful") ? "text-green-500" : "text-red-500"}`}
            >
              {message}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {currentUrl && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={uploading || deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
