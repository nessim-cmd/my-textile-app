import { currentUser, User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import UserDialog from "./UserDialog";
import { UserRow } from "@/components/UserRow";
import Wrapper from "@/components/Wrapper";

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
      const usersResponse = await fetch(
        `https://api.clerk.com/v1/users?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        }
      );
      if (!usersResponse.ok) throw new Error(`Failed to fetch users: ${await usersResponse.text()}`);
      const users: User[] = await usersResponse.json();
      console.log("Existing users:", users);

      const invitationsResponse = await fetch(
        `https://api.clerk.com/v1/invitations?email_address=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        }
      );
      if (!invitationsResponse.ok) throw new Error(`Failed to fetch invitations: ${await invitationsResponse.text()}`);
      const invitations = await invitationsResponse.json();
      console.log("Existing invitations:", invitations);

      for (const inv of invitations) {
        if (inv.status === "pending" && inv.email_address === email) {
          await fetch(`https://api.clerk.com/v1/invitations/${inv.id}/revoke`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          });
          console.log(`Revoked invitation ${inv.id}`);
        }
      }

      const response = await fetch("https://api.clerk.com/v1/invitations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          public_metadata: { role },
          redirect_url: "https://mstailors.vercel.app/sign-in",
        }),
      });
      if (!response.ok) throw new Error(`Failed to create invitation: ${await response.text()}`);
      const invitation = await response.json();
      console.log("Invitation created:", invitation);

      await prisma.user.upsert({
        where: { email },
        update: { clerkUserId: invitation.id, name, role },
        create: { clerkUserId: invitation.id, email, name, role },
      });
      console.log("User added to database with invitation ID:", invitation.id);

      redirect("/admin/users");
    } catch (error) {
      console.error("Error in handleAddUser:", error);
      throw error;
    }
  }

  async function handleDeleteUser(userId: string) {
    "use server";
    console.log("Attempting to delete user with ID:", userId);

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found in database");

      if (user.clerkUserId) {
        if (user.clerkUserId.startsWith("user_")) {
          const deleteResponse = await fetch(`https://api.clerk.com/v1/users/${user.clerkUserId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          });
          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            const errorData = JSON.parse(errorText);
            if (errorData.errors && errorData.errors[0].code === "resource_not_found") {
              console.log(`Clerk user ${user.clerkUserId} not found, proceeding with Prisma deletion`);
            } else {
              throw new Error(`Failed to delete Clerk user: ${errorText}`);
            }
          } else {
            console.log("Clerk user deleted:", user.clerkUserId);
          }
        } else if (user.clerkUserId.startsWith("inv_")) {
          const revokeResponse = await fetch(`https://api.clerk.com/v1/invitations/${user.clerkUserId}/revoke`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          });
          if (!revokeResponse.ok) {
            const errorText = await revokeResponse.text();
            const errorData = JSON.parse(errorText);
            if (errorData.errors && errorData.errors[0].code === "invitation_already_revoked") {
              console.log("Invitation already revoked, proceeding:", user.clerkUserId);
            } else {
              throw new Error(`Failed to revoke invitation: ${errorText}`);
            }
          } else {
            console.log("Invitation revoked:", user.clerkUserId);
          }
        }
      } else {
        console.log("No clerkUserId found for user, proceeding with Prisma deletion");
      }

      await prisma.user.delete({ where: { id: userId } });
      console.log("User deleted from Prisma with ID:", userId);

      redirect("/admin/users");
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
      throw error;
    }
  }

  return (
    <Wrapper>
      <div className="p-6">
        <h1 className="text-3xl mb-4 font-bold">User Management</h1>
        <UserDialog onAdd={handleAddUser} />
        <table className="w-full border-collapse mt-6 rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} onDelete={handleDeleteUser} />
            ))}
          </tbody>
        </table>
      </div>
    </Wrapper>
  );
}