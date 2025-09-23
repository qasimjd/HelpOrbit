"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  Building, 
  Trash2, 
  Save,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  updateOrganizationAction, 
  deleteOrganizationAction,
  checkOrganizationSlugAction 
} from "@/server/actions/organization-actions";
import type { OrganizationData, MemberRole } from "@/types/auth-organization";

const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Organization slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), "Slug cannot start or end with hyphens"),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description too long").optional(),
});

type UpdateOrganizationForm = z.infer<typeof updateOrganizationSchema>;

interface OrganizationSettingsProps {
  organization: OrganizationData;
  currentUserRole: MemberRole;
  onUpdate?: (organization: OrganizationData) => void;
  onDelete?: () => void;
}

export function OrganizationSettings({ 
  organization, 
  currentUserRole, 
  onUpdate, 
  onDelete 
}: OrganizationSettingsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const canUpdateOrganization = currentUserRole === "owner" || currentUserRole === "admin";
  const canDeleteOrganization = currentUserRole === "owner";

  const form = useForm<UpdateOrganizationForm>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo || "",
      description: (organization.metadata as any)?.description || "",
    },
  });

  const watchedSlug = form.watch("slug");
  const debouncedSlug = useDebounce(watchedSlug, 500);

  React.useEffect(() => {
    if (debouncedSlug && debouncedSlug !== organization.slug && debouncedSlug.length >= 3) {
      setCheckingSlug(true);
      checkOrganizationSlugAction(debouncedSlug)
        .then((result) => {
          setSlugAvailable(result.success ? result.data?.available || false : false);
        })
        .catch(() => setSlugAvailable(false))
        .finally(() => setCheckingSlug(false));
    } else if (debouncedSlug === organization.slug) {
      setSlugAvailable(true);
    } else {
      setSlugAvailable(null);
    }
  }, [debouncedSlug, organization.slug]);

  const onSubmit = async (data: UpdateOrganizationForm) => {
    if (!canUpdateOrganization) return;

    setIsSubmitting(true);
    try {
      const metadata = data.description ? { description: data.description } : undefined;
      const result = await updateOrganizationAction({
        id: organization.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo || undefined,
        metadata,
      });

      if (result.success && result.data) {
        onUpdate?.(result.data);
        toast({
          title: "Success",
          description: "Organization updated successfully",
        });
      } else {
        form.setError("root", {
          message: result.error || "Failed to update organization",
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

  const handleDelete = async () => {
    if (!canDeleteOrganization) return;

    setIsDeleting(true);
    try {
      const result = await deleteOrganizationAction(organization.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization deleted successfully",
        });
        onDelete?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete organization",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
    if (!watchedSlug || watchedSlug === organization.slug) return null;
    if (checkingSlug) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (slugAvailable === true) return <span className="text-green-600 text-sm">Available</span>;
    if (slugAvailable === false) return <span className="text-red-600 text-sm">Taken</span>;
    return null;
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Manage your organization's basic information and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Organization Preview */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={form.watch("logo")} />
                    <AvatarFallback className="text-lg">
                      {form.watch("name") ? getInitials(form.watch("name")) : <Building className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold truncate">
                      {form.watch("name") || "Organization Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      @{form.watch("slug") || "organization-slug"}
                    </p>
                    {form.watch("description") && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {form.watch("description")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter organization name"
                            {...field}
                            disabled={isSubmitting || !canUpdateOrganization}
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
                        <FormLabel>Organization Slug</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="organization-slug"
                              {...field}
                              disabled={isSubmitting || !canUpdateOrganization}
                            />
                            {slugStatus()}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Used in URLs and must be unique
                        </FormDescription>
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
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                          disabled={isSubmitting || !canUpdateOrganization}
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your organization..."
                          rows={3}
                          {...field}
                          disabled={isSubmitting || !canUpdateOrganization}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {form.formState.errors.root.message}
                  </div>
                )}

                {canUpdateOrganization && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-brand-primary hover:bg-brand-primary/90"
                      disabled={isSubmitting || (slugAvailable === false && watchedSlug !== organization.slug)}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {canDeleteOrganization && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-900">Delete Organization</h4>
                  <p className="text-sm text-red-600">
                    Permanently delete this organization and all of its data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete <strong>{organization.name}</strong>?
              <br />
              <br />
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All organization data</li>
                <li>All members and their roles</li>
                <li>All pending invitations</li>
                <li>All associated projects and tickets</li>
              </ul>
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}