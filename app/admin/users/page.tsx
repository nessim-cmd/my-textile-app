import { currentUser, User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import UserDialog from "./UserDialog";

export default async function AdminUsersPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Sync admin user to Prisma
  const dbUser = await prisma.user.findUnique({ where: { clerkUserId: clerkUser.id } });
  if (!dbUser) {
    const email = clerkUser.emailAddresses[0].emailAddress;
    await prisma.user.upsert({
      where: { clerkUserId: clerkUser.id },
      update: { email, name: clerkUser.firstName || "Admin", role: "ADMIN" },
      create: { clerkUserId: clerkUser.id, email, name: clerkUser.firstName || "Admin", role: "ADMIN" },
    });
  } else if (dbUser.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany();

  async function handleAddUser(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "ADMIN" | "COUPEUR" | "CHEF" | "USER";

    console.log("Attempting to add user:", { name, email, role });

    try {
      // Check existing users
      const usersResponse = await fetch(
        `https://api.clerk.com/v1/users?email=${encodeURIComponent(email)}`,
        {
          headers: { "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}` },
        }
      );
      if (!usersResponse.ok) throw new Error(`Failed to fetch users: ${await usersResponse.text()}`);
      const users: User[] = await usersResponse.json();
      console.log("Existing users:", users);

      // Check existing invitations
      const invitationsResponse = await fetch(
        `https://api.clerk.com/v1/invitations?email_address=${encodeURIComponent(email)}`,
        {
          headers: { "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}` },
        }
      );
      if (!invitationsResponse.ok) throw new Error(`Failed to fetch invitations: ${await invitationsResponse.text()}`);
      const invitations = await invitationsResponse.json();
      console.log("Existing invitations:", invitations);

      // Revoke pending invitations
      for (const inv of invitations) {
        if (inv.status === "pending" && inv.email_address === email) {
          await fetch(`https://api.clerk.com/v1/invitations/${inv.id}/revoke`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          });
          console.log(`Revoked invitation ${inv.id}`);
        }
      }

      // Create new invitation
      const response = await fetch("https://api.clerk.com/v1/invitations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          public_metadata: { role }, // Store role in Clerk metadata
          redirect_url: "https://mstailors.vercel.app/sign-in",
        }),
      });
      if (!response.ok) throw new Error(`Failed to create invitation: ${await response.text()}`);
      const invitation = await response.json();
      console.log("Invitation created:", invitation);

      // Add to Prisma (pending user)
      await prisma.user.upsert({
        where: { email },
        update: { clerkUserId: invitation.id, name, role },
        create: { clerkUserId: invitation.id, email, name, role },
      });
      console.log("User added to database with invitation ID:", invitation.id);
    } catch (error) {
      console.error("Error in handleAddUser:", error);
      throw error;
    }

    redirect("/admin/users");
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">User Management</h1>
      <UserDialog onAdd={handleAddUser} />
      <table className="w-full border-collapse mt-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}