import { notFound } from "next/navigation";
import { TenantEditor } from "@/components/admin/tenant-editor";
import {
  organizations,
  getOrganization,
  getRegion,
  getTenantContacts,
} from "@/lib/mock-admin";

export function generateStaticParams() {
  return organizations.map((o) => ({ id: o.tenantId }));
}

export default async function EditarTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = getOrganization(id);
  if (!organization) notFound();

  const region = getRegion(organization.regionId);
  const contacts = getTenantContacts(organization.tenantId);

  return (
    <TenantEditor
      organization={organization}
      region={region}
      initialContacts={contacts}
    />
  );
}
