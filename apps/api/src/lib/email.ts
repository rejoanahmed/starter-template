export function sendNewListingEmail(roomName: string, roomAddress: string) {
  try {
    const emailTo = "rejoanahmed8@gmail.com";
    const subject = `New Room Listing Created: ${roomName}`;
    const body = `
      A new room listing has been created and is pending approval.

      Room Details:
      - Name: ${roomName}
      - Address: ${roomAddress}
      - Status: Pending Approval

      Please review the listing in the admin panel to approve it.
    `;

    console.log("[EMAIL] Would send email to:", emailTo);
    console.log("[EMAIL] Subject:", subject);
    console.log("[EMAIL] Body:", body);

    return { success: true, message: "Email queued successfully" };
  } catch (error) {
    console.error("[EMAIL] Error sending notification:", error);
    return { success: false, message: "Failed to send email notification" };
  }
}
