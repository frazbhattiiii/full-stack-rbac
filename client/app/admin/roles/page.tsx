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
  Shield,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type Role = {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt?: string;
};

type Permission = {
  id: string;
  name: string;
};

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "user" | "owner">("user");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      const response = await api.get("/role");
      console.log(response.data?.data);
      return response.data?.data || [];
    },
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permission"],
    queryFn: async () => {
      const response = await api.get("/permission");
      return response.data?.data || [];
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; permissionsId: string[] }) => {
      return await api.post("/role", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
      toast({
        title: "Role created",
        description: "The role has been created successfully",
      });
      setNewRole("user");
      setSelectedPermissions([]);
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating role",
        description: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/role/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      // If view dialog is open, close it
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting role",
        description: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate({
      name: newRole,
      permissionsId: selectedPermissions,
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId)
      );
    }
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click events
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    deleteRoleMutation.mutate(selectedRole.id);
  };

  const filteredRoles = roles
    ? roles.filter((role: Role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <p className="text-muted-foreground">
          Manage system roles and their permissions
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>
              Create and manage roles in the system
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateRole}>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role-type">Role Type</Label>
                    <Select
                      value={newRole}
                      onValueChange={(value: "admin" | "user" | "owner") =>
                        setNewRole(value)
                      }
                    >
                      <SelectTrigger id="role-type">
                        <SelectValue placeholder="Select role type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                      {permissionsLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      ) : permissions && permissions.length > 0 ? (
                        permissions.map((permission: Permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissions.includes(
                                permission.id
                              )}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission.id,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-normal"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No permissions available
                        </p>
                      )}
                    </div>
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
                  <Button type="submit" disabled={createRoleMutation.isPending}>
                    {createRoleMutation.isPending ? (
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
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {rolesLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role: Role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium capitalize">
                          {role.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions && role.permissions.length > 0 ? (
                              role.permissions
                                .slice(0, 3)
                                .map((permission: Permission) => (
                                  <span
                                    key={permission.id}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                  >
                                    {permission.name}
                                  </span>
                                ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No permissions
                              </span>
                            )}
                            {role.permissions &&
                              role.permissions.length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                  +{role.permissions.length - 3} more
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRole(role)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteClick(role, e)}
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
                      <TableCell colSpan={3} className="h-24 text-center">
                        No roles found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
            <DialogDescription>
              View information about this role and its permissions
            </DialogDescription>
          </DialogHeader>

          {selectedRole ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg capitalize">
                    {selectedRole.name} Role
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.createdAt
                      ? `Created on ${format(
                          new Date(selectedRole.createdAt),
                          "PPP"
                        )}`
                      : "Creation date unavailable"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Permissions</h4>
                {selectedRole.permissions &&
                selectedRole.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedRole.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center p-2 rounded-md border"
                      >
                        <div className="mr-2 h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned to this role
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between">
                <div>
                  <Badge variant="outline" className="capitalize">
                    {selectedRole.permissions?.length || 0} Permission
                    {selectedRole.permissions?.length !== 1 ? "s" : ""}
                  </Badge>
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

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole ? (
                <>
                  Are you sure you want to delete the{" "}
                  <strong className="capitalize">{selectedRole.name}</strong>{" "}
                  role? This action cannot be undone and will remove all
                  associated permissions.
                </>
              ) : (
                "Are you sure you want to delete this role? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending ? (
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
