import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Assuming Prisma Client

const prisma = new PrismaClient();

// IMPORTANT: Add Authentication/Authorization check here!
// This is a destructive action and should only be allowed for admins.
// Example (replace with your actual auth logic):
// const verifyAdmin = async (request: Request) => {
//   // Your logic to check if the request comes from an authenticated admin user
//   // e.g., check session, token, etc.
//   // For now, we'll just return true for debug purposes, but THIS IS INSECURE FOR PRODUCTION.
//   console.warn("Auth check skipped in DELETE /api/users/[userId] for debugging purposes.");
//   return true;
// };


export async function DELETE(
  request: Request,
  context: { params: { userId: string } }
) {
  // --- Authentication Check (Uncomment and implement!) ---
  // const isAdmin = await verifyAdmin(request);
  // if (!isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  // }
  // --- End Auth Check ---

  const userId = parseInt(context.params.userId, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    console.log(`Attempting to delete user with ID: ${userId}`);

    // --- Delete User ---
    // Be aware of cascading deletes or related data!
    // If you have relations (e.g., Payments, Subscriptions linked to User),
    // deleting the user might fail due to foreign key constraints,
    // or it might cascade and delete related records depending on your schema setup.
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`Successfully deleted user: ${deletedUser.email} (ID: ${userId})`);
    return NextResponse.json({ message: 'User deleted successfully', userId: deletedUser.id }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting user ID ${userId}:`, error);

    // Handle specific Prisma errors (e.g., user not found)
    if (error.code === 'P2025') { // Prisma code for "Record to delete does not exist."
       return NextResponse.json({ error: `User with ID ${userId} not found.` }, { status: 404 });
    }
     // Handle foreign key constraint errors (if user deletion is blocked by related data)
    if (error.code === 'P2014' || error.code === 'P2003' ) { // Prisma codes for relation constraint violations
       console.error(`Deletion failed due to related records for user ID ${userId}.`);
       return NextResponse.json({
         error: `Cannot delete user ID ${userId} due to existing related records (e.g., payments, subscriptions). Manual cleanup might be required.`,
         details: error.message
       }, { status: 409 }); // 409 Conflict is appropriate here
    }

    return NextResponse.json({ error: 'Failed to delete user', details: error.message || 'Unknown error' }, { status: 500 });
  } finally {
    // Disconnect Prisma client if necessary in serverless environments
    // await prisma.$disconnect();
  }
}

// Optional: Add a handler for GET, PUT, etc. if needed for this route,
// otherwise methods other than DELETE will result in a 405 Method Not Allowed.