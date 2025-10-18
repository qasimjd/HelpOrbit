"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MoreVertical,
  RefreshCw,
  Trash2,
  RotateCcw,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listInvitationsAction,
  cancelInvitationAction,
  resendInvitationAction,
} from "@/server/actions/invitation-actions";
import type { InvitationData } from "@/types/auth-organization";
import { getUserRoleColor, userRoleIcons, getInvitationStatusIcon, cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDate } from "@/lib/ticket-utils";

interface InvitationPermissions {
  canManageInvitations: boolean;
  canCancelInvitations: boolean;
}

interface InvitationManagementProps {
  organizationId: string;
  initialData?: InvitationData[];
  initialPermissions?: InvitationPermissions;
}

const DEFAULT_PERMISSIONS = {
  canManageInvitations: false,
  canCancelInvitations: false,
};



export function InvitationManagement({
  organizationId,
  initialData = [],
  initialPermissions
}: InvitationManagementProps) {
  const [invitations, setInvitations] = useState<InvitationData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<InvitationData | null>(null);

  const permissions = initialPermissions || DEFAULT_PERMISSIONS;

  const refreshInvitations = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const result = await listInvitationsAction({
        organizationId,
        sortDirection: 'desc'
      });

      if (result.success && result.data) {
        setInvitations(result.data.invitations);
      } else {
        throw new Error(result.error || "Failed to load invitations");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (initialData.length === 0) {
      refreshInvitations();
    }
  }, [organizationId, initialData.length, refreshInvitations]);


  const handleCancelInvitation = async () => {
    if (!invitationToCancel || !permissions.canCancelInvitations) return;

    try {
      const result = await cancelInvitationAction(invitationToCancel.id);
      if (result.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationToCancel.id));
        toast.success("Invitation canceled successfully");
      } else {
        throw new Error(result.error || "Failed to cancel invitation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    } finally {
      setInvitationToCancel(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const result = await resendInvitationAction(invitationId);
      if (result.success) {
        toast.success("Invitation resent successfully");
        refreshInvitations();
      } else {
        throw new Error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusInfo = (invitation: InvitationData) => {
    const isExpired = new Date(invitation.expiresAt) < new Date();
    const { icon: StatusIcon, colorClass } = getInvitationStatusIcon(invitation.status);

    return {
      isExpired,
      StatusIcon,
      colorClass,
      statusText: invitation.status === "pending" && isExpired ? "expired" : invitation.status
    };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
              {invitations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {invitations.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshInvitations}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && initialData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No pending invitations</h3>
              <p className="text-sm text-muted-foreground">
                Invitations will appear here once they are sent.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const { isExpired, StatusIcon, colorClass, statusText } = getStatusInfo(invitation);
                const isProcessing = processingId === invitation.id;
                const RoleIcon = userRoleIcons[invitation.role];

                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                              invitation.status === "pending" && isExpired
                                ? "border-destructive bg-destructive/10"
                                : invitation.status === "accepted"
                                  ? "border-green-400 bg-green-50"
                                  : "border-muted bg-muted"
                            )}
                          >
                            <Mail className="h-5 w-5"  />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{invitation.email}</p>
                            <Badge
                              className={`${getUserRoleColor(invitation.role)} flex items-center gap-1`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              {invitation.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-3 w-3 ${colorClass}`} />
                              <span className={`capitalize ${isExpired ? 'text-destructive' : ''}`}>
                                {statusText}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Sent {formatDate(invitation.createdAt)}
                              </span>
                            </div>
                            <span>
                              Expires {formatDate(invitation.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {permissions.canCancelInvitations && invitation.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                          disabled={isProcessing}
                          className="h-8 text-xs"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Resend
                            </>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setInvitationToCancel(invitation)}
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                              Cancel invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Invitation Dialog */}
      <AlertDialog
        open={!!invitationToCancel}
        onOpenChange={(open) => !open && setInvitationToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation sent to{" "}
              <span className="font-medium">{invitationToCancel?.email}</span>.
              They will no longer be able to join using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cancel invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}