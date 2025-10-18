"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UserPlus, 
  Mail, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction } from "@/server/actions/invitation-actions";
// import { revalidateMemberData } from "@/server/actions/revalidate-actions";
import { userRoleIcons } from "@/lib/utils";
import { toast } from "sonner";
import type { MemberRole } from "@/types/auth-organization";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "guest"]),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

const ROLE_OPTIONS: { value: MemberRole; label: string; description: string }[] = [
  { value: "guest", label: "Guest", description: "View only access" },
  { value: "member", label: "Member", description: "Standard access" },
  { value: "admin", label: "Admin", description: "Full management access" },
  { value: "owner", label: "Owner", description: "Complete control" },
];

interface InviteMemberButtonProps {
  organizationId: string;
  onSuccess?: () => void;
  canInviteMembers?: boolean;
}

export function InviteMemberButton({
  organizationId,
  onSuccess,
  canInviteMembers = true
}: InviteMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!organizationId) return;

    setIsSubmitting(true);
    try {
      const result = await inviteMemberAction({
        organizationId,
        email: data.email,
        role: data.role,
      });

      if (result.success) {
        toast.success(`${data.email} will receive an invitation to join as ${data.role}`);
        
        // Revalidate cached data to update UI
        // await revalidateMemberData(organizationId);
        
        form.reset();
        onSuccess?.();
        setOpen(false);
      } else {
        throw new Error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canInviteMembers) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 btn-brand-primary">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="member@company.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((roleOption) => {
                          const RoleIcon = userRoleIcons[roleOption.value];
                          return (
                            <SelectItem key={roleOption.value} value={roleOption.value}>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{roleOption.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {roleOption.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}