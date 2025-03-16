"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Plus,
  Search,
  KeyRound,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { format } from "date-fns";

type Permission = {
  id: string;
  name: string;
  createdAt?: string;
  roles?: {
    id: string;
    name: string;
  }[];
};

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permission"],
    queryFn: async () => {
      const response = await api.get("/permission");
      return response.data?.data || [];
    },
  });

  // Optional: Get detailed permission info with associated roles
  const { data: permissionDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["permission", selectedPermission?.id],
    queryFn: async () => {
      if (!selectedPermission?.id) return null;
      const response = await api.get(`/permission/${selectedPermission.id}`);
      return response.data?.data;
    },
    enabled: !!selectedPermission?.id && isViewDialogOpen,
  });

  const createPermissionMutation = useMutation({
    mutationFn: async (name: string) => {
      return await api.post("/permission", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission"] });
      toast({
        title: "Permission created",
        description: "The permission has been created successfully",
      });
      setNewPermission("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating permission",
        description: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/permission/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission"] });
      toast({
        title: "Permission deleted",
        description: "The permission has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPermission(null);
      // If view dialog is open, close it
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting permission",
        description: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPermission.trim()) {
      createPermissionMutation.mutate(newPermission);
    }
  };

  const handleViewPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (permission: Permission, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click events
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePermission = () => {
    if (!selectedPermission) return;
    deletePermissionMutation.mutate(selectedPermission.id);
  };

  const filteredPermissions = permissions
    ? permissions.filter((permission: Permission) =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">Manage system permissions</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Permissions</CardTitle>
            <CardDescription>
              Create and manage permissions in the system
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreatePermission}>
                <DialogHeader>
                  <DialogTitle>Create New Permission</DialogTitle>
                  <DialogDescription>
                    Add a new permission to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Permission Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., MANAGE_USERS"
                      value={newPermission}
                      onChange={(e) => setNewPermission(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPermissionMutation.isPending}
                  >
                    {createPermissionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length > 0 ? (
                    filteredPermissions.map((permission: Permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permission.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPermission(permission)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteClick(permission, e)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No permissions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Permission Details</DialogTitle>
            <DialogDescription>
              View information about this permission
            </DialogDescription>
          </DialogHeader>

          {selectedPermission ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {selectedPermission.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPermission.createdAt
                      ? `Created on ${format(
                          new Date(selectedPermission.createdAt),
                          "PPP"
                        )}`
                      : "Creation date unavailable"}
                  </p>
                </div>
              </div>

              <Separator />

              {detailsLoading ? (
                <div className="py-4 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium mb-2">Used in Roles</h4>
                  {permissionDetails?.roles &&
                  permissionDetails.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {permissionDetails.roles.map(
                        (role: { id: string; name: string }) => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className="capitalize"
                          >
                            {role.name}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not assigned to any roles
                    </p>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <div>
                  {permissionDetails?.roles && (
                    <Badge variant="outline">
                      {permissionDetails.roles.length} Role
                      {permissionDetails.roles.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Permission Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Permission
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPermission ? (
                <>
                  Are you sure you want to delete the{" "}
                  <strong>{selectedPermission.name}</strong> permission?
                  {permissionDetails?.roles &&
                    permissionDetails.roles.length > 0 && (
                      <p className="mt-2 text-destructive">
                        Warning: This permission is used in{" "}
                        {permissionDetails.roles.length} role(s). Deleting it
                        will remove it from these roles.
                      </p>
                    )}
                </>
              ) : (
                "Are you sure you want to delete this permission? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePermissionMutation.isPending}
            >
              {deletePermissionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
