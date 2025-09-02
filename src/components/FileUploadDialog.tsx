"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
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
import { FaPlus } from "react-icons/fa";
import { cn } from "@/lib/utils";

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
  const [isHovering, setIsHovering] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      setFile(null);
      setLoadingMedia(true);
      const timer = setTimeout(() => setLoadingMedia(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setMessage(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHovering(false);
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

  const isActionInProgress = uploading || deleting;
  const canDelete = !isActionInProgress && !!currentUrl;
  const showUploadButton = !currentUrl && !!file && !isActionInProgress;
  const showUpdateButton = !!currentUrl && !!file && !isActionInProgress;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentUrl ? `Manage ${fileType}` : `Upload ${fileType}`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loadingMedia && currentUrl ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading media...</p>
            </div>
          ) : currentUrl ? (
            <div className="mb-4">
              <p className="text-sm font-medium text-center">Current Media:</p>
              <div
                className="mt-2 rounded-md overflow-hidden mx-auto"
                style={{ width: 200, height: 200 }}
              >
                {fileType === "photo" ? (
                  <Image
                    src={currentUrl}
                    alt={`Current ${fileType}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <video src={currentUrl} controls className="w-full h-full" />
                )}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors relative",
                isHovering
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FaPlus className="h-6 w-6 text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                Drag and drop your file here, or{" "}
                <label className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                  click to select.
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
            </div>
          )}

          {file && (
            <p className="text-center text-sm text-green-500">
              File selected: {file.name}
            </p>
          )}

          {message && (
            <p
              className={`text-sm text-center ${message.includes("successful") ? "text-green-500" : "text-red-500"}`}
            >
              {message}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isActionInProgress}
          >
            Cancel
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isActionInProgress}
          >
            Select File
          </Button>

          {showUploadButton && (
            <Button onClick={handleUpload} disabled={isActionInProgress}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}

          {showUpdateButton && (
            <Button onClick={handleUpload} disabled={isActionInProgress}>
              {uploading ? "Updating..." : "Update"}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
