"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  createOrganizationAction,
  checkOrganizationSlugAction,
} from "@/server/actions/organization-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "@/lib/auth-client";
import { AuthPromptDialog } from "@/components/auth/auth-prompt-dialog";
import {
  createOrganizationSchema,
  type CreateOrganizationData,
} from "@/schemas/organization";
import { generateDefaultLogo, generateSlug } from "@/lib/utils";
import { BrandedLogo } from "@/components/branding/branded-logo";
import { Loading } from "@/components/sheard/loading";
import { ColorPicker } from "@/components/ui/color-picker";

// Form-specific schema that requires primaryColor
const createOrganizationFormSchema = createOrganizationSchema.extend({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format"),
});

type CreateOrganizationForm = z.infer<typeof createOrganizationFormSchema>;

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (organization: Organization) => void;
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
  const [defaultLogo] = useState(() => generateDefaultLogo());
  const [slugEdited, setSlugEdited] = useState(false);

  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;

  const form = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
      primaryColor: "#3b82f6", // Default blue color
    },
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const debouncedSlug = useDebounce(watchedSlug, 800);

  useEffect(() => {
    if (open && !isPending && !isAuthenticated) {
      onOpenChange(false);
      setShowAuthPrompt(true);
    }
    if (!open) {
      setSlugEdited(false);
    }
  }, [open, isAuthenticated, isPending, onOpenChange]);

  useEffect(() => {
    if (watchedName && !slugEdited) {
      form.setValue("slug", generateSlug(watchedName));
    }
  }, [watchedName, slugEdited, form]);

  useEffect(() => {
    if (slugEdited && watchedSlug) {
      const normalized = generateSlug(watchedSlug);
      if (normalized !== watchedSlug) {
        form.setValue("slug", normalized);
      }
    }
  }, [watchedSlug, slugEdited, form]);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      setCheckingSlug(true);
      checkOrganizationSlugAction(debouncedSlug)
        .then((result) => {
          setSlugAvailable(
            result.success ? result.data?.available || false : false
          );
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
      const metadata: Record<string, string> = {};
      
      if (data.description) {
        metadata.description = data.description;
      }
      
      if (data.primaryColor) {
        metadata.primaryColor = data.primaryColor;
      }

      const logoUrl = data.logo || generateDefaultLogo();

      // Convert form data to action input format
      const actionInput: CreateOrganizationData = {
        name: data.name,
        slug: data.slug,
        logo: logoUrl,
        description: data.description,
        primaryColor: data.primaryColor,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };

      const result = await createOrganizationAction(actionInput);

      if (result.success && result.data) {
        onSuccess?.(result.data);
        onOpenChange(false);
        form.reset();
      } else {
        form.setError("root", {
          message: result.error || "Failed to create organization",
        });
      }
    } catch {
      form.setError("root", { message: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrandedLogo size="sm" helpOrbit />
              Create Organization
            </DialogTitle>
            <DialogDescription>
              Create a new organization to manage your team and projects.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarImage
                      src={form.watch("logo") || defaultLogo}
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              onChange={(e) => {
                                setSlugEdited(true);
                                field.onChange(e.target.value);
                              }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {checkingSlug && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                              {slugAvailable === true && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                              {slugAvailable === false && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    form.setValue("slug", "");
                                    setSlugEdited(false);
                                    setSlugAvailable(null);
                                  }}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </button>
                              )}
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
                </div>

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
                        URL to your organization&apos;s logo image. If left empty, a
                        colorful logo with initials will be generated
                        automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                  {isSubmitting && (
                    <Loading color="white" />
                  )}
                  Create Organization
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        action="create-organization"
      />
    </>
  );
}
