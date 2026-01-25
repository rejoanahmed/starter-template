"use client";

import { Button } from "@starter/ui/components/button";
import { Input } from "@starter/ui/components/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@starter/ui/components/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@web/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export function NoOrgShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: orgs = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await authClient.organization?.list?.();
      return res?.data ?? [];
    },
    enabled: !!session?.user,
  });

  const createOrg = useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      const res = await authClient.organization?.create?.({
        name,
        slug,
        keepCurrentActiveOrganization: false,
      });
      if (res?.error)
        throw new Error(res.error.message ?? "Failed to create organization");
      return res?.data as { id: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setCreateOpen(false);
      router.navigate({ to: "/org/$orgId", params: { orgId: data.id } });
      toast.success("Organization created");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Failed to create"),
  });

  const handleSelectOrg = async (id: string) => {
    await authClient.organization?.setActive?.({ organizationId: id });
    router.navigate({ to: "/org/$orgId", params: { orgId: id } });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="border-b p-2">
          <span className="text-muted-foreground truncate px-2 text-sm font-medium">
            Organizations
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Select or create</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(orgs as { id: string; name: string }[])?.map((org) => (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton
                      className="cursor-pointer"
                      onClick={() => handleSelectOrg(org.id)}
                    >
                      {org.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <CreateOrgForm
                    isPending={createOrg.isPending}
                    onOpenChange={setCreateOpen}
                    onSubmit={(name, slug) =>
                      createOrg.mutate({ name, slug })
                    }
                    open={createOpen}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <span className="text-muted-foreground text-sm">
            No organization selected
          </span>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function CreateOrgForm({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, slug: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const slugFromName = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const sl = slug.trim() || slugFromName(n);
    if (!n) return;
    onSubmit(n, sl || slugFromName(n));
  };

  if (!open) {
    return (
      <SidebarMenuButton
        className="cursor-pointer"
        onClick={() => onOpenChange(true)}
      >
        + Create organization
      </SidebarMenuButton>
    );
  }

  return (
    <div className="space-y-2 px-2">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <Input
          autoFocus
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugFromName(e.target.value));
          }}
          placeholder="Name"
          value={name}
        />
        <Input
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          value={slug}
        />
        <div className="flex gap-1">
          <Button disabled={isPending} size="sm" type="submit">
            {isPending ? "Creating…" : "Create"}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
