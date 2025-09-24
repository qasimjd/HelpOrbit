"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createOrganizationAction, checkOrganizationSlugAction } from "@/server/actions/organization-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "@/lib/auth-client";
import { AuthPromptDialog } from "@/components/auth/auth-prompt-dialog";
import { createOrganizationSchema, type CreateOrganizationData } from "@/schemas/organization";

type CreateOrganizationForm = CreateOrganizationData;

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (organization: any) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Check if user is authenticated
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;

  const form = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
    },
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const debouncedSlug = useDebounce(watchedSlug, 500);

  // Handle dialog opening - check authentication first
  useEffect(() => {
    if (open && !isPending) {
      if (!isAuthenticated) {
        // Close the create dialog and show auth prompt
        onOpenChange(false);
        setShowAuthPrompt(true);
        return;
      }
    }
  }, [open, isAuthenticated, isPending, onOpenChange]);

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !watchedSlug) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
      form.setValue("slug", generatedSlug);
    }
  }, [watchedName, watchedSlug, form]);

  // Check slug availability
  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      setCheckingSlug(true);
      checkOrganizationSlugAction(debouncedSlug)
        .then((result) => {
          setSlugAvailable(result.success ? result.data?.available || false : false);
        })
        .catch(() => setSlugAvailable(false))
        .finally(() => setCheckingSlug(false));
    } else {
      setSlugAvailable(null);
    }
  }, [debouncedSlug]);

  const onSubmit = async (data: CreateOrganizationForm) => {
    setIsSubmitting(true);
    try {
      const metadata = data.description ? { description: data.description } : undefined;
      const result = await createOrganizationAction({
        name: data.name,
        slug: data.slug,
        logo: data.logo || undefined,
        metadata,
      });

      if (result.success && result.data) {
        onSuccess?.(result.data);
        onOpenChange(false);
        form.reset();
      } else {
        form.setError("root", {
          message: result.error || "Failed to create organization",
        });
      }
    } catch (error) {
      form.setError("root", {
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const slugStatus = () => {
    if (!watchedSlug) return null;
    if (checkingSlug) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (slugAvailable === true) return <Check className="h-4 w-4 text-green-600" />;
    if (slugAvailable === false) return <X className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Create Organization
            </DialogTitle>
            <DialogDescription>
              Create a new organization to manage your team and projects.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Organization Preview */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={form.watch("logo")} />
                  <AvatarFallback>
                    {watchedName ? getInitials(watchedName) : <Building className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {watchedName || "Organization Name"}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    @{watchedSlug || "organization-slug"}
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter organization name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      The display name for your organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Slug *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="organization-slug"
                          {...field}
                          disabled={isSubmitting}
                          className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {slugStatus()}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
                    </FormDescription>
                    {slugAvailable === false && (
                      <div className="text-sm text-red-600">
                        This slug is already taken
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your organization's logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your organization..."
                        rows={3}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || slugAvailable === false}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {/* Authentication Prompt Dialog */}
    <AuthPromptDialog
      open={showAuthPrompt}
      onOpenChange={setShowAuthPrompt}
      action="create-organization"
    />
    </>
  );
}