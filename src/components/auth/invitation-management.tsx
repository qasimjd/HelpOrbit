"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  RefreshCw,
  Trash2,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  inviteMemberAction,
  listInvitationsAction,
  cancelInvitationAction,
  resendInvitationAction,
} from "@/server/actions/invitation-actions";
import type { InvitationData, MemberRole } from "@/types/auth-organization";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "guest"]),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess?: () => void;
}

interface InvitationManagementProps {
  organizationId: string;
  currentUserRole: MemberRole;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  accepted: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

const statusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

function InviteMemberDialog({ open, onOpenChange, organizationId, onSuccess }: InviteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true);
    try {
      const result = await inviteMemberAction({
        organizationId,
        email: data.email,
        role: data.role,
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${data.email}`,
        });
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        form.setError("root", {
          message: result.error || "Failed to send invitation",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
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
                      placeholder="Enter email address"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function InvitationManagement({ 
  organizationId, 
  currentUserRole 
}: InvitationManagementProps) {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const result = await listInvitationsAction(organizationId);
      if (result.success && result.data) {
        setInvitations(result.data.invitations);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [organizationId]);

  const canManageInvitations = currentUserRole === "owner" || currentUserRole === "admin";

  const handleCancelInvitation = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const result = await cancelInvitationAction(invitationId);
      if (result.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast({
          title: "Success",
          description: "Invitation cancelled",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const result = await resendInvitationAction(invitationId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Invitation resent",
        });
        loadInvitations(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitations ({invitations.length})
            </CardTitle>
            {canManageInvitations && (
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Invitation
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const StatusIcon = statusIcons[invitation.status];
                  const isExpired = new Date(invitation.expiresAt) < new Date();
                  const isProcessing = processingId === invitation.id;

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[invitation.status]} flex items-center gap-1 w-fit`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {invitation.status}
                          {isExpired && invitation.status === "pending" && " (Expired)"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {canManageInvitations && invitation.status === "pending" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isProcessing}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleResendInvitation(invitation.id)}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Resend
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleCancelInvitation(invitation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {invitations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invitations sent yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organizationId={organizationId}
        onSuccess={() => {
          loadInvitations();
        }}
      />
    </>
  );
}