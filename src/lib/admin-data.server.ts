import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface AdminUserDoc {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  purchases: string[];
  createdAt: string;
  updatedAt: string;
  password?: string;
}

export interface AdminMediaDoc {
  id: string;
  title: string;
  url: string;
  type: "image" | "video" | "gif" | "sticker" | "icon";
  tags: string;
  attribution: string;
  createdAt: string;
  updatedAt: string;
  storage_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
}

/**
 * ADMIN USERS
 */

export async function listAdminUsers(): Promise<AdminUserDoc[]> {
  // Fetch profiles and roles
  const [{ data: profiles, error }, { data: roles, error: rolesError }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, name, created_at, updated_at"),
    supabaseAdmin.from("user_roles").select("user_id, role"),
  ]);

  if (error) {
    console.error("Error listing admin users:", error);
    throw new Error(`Database error fetching profiles: ${error.message}`);
  }
  if (rolesError) throw new Error(`Database error fetching roles: ${rolesError.message}`);
  const roleMap = new Map((roles || []).map((role) => [role.user_id, role.role]));

  // Fetch all purchases to derive purchase counts per user
  const { data: allPurchases, error: purchaseError } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id");

  if (purchaseError) {
    console.error("Error fetching purchases for user list:", purchaseError);
    throw new Error(`Database error fetching purchases: ${purchaseError.message}`);
  }

  const purchasesMap = new Map<string, string[]>();
  (allPurchases || []).forEach((p) => {
    const list = purchasesMap.get(p.user_id) || [];
    list.push(p.id);
    purchasesMap.set(p.user_id, list);
  });

  // We also need emails from auth.users (requires service role)
  let users: Array<{ id: string; email?: string }> = [];
  try {
    const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    users = data.users || [];
  } catch (authError: unknown) {
    console.error("Error fetching auth users:", authError);
    const message = authError instanceof Error ? authError.message : String(authError);
    throw new Error(`Auth error listing users: ${message}`);
  }

  const emailMap = new Map(users.map((u) => [u.id, u.email || ""]));

  return (profiles || []).map((p) => {
    const role = roleMap.get(p.id) === "admin" ? "admin" : "user";
    const purchases = purchasesMap.get(p.id) || [];

    return {
      id: p.id,
      name: p.name || "Anonymous",
      email: emailMap.get(p.id) || "",
      role,
      purchases,
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
    };
  });
}

export async function createAdminUser(body: Partial<AdminUserDoc>) {
  if (!body.email) throw new Error("Email is required");
  if (!body.password || body.password.length < 8) {
    throw new Error("A temporary password of at least 8 characters is required");
  }

  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.name || "" },
  });

  if (error) throw error;

  if (body.role) {
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      {
        user_id: user.user.id,
        role: body.role,
      },
      { onConflict: "user_id,role" },
    );
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(user.user.id);
      throw roleError;
    }
  }

  return {
    id: user.user.id,
    email: user.user.email || body.email,
    name: body.name || "",
    role: body.role || "user",
    purchases: [],
    createdAt: user.user.created_at,
    updatedAt: user.user.created_at,
  };
}

export async function updateAdminUser(id: string, body: Partial<AdminUserDoc>) {
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  updateData.updated_at = new Date().toISOString();

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update(updateData)
    .eq("id", id);

  if (profileError) throw profileError;

  if (body.role) {
    const { error: deleteRoleError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", id);
    if (deleteRoleError) throw deleteRoleError;
    const { error: insertRoleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: id,
      role: body.role,
    });
    if (insertRoleError) throw insertRoleError;
  }

  if (body.email || body.name) {
    const authUpdate: { email?: string; user_metadata?: { full_name: string } } = {};
    if (body.email) authUpdate.email = body.email;
    if (body.name) authUpdate.user_metadata = { full_name: body.name };

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdate);
    if (authError) throw authError;
  }

  return { id, ...body };
}

export async function deleteAdminUser(id: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;
  return true;
}

/**
 * ADMIN MEDIA
 */

export async function listAdminMedia(): Promise<AdminMediaDoc[]> {
  const { data, error } = await supabaseAdmin
    .from("media_library")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((m) => ({
    id: m.id,
    title: m.title || "",
    url: m.url,
    type: (m.type as any) || "image",
    tags: m.tags || "",
    attribution: m.attribution || "",
    createdAt: m.created_at || new Date().toISOString(),
    updatedAt: m.updated_at || new Date().toISOString(),
    storage_path: m.storage_path,
    file_size: m.file_size,
    mime_type: m.mime_type,
  }));
}

export async function createAdminMedia(body: Partial<AdminMediaDoc>) {
  if (!body.url) throw new Error("URL is required");

  const insertData: any = {
    url: body.url,
  };
  if (body.title !== undefined) insertData.title = body.title;
  if (body.type !== undefined) insertData.type = body.type;
  if (body.tags !== undefined) insertData.tags = body.tags;
  if (body.attribution !== undefined) insertData.attribution = body.attribution;

  // Storage fields
  if ((body as any).storage_path) insertData.storage_path = (body as any).storage_path;
  if ((body as any).file_size) insertData.file_size = (body as any).file_size;
  if ((body as any).mime_type) insertData.mime_type = (body as any).mime_type;

  const { data, error } = await supabaseAdmin
    .from("media_library")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title || "",
    url: data.url,
    type: (data.type as any) || "image",
    tags: data.tags || "",
    attribution: data.attribution || "",
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
    storage_path: data.storage_path,
    file_size: data.file_size,
    mime_type: data.mime_type,
  };
}

export async function updateAdminMedia(id: string, body: Partial<AdminMediaDoc>) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.url !== undefined) updateData.url = body.url;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.attribution !== undefined) updateData.attribution = body.attribution;

  const { data, error } = await supabaseAdmin
    .from("media_library")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title || "",
    url: data.url,
    type: (data.type as any) || "image",
    tags: data.tags || "",
    attribution: data.attribution || "",
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
}

export async function deleteAdminMedia(id: string) {
  const { error } = await supabaseAdmin.from("media_library").delete().eq("id", id);

  if (error) throw error;
  return true;
}
